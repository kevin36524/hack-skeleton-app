import { Timestamp } from 'firebase-admin/firestore';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { mastra } from '@/src/mastra';
import {
  getEntity,
  getProfile,
  checkCostCap,
  updateIngestJob,
  updateProfileBackfillStatus,
  appendPhase2EntityProgress,
  incrementIngestJobCost,
  insertNote,
} from '../db';
import { stageB } from '../extraction/stage-b';
import { consolidateGraph } from './consolidation';
import type { ListConversationsApiResponse, SearchMessagesApiResponse } from '@/lib/types/api';
import type { JobCall, Note, NoteMessageRecord, Phase2LlmCall } from '../types';

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
const DEFAULT_WINDOW_MONTHS = 12;

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
      lines.push(`[msg id: ${m.id} | ${date}] From: ${m.from.name} <${m.from.email}>`);
      lines.push(`Subject: ${m.subject}`);
      if (m.snippet) lines.push(m.snippet);
      lines.push('');
    }
  }
  return lines.join('\n');
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
  const noteAgent = mastra.getAgent('lifeGraphNoteAgent');
  const toProcess = entityIds.slice(0, MAX_ENTITIES);

  // BUG-02: read backfill window from the profile, not a hardcoded 365 days.
  const profile = await getProfile(uid);
  const windowMonths = profile?.backfillWindowMonths ?? DEFAULT_WINDOW_MONTHS;
  const cutoff = Date.now() - windowMonths * 30 * 24 * 60 * 60 * 1000;
  console.log(`[phase2] backfill window=${windowMonths} months cutoff=${new Date(cutoff).toISOString().slice(0, 10)}`);

  let cappedExit = false;

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

      const idSet = new Set<string>((resp.messages ?? []).map((m) => m.id));
      for (const conv of resp.conversations ?? []) {
        for (const mid of conv.messageIds.slice(-MSGS_PER_CONV)) idSet.add(mid);
      }
      idsToFetch = [...idSet];
      console.log(`[phase2] search: ${resp.messages?.length ?? 0} repr msgs, ${resp.conversations?.length ?? 0} convs → ${idsToFetch.length} ids to batch-fetch`);
    } catch (err) {
      logEntityCall({ ts: Date.now(), method: 'GET', url: searchUrl, status: 'err' });
      console.warn(`[phase2] search failed for ${senderEmail}: ${err}`);
      await appendPhase2EntityProgress(uid, jobId, {
        entityId: eid, email: senderEmail, label: entity.label,
        msgsFetched: 0, notesProduced: 0, relationshipsProduced: 0,
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
        msgsFetched: 0, notesProduced: 0, relationshipsProduced: 0, status: 'done',
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
        msgsFetched: 0, notesProduced: 0, relationshipsProduced: 0, status: 'done',
        apiCalls: entityApiCalls, llmCalls: [],
      });
      continue;
    }

    console.log(`[phase2] ${allMsgs.length} msgs for ${senderEmail} — single-shot LLM call`);

    // ── Step 3: note agent → persist note → Stage B (single-entity path) ──────
    const noteId = `phase2_${eid}`;
    let totalRelationships = 0;

    try {
      const noteInput = buildNoteAgentInput(allMsgs, entity.label, senderEmail, userEmail);
      console.log(`[phase2] calling lifeGraphNoteAgent for ${senderEmail} (${allMsgs.length} msgs)`);
      const noteResult = await noteAgent.generate(noteInput);
      const noteText = (noteResult.text ?? '').trim();
      console.log(`[phase2] noteAgent done len=${noteText.length}`);

      entityLlmCalls.push({ agent: 'noteAgent', batch: 1, promptText: noteInput, responseText: noteText });

      // BUG-06: deliveryTime is the most recent source delivery, not now().
      const messageRecords: NoteMessageRecord[] = allMsgs
        .filter((m) => m.deliveryMs > 0)
        .map((m) => ({ id: m.id, deliveryTime: Timestamp.fromMillis(m.deliveryMs) }));
      const mostRecentMs = messageRecords.length
        ? Math.max(...messageRecords.map((r) => r.deliveryTime.toMillis()))
        : Date.now();

      // Persist note BEFORE Stage B with stageBStatus='pending' (Decision 4).
      const noteDoc: Note = {
        id: noteId,
        sourceMessageId: allMsgs[0]?.id ?? noteId,
        sourceMessageIds: allMsgs.map((m) => m.id),
        messageRecords,
        deliveryTime: Timestamp.fromMillis(mostRecentMs),
        from: { name: entity.label, email: senderEmail },
        subject: `Phase 2 analysis — ${entity.label}`,
        notesText: noteText,
        signals: [],
        contentTier: 'two_stage',
        stageBStatus: noteText ? 'pending' : 'failed',
        stageBProcessedAt: null,
      };
      await insertNote(uid, noteDoc);
      console.log(`[phase2] stored note id=${noteId} stageBStatus=${noteDoc.stageBStatus}`);

      if (noteText) {
        let extractorPrompt = '';
        let extractorResponse = '';
        try {
          const stageBResult = await stageB(uid, eid, [noteId], jobId, { userEmail, userName: entity.label });
          totalRelationships = stageBResult.relationshipsAdded;
          extractorPrompt = stageBResult.extractorPrompt ?? '';
          extractorResponse = stageBResult.extractorResponse ?? '';
          console.log(`[phase2] stageB added ${totalRelationships} relationships for ${senderEmail}`);
        } catch (err) {
          extractorResponse = `(stageB error: ${String(err).slice(0, 500)})`;
          console.warn(`[phase2] stageB error for ${senderEmail}: ${err}`);
        }
        entityLlmCalls.push({
          agent: 'extractorAgent',
          batch: 1,
          promptText: extractorPrompt,
          responseText: extractorResponse,
        });
      } else {
        entityLlmCalls.push({
          agent: 'extractorAgent',
          batch: 1,
          promptText: '',
          responseText: '(skipped — noteAgent returned empty text)',
        });
      }
    } catch (err) {
      console.warn(`[phase2] noteAgent/note-persist error for ${senderEmail}: ${err}`);
    }

    await incrementIngestJobCost(uid, jobId, 0.004);

    await appendPhase2EntityProgress(uid, jobId, {
      entityId: eid,
      email: senderEmail,
      label: entity.label,
      msgsFetched: allMsgs.length,
      notesProduced: 1,
      relationshipsProduced: totalRelationships,
      status: 'done',
      apiCalls: entityApiCalls,
      llmCalls: entityLlmCalls,
    });

    const capped = await checkCostCap(uid, jobId);
    if (capped) {
      console.warn(`[phase2] cost cap hit after entity ${i + 1}`);
      cappedExit = true;
      break;
    }

    const progress = ((i + 1) / toProcess.length) * (1 - COST_RESERVE_FRAC);
    await updateProfileBackfillStatus(uid, { phase: 2, progress });
    console.log(`[phase2] entity ${i + 1}/${toProcess.length} done — ${totalRelationships} relationships, progress=${(progress * 100).toFixed(1)}%`);
  }

  // ── Step 4: consolidation pass (decisions 6 + 7) ───────────────────────────
  // Always run, even on cost-cap exit, so any stubs created mid-loop still get
  // merged into their canonical entities.
  try {
    console.log(`[phase2] running consolidation pass`);
    const summary = await consolidateGraph(uid);
    console.log(
      `[phase2] consolidation done — merged=${summary.stubsMerged} dedup=${summary.duplicatesMerged} resolvedParticipants=${summary.participantsResolved}`
    );
    await updateIngestJob(uid, jobId, { phase2Consolidation: summary });
  } catch (err) {
    console.warn(`[phase2] consolidation error: ${err}`);
  }

  if (cappedExit) {
    console.log(`[phase2] exiting after cost cap — phase 3 will not advance`);
    return;
  }

  console.log(`[phase2] done — processed ${toProcess.length} entities`);
  await updateIngestJob(uid, jobId, { phase: 3 });
}
