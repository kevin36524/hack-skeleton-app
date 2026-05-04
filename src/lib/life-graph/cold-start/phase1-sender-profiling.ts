import { Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { mastra } from '@/src/mastra';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import {
  upsertEntity,
  updateIngestJob,
  updateProfileBackfillStatus,
  incrementIngestJobCost,
  checkCostCap,
  appendPhase1SenderResults,
} from '../db';
import type { Entity, SenderTier, SenderProfilingResult } from '../types';
import type { CandidateSender } from './phase0-structural';
import type { SearchMessagesApiResponse } from '@/lib/types/api';
import type { JobCall } from '../types';


interface SenderProfile {
  entityType: 'person' | 'organization';
  relationshipClass: 'family' | 'work' | 'school' | 'doctor' | 'vendor' | 'service' | 'newsletter' | 'unknown';
  roleLabel: string;
  senderTier: SenderTier;
  confidence: number;
}

export async function phase1SenderProfiling(
  uid: string,
  token: string,
  candidates: CandidateSender[],
  jobId: string,
  userEmail: string,
  logCall?: (c: JobCall) => void
): Promise<string[]> {
  console.log(`[phase1] start uid=${uid} jobId=${jobId} candidates=${candidates.length}`);
  const mailboxId = await getMailboxId(token);
  const classifierAgent = mastra.getAgent('lifeGraphClassifierAgent');
  const entityIds: string[] = [];
  const top200 = candidates.slice(0, 200);
  const pendingResults: SenderProfilingResult[] = [];

  for (let i = 0; i < top200.length; i++) {
    const sender = top200[i];
    console.log(`[phase1] profiling sender ${i + 1}/${top200.length} email=${sender.email} score=${sender.compositeScore}`);

    const searchQuery = `from:${sender.email}+offset:0+count:10`;
    const searchUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${searchQuery}`;
    let emailSamples: Array<{ subject: string; snippet: string }> = [];
    let fetchFailed = false;
    try {
      const resp = await yahooGet<SearchMessagesApiResponse>(token, searchUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: searchUrl, status: 200 });
      emailSamples = (resp.messages ?? []).slice(0, 10).map((m) => ({
        subject: m.headers?.subject ?? '(no subject)',
        snippet: (m.snippet ?? '').slice(0, 120),
      }));
      console.log(`[phase1] fetched ${emailSamples.length} messages for ${sender.email}`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: searchUrl, status: 'err' });
      console.warn(`[phase1] failed to fetch messages for ${sender.email}: ${err}`);
      fetchFailed = true;
    }

    const subjectLines = emailSamples
      .map((s) => `- ${s.subject}: ${s.snippet}`)
      .join('\n') || '(could not fetch messages)';
    const ownerLine = userEmail ? `Mailbox owner: ${userEmail}\n` : '';
    const promptText = `${ownerLine}Sender: ${sender.name} <${sender.email}>\n\nRecent emails:\n${subjectLines}`;

    let profile: SenderProfile | null = null;
    let llmResponse = '';
    let llmError = '';
    let parseFailed = false;
    try {
      const result = await classifierAgent.generate(promptText);
      const text = result.text ?? '';
      llmResponse = text;
      profile = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim()) as SenderProfile;
      console.log(`[phase1] classified ${sender.email} → tier=${profile.senderTier} confidence=${profile.confidence} label="${profile.roleLabel}"`);
    } catch (err) {
      llmError = String(err).slice(0, 200);
      console.warn(`[phase1] LLM classify failed for ${sender.email}: ${err}`);
      parseFailed = true;
    }

    const result: SenderProfilingResult = {
      email: sender.email,
      name: sender.name,
      compositeScore: sender.compositeScore,
      emailSamples: emailSamples.slice(0, 5),
      promptText,
      llmResponse,
      decision: 'rejected',
    };

    if (fetchFailed) {
      result.rejectReason = 'fetch_failed';
    } else if (parseFailed) {
      result.rejectReason = llmResponse ? 'json_parse_failed' : 'llm_error';
      result.errorMessage = llmError || undefined;
    } else if (profile && profile.confidence >= 0.5) {
      result.decision = 'accepted';
      result.profile = {
        entityType: profile.entityType,
        relationshipClass: profile.relationshipClass,
        roleLabel: profile.roleLabel,
        senderTier: profile.senderTier,
        confidence: profile.confidence,
      };

      const now = Timestamp.now();
      const eid = randomUUID();
      const entity: Entity = {
        id: eid,
        type: profile.entityType,
        drawer: 'people_orgs',
        label: profile.roleLabel,
        aliases: [sender.name].filter(Boolean),
        emailAddresses: [sender.email],
        sourceMessageIds: [],
        firstSeen: now,
        lastUpdated: now,
        pinned: false,
        pinnedAt: null,
        entryClock: null,
        decayClock: null,
        relationshipClass: profile.relationshipClass,
        senderClass: profile.senderTier,
        senderClassConfidence: profile.confidence,
        payload: {},
        schemaVersion: 1,
      };
      await upsertEntity(uid, entity);
      console.log(`[phase1] upserted entity eid=${eid} for ${sender.email}`);

      entityIds.push(eid);
    } else {
      result.rejectReason = 'confidence_too_low';
      if (profile) {
        result.profile = {
          entityType: profile.entityType,
          relationshipClass: profile.relationshipClass,
          roleLabel: profile.roleLabel,
          senderTier: profile.senderTier,
          confidence: profile.confidence,
        };
      }
    }

    pendingResults.push(result);
    await incrementIngestJobCost(uid, jobId, 0.001);

    // Flush pending results to Firestore every 10 senders
    if (pendingResults.length >= 10) {
      await appendPhase1SenderResults(uid, jobId, pendingResults.splice(0));
    }

    if ((i + 1) % 10 === 0) {
      const capped = await checkCostCap(uid, jobId);
      if (capped) {
        console.warn(`[phase1] cost cap hit at sender ${i + 1}, stopping`);
        if (pendingResults.length > 0) {
          await appendPhase1SenderResults(uid, jobId, pendingResults.splice(0));
        }
        break;
      }
    }
  }

  // Flush any remaining results
  if (pendingResults.length > 0) {
    await appendPhase1SenderResults(uid, jobId, pendingResults.splice(0));
  }

  console.log(`[phase1] done — created ${entityIds.length} entities`);
  await updateIngestJob(uid, jobId, { phase: 2 });
  await updateProfileBackfillStatus(uid, { phase: 2 });

  return entityIds;
}
