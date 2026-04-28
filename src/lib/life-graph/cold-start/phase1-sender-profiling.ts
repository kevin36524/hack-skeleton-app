import { Timestamp } from 'firebase-admin/firestore';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { randomUUID } from 'crypto';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import {
  upsertEntity,
  updateIngestJob,
  updateProfileBackfillStatus,
  incrementIngestJobCost,
  checkCostCap,
} from '../db';
import { writeOrSupersedeFact } from '../supersedes';
import type { Entity, SenderTier } from '../types';
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
  logCall?: (c: JobCall) => void
): Promise<string[]> {
  console.log(`[phase1] start uid=${uid} jobId=${jobId} candidates=${candidates.length}`);
  const mailboxId = await getMailboxId(token);
  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
  const entityIds: string[] = [];
  const top200 = candidates.slice(0, 200);

  for (let i = 0; i < top200.length; i++) {
    const sender = top200[i];
    console.log(`[phase1] profiling sender ${i + 1}/${top200.length} email=${sender.email} score=${sender.compositeScore}`);

    const searchQuery = `from:${sender.email}+offset:0+count:10`;
    const searchUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${searchQuery}`;
    let subjectLines = '';
    try {
      const resp = await yahooGet<SearchMessagesApiResponse>(token, searchUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: searchUrl, status: 200 });
      subjectLines = (resp.messages ?? [])
        .slice(0, 10)
        .map((m) => `- ${m.headers?.subject ?? '(no subject)'}: ${m.snippet?.slice(0, 100) ?? ''}`)
        .join('\n');
      console.log(`[phase1] fetched ${resp.messages?.length ?? 0} messages for ${sender.email}`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: searchUrl, status: 'err' });
      console.warn(`[phase1] failed to fetch messages for ${sender.email}: ${err}`);
      subjectLines = '(could not fetch messages)';
    }

    const prompt = `Sender: ${sender.name} <${sender.email}>\n\nRecent emails:\n${subjectLines}`;

    let profile: SenderProfile | null = null;
    try {
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: `You are classifying an email sender for a personal assistant. Given a sample of recent emails from one sender, return a JSON object with these exact fields:
- entityType: "person" | "organization"
- relationshipClass: "family" | "work" | "school" | "doctor" | "vendor" | "service" | "newsletter" | "unknown"
- roleLabel: short human label, e.g. "Boss at Stripe", "Kid's school", "Amazon orders"
- senderTier: "important" | "conditional" | "junk"
- confidence: 0.0 to 1.0

Respond with only valid JSON, no markdown fences.`,
        prompt,
      });
      profile = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim()) as SenderProfile;
      console.log(`[phase1] classified ${sender.email} → tier=${profile.senderTier} confidence=${profile.confidence} label="${profile.roleLabel}"`);
    } catch (err) {
      console.warn(`[phase1] LLM classify failed for ${sender.email}: ${err}`);
    }

    if (profile && profile.confidence >= 0.5) {
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
        payload: {},
        schemaVersion: 1,
      };

      await upsertEntity(uid, entity);
      console.log(`[phase1] upserted entity eid=${eid} for ${sender.email}`);

      await writeOrSupersedeFact(uid, {
        entityId: eid,
        slot: 'sender_class',
        factType: 'stable',
        value: profile.senderTier,
        status: 'current',
        authority: 'email_derived',
        confidence: profile.confidence,
        sourceMessageIds: [],
        firstSeen: now,
        lastVerified: now,
        effectiveTime: now,
        drawer: 'people_orgs',
      });

      entityIds.push(eid);
    } else {
      console.log(`[phase1] skipping entity for ${sender.email} — confidence too low or parse failed`);
    }

    await incrementIngestJobCost(uid, jobId, 0.001);

    if ((i + 1) % 10 === 0) {
      const capped = await checkCostCap(uid, jobId);
      if (capped) {
        console.warn(`[phase1] cost cap hit at sender ${i + 1}, stopping`);
        break;
      }
    }
  }

  console.log(`[phase1] done — created ${entityIds.length} entities`);
  await updateIngestJob(uid, jobId, { phase: 2 });
  await updateProfileBackfillStatus(uid, { phase: 2 });

  return entityIds;
}
