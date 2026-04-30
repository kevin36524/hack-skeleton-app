import { Timestamp } from 'firebase-admin/firestore';
import { mastra } from '@/src/mastra';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import type { JobCall } from '../types';

import {
  getNote,
  upsertEntity,
  markNoteStageB,
  updateIngestJob,
  updateProfileBackfillStatus,
  incrementIngestJobCost,
  updatePhase4Summary,
} from '../db';
import { stageA } from '../extraction/stage-a';
import { resolvePersonOrOrg, resolveEvent } from '../extraction/identity-resolution';
import { randomUUID } from 'crypto';
import { convert } from 'html-to-text';
import type { ListConversationsApiResponse, FullMessageBodyResponse } from '@/lib/types/api';
import type { Entity } from '../types';

const STAGE_B_BATCH_SIZE = 15;

export async function phase4TopOfMind(
  uid: string,
  token: string,
  jobId: string,
  userEmail: string,
  logCall?: (c: JobCall) => void
): Promise<void> {
  console.log(`[phase4] start uid=${uid} jobId=${jobId}`);
  const mailboxId = await getMailboxId(token);
  const topOfMindAgent = mastra.getAgent('lifeGraphTopOfMindAgent');
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  function internalDateMs(internalDate: string | undefined): number {
    if (!internalDate) return 0;
    const n = parseInt(internalDate, 10);
    return isNaN(n) ? 0 : n * 1000;
  }

  const foldersUrl = `/mailboxes/@.id==${mailboxId}/folders`;
  const foldersResp = await yahooGet<{ folders: Array<{ id: string; name: string; types?: string[] }> }>(
    token,
    foldersUrl
  );
  logCall?.({ ts: Date.now(), method: 'GET', url: foldersUrl, status: 200 });
  const inboxFolder = foldersResp.folders.find(
    (f: { types?: string[]; name: string }) =>
      f.types?.some((t) => t.toUpperCase() === 'INBOX') || f.name === 'Inbox'
  );
  if (!inboxFolder) {
    await finalize(uid, jobId);
    return;
  }

  interface InboxMsg {
    id: string;
    from: { name: string; email: string };
    subject: string;
    snippet: string;
    internalDate?: string;
  }

  const allMessages: InboxMsg[] = [];

  let offset = 0;
  while (true) {
    const query = `folderId:${inboxFolder.id}+groupBy:conversationId+offset:${offset}+count:100`;
    const pageUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, pageUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: pageUrl, status: 200 });
      if (!resp.messages || resp.messages.length === 0) break;

      for (const msg of resp.messages) {
        const internalDate = msg.headers?.internalDate;
        const msgMs = internalDateMs(internalDate);
        if (msgMs && msgMs < fourteenDaysAgo.getTime()) continue;
        allMessages.push({
          id: msg.id,
          from: { name: msg.headers?.from?.[0]?.name ?? '', email: msg.headers?.from?.[0]?.email ?? '' },
          subject: msg.headers?.subject ?? '',
          snippet: msg.snippet ?? '',
          internalDate,
        });
      }
      offset += 100;
      if (offset > 1000) break;
    } catch {
      break;
    }
  }

  // Stage A for non-skip messages
  const noteIds: string[] = [];
  for (const msg of allMessages) {
    try {
      let body = msg.snippet;
      const bodyUrl = `/mailboxes/@.id==${mailboxId}/messages/@.id==${msg.id}/content/simplebody/full`;
      try {
        const bodyResp = await yahooGet<FullMessageBodyResponse>(token, bodyUrl);
        logCall?.({ ts: Date.now(), method: 'GET', url: bodyUrl, status: 200 });
        const rawText = bodyResp.simpleBody?.text;
        const rawHtml = bodyResp.simpleBody?.html;
        body = rawText ?? (rawHtml ? convert(rawHtml, { wordwrap: false }) : msg.snippet);
      } catch {
        logCall?.({ ts: Date.now(), method: 'GET', url: bodyUrl, status: 'err' });
      }

      const deliveryMs = internalDateMs(msg.internalDate);
      const deliveryTime = deliveryMs ? new Date(deliveryMs) : new Date();
      const { noteId, contentTier } = await stageA(uid, {
        id: msg.id,
        deliveryTime,
        from: msg.from,
        subject: msg.subject,
        body,
      }, userEmail);
      if (contentTier !== 'skip') noteIds.push(noteId);
    } catch (err) {
      console.warn(`[phase4] Stage A error for msg ${msg.id}:`, err);
    }
  }

  let totalCommitments = 0;
  let totalEvents = 0;

  for (let b = 0; b < noteIds.length; b += STAGE_B_BATCH_SIZE) {
    const batch = noteIds.slice(b, b + STAGE_B_BATCH_SIZE);
    const notes = await Promise.all(batch.map((nid) => getNote(uid, nid)));
    const validNotes = notes.filter((n) => n !== null);

    const ownerHeader = userEmail ? `Mailbox owner: ${userEmail}\n\n` : '';
    const noteContent = ownerHeader + validNotes
      .map(
        (n) =>
          `[note ${n!.sourceMessageId} | ${n!.deliveryTime.toDate().toISOString().slice(0, 10)} | from ${n!.from.name} <${n!.from.email}>]\n${n!.notesText}`
      )
      .join('\n\n');

    if (!noteContent.trim()) continue;

    try {
      const response = await topOfMindAgent.generate(noteContent);
      const raw = response.text ?? '{}';
      let extracted: {
        commitments?: Array<{ label: string; dueDate?: string; owedByUser?: boolean; owedToEntityLabel?: string }>;
        events?: Array<{ label: string; startTime?: string; participantEmails?: string[] }>;
      } = {};

      try {
        extracted = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
      } catch { continue; }

      const Ts = Timestamp;
      const nowTs = Ts.now();

      for (const c of extracted.commitments ?? []) {
        const eid = randomUUID();
        const dueDate = c.dueDate ? Ts.fromDate(new Date(c.dueDate)) : undefined;
        const entryClock = dueDate
          ? Ts.fromDate(new Date(Math.max(Date.now(), dueDate.toMillis() - 14 * 24 * 60 * 60 * 1000)))
          : null;
        const decayClock = dueDate
          ? Ts.fromDate(new Date(dueDate.toMillis() + 3 * 24 * 60 * 60 * 1000))
          : null;

        const entity: Entity = {
          id: eid,
          type: 'commitment',
          drawer: 'commitments',
          label: c.label,
          aliases: [],
          emailAddresses: [],
          sourceMessageIds: validNotes.map((n) => n!.sourceMessageId),
          firstSeen: nowTs,
          lastUpdated: nowTs,
          pinned: false,
          pinnedAt: null,
          entryClock,
          decayClock,
          dueDate,
          resolvedAt: null,
          owedBy: c.owedByUser ? uid : c.owedToEntityLabel,
          owedTo: c.owedByUser ? c.owedToEntityLabel : uid,
          payload: {},
          schemaVersion: 1,
        };
        await upsertEntity(uid, entity);
        totalCommitments++;
      }

      for (const e of extracted.events ?? []) {
        const startDate = e.startTime ? new Date(e.startTime) : null;
        const participantEmails = e.participantEmails ?? [];

        let eid: string | null = startDate
          ? await resolveEvent(uid, e.label, startDate, participantEmails)
          : null;

        if (!eid) {
          eid = randomUUID();
          const startTs = startDate ? Ts.fromDate(startDate) : undefined;
          const entryClock = startTs
            ? Ts.fromDate(new Date(Math.max(Date.now(), startTs.toMillis() - 14 * 24 * 60 * 60 * 1000)))
            : null;
          const decayClock = startTs
            ? Ts.fromDate(new Date(startTs.toMillis() + 2 * 24 * 60 * 60 * 1000))
            : null;

          const resolvedIds = await Promise.all(
            participantEmails.map((email) => resolvePersonOrOrg(uid, email, email))
          );

          const entity: Entity = {
            id: eid,
            type: 'event',
            drawer: 'commitments',
            label: e.label,
            aliases: [],
            emailAddresses: [],
            sourceMessageIds: validNotes.map((n) => n!.sourceMessageId),
            firstSeen: nowTs,
            lastUpdated: nowTs,
            pinned: false,
            pinnedAt: null,
            entryClock,
            decayClock,
            startTime: startTs,
            participantIds: resolvedIds.filter((id): id is string => id !== null),
            payload: {},
            schemaVersion: 1,
          };
          await upsertEntity(uid, entity);
          totalEvents++;
        }
      }

      await Promise.all(validNotes.map((n) => markNoteStageB(uid, n!.id, 'processed', [])));
      await incrementIngestJobCost(uid, jobId, 0.003);
    } catch (err) {
      console.warn(`[phase4] Stage B error for batch ${b}:`, err);
    }
  }

  await updatePhase4Summary(uid, jobId, {
    messagesScanned: allMessages.length,
    notesProduced: noteIds.length,
    commitmentsFound: totalCommitments,
    eventsFound: totalEvents,
  });

  await finalize(uid, jobId);
}

async function finalize(uid: string, jobId: string) {
  await updateIngestJob(uid, jobId, { phase: 4, status: 'completed', completedAt: Timestamp.now() });
  await updateProfileBackfillStatus(uid, { phase: 4, completedAt: Timestamp.now(), progress: 1 });
}
