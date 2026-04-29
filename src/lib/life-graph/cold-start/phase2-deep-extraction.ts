import { Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { mastra } from '@/src/mastra';
import {
  getEntity,
  checkCostCap,
  updateIngestJob,
  updateProfileBackfillStatus,
  appendPhase2EntityProgress,
  incrementIngestJobCost,
  upsertEntity,
  insertNote,
} from '../db';
import { writeOrSupersedeFact } from '../supersedes';
import { resolvePersonOrOrg, resolveEvent } from '../extraction/identity-resolution';
import type { ListConversationsApiResponse, SearchMessagesApiResponse } from '@/lib/types/api';
import type { JobCall, Entity, Note, Phase2LlmCall } from '../types';

// internalDate from Yahoo API is Unix seconds as a string.
function internalDateMs(v: string | undefined): number {
  if (!v) return 0;
  const n = parseInt(v, 10);
  return isNaN(n) ? 0 : n * 1000;
}

const MAX_ENTITIES        = parseInt(process.env.LIFE_GRAPH_PHASE2_MAX_ENTITIES ?? '50', 10);
const SEARCH_CONV_COUNT   = 20;  // conversations to fetch per entity
const MSGS_PER_CONV       = 3;   // max message IDs to pull per conversation
const COST_RESERVE_FRAC   = 0.2;

interface MsgRecord {
  id: string;
  conversationId: string;
  deliveryMs: number;
  from: { name: string; email: string };
  subject: string;
  snippet: string;
}

function buildNoteAgentInput(msgs: MsgRecord[], entityLabel: string, entityEmail: string, userEmail: string): string {
  const byConv = new Map<string, MsgRecord[]>();
  for (const m of msgs) {
    if (!byConv.has(m.conversationId)) byConv.set(m.conversationId, []);
    byConv.get(m.conversationId)!.push(m);
  }

  const lines: string[] = [];
  if (userEmail) lines.push(`Mailbox owner: ${userEmail}`);
  lines.push(`Sender: ${entityLabel} <${entityEmail}>`, '');
  for (const convMsgs of byConv.values()) {
    lines.push(`=== Thread (${convMsgs.length} message${convMsgs.length > 1 ? 's' : ''}) ===`);
    for (const m of convMsgs) {
      const date = m.deliveryMs ? new Date(m.deliveryMs).toISOString().slice(0, 10) : 'unknown';
      lines.push(`[${date}] From: ${m.from.name} <${m.from.email}>`);
      lines.push(`Subject: ${m.subject}`);
      if (m.snippet) lines.push(m.snippet);
      lines.push('');
    }
  }
  return lines.join('\n');
}

async function writeExtractedFacts(
  uid: string,
  entityId: string,
  rawJson: string,
  sourceMsgs: MsgRecord[],
): Promise<string[]> {
  const now = Timestamp.now();
  const sourceMessageIds = sourceMsgs.map((m) => m.id);

  let extracted: {
    stableFactUpdates?: Array<{ slot: string; value: unknown }>;
    timeSensitiveFacts?: Array<{ slot: string; value: unknown; sourceNoteId?: string }>;
    commitments?: Array<{ label: string; dueDate?: string; owedByUser?: boolean; owedToEntityLabel?: string }>;
    events?: Array<{ label: string; startTime?: string; participantEmails?: string[] }>;
  } = {};

  try {
    extracted = JSON.parse(rawJson.replace(/```json\n?|\n?```/g, '').trim());
    console.log(`[phase2] parsed: stable=${extracted.stableFactUpdates?.length ?? 0} timeSensitive=${extracted.timeSensitiveFacts?.length ?? 0} commitments=${extracted.commitments?.length ?? 0} events=${extracted.events?.length ?? 0}`);
  } catch (err) {
    console.warn(`[phase2] JSON parse failed for entityId=${entityId}: ${err}`);
    return [];
  }

  const factIds: string[] = [];

  for (const sf of extracted.stableFactUpdates ?? []) {
    console.log(`[phase2] writing stable fact slot=${sf.slot} entityId=${entityId}`);
    const fid = await writeOrSupersedeFact(uid, {
      entityId,
      slot: sf.slot,
      factType: 'stable',
      value: sf.value,
      status: 'current',
      authority: 'email_derived',
      confidence: 0.8,
      sourceMessageIds,
      firstSeen: now,
      lastVerified: now,
      effectiveTime: now,
      drawer: 'people_orgs',
    });
    factIds.push(fid);
  }

  for (const tsf of extracted.timeSensitiveFacts ?? []) {
    const sourceMsg = tsf.sourceNoteId ? sourceMsgs.find((m) => m.id === tsf.sourceNoteId) : null;
    const effectiveTime = sourceMsg
      ? Timestamp.fromDate(new Date(sourceMsg.deliveryMs || Date.now()))
      : now;
    console.log(`[phase2] writing time_sensitive fact slot=${tsf.slot} entityId=${entityId}`);
    const fid = await writeOrSupersedeFact(uid, {
      entityId,
      slot: tsf.slot,
      factType: 'time_sensitive',
      value: tsf.value,
      status: 'current',
      authority: 'email_derived',
      confidence: 0.85,
      sourceMessageIds: tsf.sourceNoteId ? [tsf.sourceNoteId] : sourceMessageIds,
      firstSeen: now,
      lastVerified: now,
      effectiveTime,
      drawer: 'commitments',
    });
    factIds.push(fid);
  }

  for (const c of extracted.commitments ?? []) {
    const eid = randomUUID();
    console.log(`[phase2] creating commitment entity label="${c.label}" eid=${eid}`);
    const entity: Entity = {
      id: eid, type: 'commitment', drawer: 'commitments',
      label: c.label, aliases: [], emailAddresses: [],
      sourceMessageIds,
      firstSeen: now, lastUpdated: now,
      pinned: false, pinnedAt: null, entryClock: null, decayClock: null,
      dueDate: c.dueDate ? Timestamp.fromDate(new Date(c.dueDate)) : undefined,
      resolvedAt: null,
      owedBy: c.owedByUser ? uid : c.owedToEntityLabel,
      owedTo: c.owedByUser ? c.owedToEntityLabel : uid,
      payload: {}, schemaVersion: 1,
    };
    await upsertEntity(uid, entity);
  }

  for (const e of extracted.events ?? []) {
    const startDate = e.startTime ? new Date(e.startTime) : null;
    const participantEmails = e.participantEmails ?? [];

    let eid: string | null = startDate
      ? await resolveEvent(uid, e.label, startDate, participantEmails)
      : null;

    if (!eid) {
      eid = randomUUID();
      console.log(`[phase2] creating event entity label="${e.label}" eid=${eid}`);
      const resolvedParticipantIds = await Promise.all(
        participantEmails.map((email) => resolvePersonOrOrg(uid, email, email))
      );
      const entity: Entity = {
        id: eid, type: 'event', drawer: 'commitments',
        label: e.label, aliases: [], emailAddresses: [],
        sourceMessageIds,
        firstSeen: now, lastUpdated: now,
        pinned: false, pinnedAt: null, entryClock: null, decayClock: null,
        startTime: startDate ? Timestamp.fromDate(startDate) : undefined,
        participantIds: resolvedParticipantIds.filter((id): id is string => id !== null),
        payload: {}, schemaVersion: 1,
      };
      await upsertEntity(uid, entity);
    }
  }

  return factIds;
}

export async function phase2DeepExtraction(
  uid: string,
  token: string,
  entityIds: string[],
  jobId: string,
  userEmail: string,
  logCall?: (c: JobCall) => void
): Promise<void> {
  console.log(`[phase2] start uid=${uid} jobId=${jobId} entities=${entityIds.length} max=${MAX_ENTITIES}`);
  const mailboxId = await getMailboxId(token);
  const noteAgent      = mastra.getAgent('lifeGraphNoteAgent');
  const extractorAgent = mastra.getAgent('lifeGraphExtractorAgent');
  const toProcess = entityIds.slice(0, MAX_ENTITIES);
  const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < toProcess.length; i++) {
    const eid = toProcess[i];
    const entity = await getEntity(uid, eid);
    if (!entity || entity.emailAddresses.length === 0) {
      console.log(`[phase2] skipping eid=${eid} — no entity or email`);
      continue;
    }

    const senderEmail = entity.emailAddresses[0];
    console.log(`[phase2] entity ${i + 1}/${toProcess.length} eid=${eid} email=${senderEmail}`);

    // Per-sender call accumulators — stored in the progress record for UI drill-down.
    const entityApiCalls: JobCall[] = [];
    const entityLlmCalls: Phase2LlmCall[] = [];

    function logEntityCall(call: JobCall) {
      entityApiCalls.push(call);
      logCall?.(call);
    }

    // ── Step 1: search conversations ─────────────────────────────────────────
    const searchQuery = `from:${senderEmail}+groupBy:conversationId+offset:0+count:${SEARCH_CONV_COUNT}`;
    const searchUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${searchQuery}&responseTransform=btd_lm_ios`;
    let idsToFetch: string[] = [];

    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, searchUrl);
      logEntityCall({ ts: Date.now(), method: 'GET', url: searchUrl, status: 200 });

      // One representative message per conversation from resp.messages,
      // plus up to MSGS_PER_CONV additional IDs per conversation from resp.conversations.
      const idSet = new Set<string>((resp.messages ?? []).map((m) => m.id));
      for (const conv of resp.conversations ?? []) {
        for (const mid of conv.messageIds.slice(-MSGS_PER_CONV)) {
          idSet.add(mid);
        }
      }
      idsToFetch = [...idSet];
      console.log(`[phase2] search: ${resp.messages?.length ?? 0} repr msgs, ${resp.conversations?.length ?? 0} convs → ${idsToFetch.length} ids to batch-fetch`);
    } catch (err) {
      logEntityCall({ ts: Date.now(), method: 'GET', url: searchUrl, status: 'err' });
      console.warn(`[phase2] search failed for ${senderEmail}: ${err}`);
      await appendPhase2EntityProgress(uid, jobId, {
        entityId: eid, email: senderEmail, label: entity.label,
        msgsFetched: 0, notesProduced: 0, factsProduced: 0,
        status: 'error', errorMessage: String(err).slice(0, 200),
        apiCalls: entityApiCalls,
        llmCalls: [],
      });
      continue;
    }

    if (idsToFetch.length === 0) {
      console.log(`[phase2] no messages found for ${senderEmail}`);
      await appendPhase2EntityProgress(uid, jobId, {
        entityId: eid, email: senderEmail, label: entity.label,
        msgsFetched: 0, notesProduced: 0, factsProduced: 0, status: 'done',
        apiCalls: entityApiCalls, llmCalls: [],
      });
      continue;
    }

    // ── Step 2: batch fetch full message details (one call per 20 IDs) ────────
    const allMsgs: MsgRecord[] = [];
    for (let b = 0; b < idsToFetch.length; b += 20) {
      const batchIds = idsToFetch.slice(b, b + 20);
      const idParam = batchIds.join('%20');
      const batchUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=id:(${idParam})&responseTransform=btd_lm_ios`;
      try {
        const resp = await yahooGet<SearchMessagesApiResponse>(token, batchUrl);
        logEntityCall({ ts: Date.now(), method: 'GET', url: batchUrl, status: 200 });
        for (const m of resp.messages ?? []) {
          const ms = internalDateMs(m.headers?.internalDate);
          if (ms && ms < cutoff) continue;
          allMsgs.push({
            id: m.id,
            conversationId: m.conversationId ?? m.id,
            deliveryMs: ms,
            from: {
              name: m.headers?.from?.[0]?.name ?? '',
              email: m.headers?.from?.[0]?.email ?? senderEmail,
            },
            subject: m.headers?.subject ?? '',
            snippet: m.snippet ?? '',
          });
        }
        console.log(`[phase2] batch-fetch ids ${b}–${b + batchIds.length - 1}: got ${resp.messages?.length ?? 0} msgs`);
      } catch (err) {
        logEntityCall({ ts: Date.now(), method: 'GET', url: batchUrl, status: 'err' });
        console.warn(`[phase2] batch-fetch error for ${senderEmail} ids ${b}–${b + batchIds.length}: ${err}`);
      }
    }

    if (allMsgs.length === 0) {
      console.log(`[phase2] no messages after cutoff for ${senderEmail}`);
      await appendPhase2EntityProgress(uid, jobId, {
        entityId: eid, email: senderEmail, label: entity.label,
        msgsFetched: 0, notesProduced: 0, factsProduced: 0, status: 'done',
        apiCalls: entityApiCalls, llmCalls: [],
      });
      continue;
    }

    console.log(`[phase2] ${allMsgs.length} msgs for ${senderEmail} — single-shot LLM call`);

    // ── Step 3: note agent → extractor agent, one shot per entity ─────────────
    let totalFacts = 0;
    let noteText = '';
    let raw = '';
    let factIds: string[] = [];

    try {
      const noteInput = buildNoteAgentInput(allMsgs, entity.label, senderEmail, userEmail);
      console.log(`[phase2] calling lifeGraphNoteAgent for ${senderEmail} (${allMsgs.length} msgs)`);
      const noteResult = await noteAgent.generate(noteInput);
      noteText = noteResult.text ?? '';
      console.log(`[phase2] noteAgent done len=${noteText.length}`);

      entityLlmCalls.push({ agent: 'noteAgent', batch: 1, promptText: noteInput, responseText: noteText });

      const extractorInput = `Mailbox owner: ${userEmail}\nEntity: ${entity.label} <${senderEmail}>\n\nEmail analysis:\n${noteText}`;
      console.log(`[phase2] calling lifeGraphExtractorAgent for ${senderEmail}`);
      const extractResult = await extractorAgent.generate(extractorInput);
      raw = extractResult.text ?? '';
      console.log(`[phase2] extractorAgent done len=${raw.length}`);

      entityLlmCalls.push({ agent: 'extractorAgent', batch: 1, promptText: extractorInput, responseText: raw });

      factIds = await writeExtractedFacts(uid, eid, raw, allMsgs);
      totalFacts = factIds.length;
      console.log(`[phase2] ${factIds.length} facts written for ${senderEmail}`);
    } catch (err) {
      console.warn(`[phase2] LLM/extraction error for ${senderEmail}: ${err}`);
    }

    // Always store the note so it's visible in Firestore regardless of extraction outcome
    const noteId = `phase2_${eid}`;
    const noteDoc: Note = {
      id: noteId,
      sourceMessageId: noteId,
      deliveryTime: Timestamp.now(),
      from: { name: entity.label, email: senderEmail },
      subject: `Phase 2 analysis — ${entity.label}`,
      notesText: noteText,
      signals: [],
      contentTier: 'two_stage',
      stageBStatus: noteText ? 'processed' : 'failed',
      stageBProcessedAt: noteText ? Timestamp.now() : null,
      producedFactIds: factIds,
    };
    try {
      await insertNote(uid, noteDoc);
      console.log(`[phase2] stored note noteId=${noteId} stageBStatus=${noteDoc.stageBStatus} for entity=${senderEmail}`);
    } catch (err) {
      console.error(`[phase2] FAILED to store note noteId=${noteId}: ${err}`);
    }

    await incrementIngestJobCost(uid, jobId, 0.004);

    await appendPhase2EntityProgress(uid, jobId, {
      entityId: eid,
      email: senderEmail,
      label: entity.label,
      msgsFetched: allMsgs.length,
      notesProduced: 1,
      factsProduced: totalFacts,
      status: 'done',
      apiCalls: entityApiCalls,
      llmCalls: entityLlmCalls,
    });

    const capped = await checkCostCap(uid, jobId);
    if (capped) {
      console.warn(`[phase2] cost cap hit after entity ${i + 1}`);
      return;
    }

    const progress = ((i + 1) / toProcess.length) * (1 - COST_RESERVE_FRAC);
    await updateProfileBackfillStatus(uid, { phase: 2, progress });
    console.log(`[phase2] entity ${i + 1}/${toProcess.length} done — ${totalFacts} facts, progress=${(progress * 100).toFixed(1)}%`);
  }

  console.log(`[phase2] done — processed ${toProcess.length} entities`);
  await updateIngestJob(uid, jobId, { phase: 3 });
}
