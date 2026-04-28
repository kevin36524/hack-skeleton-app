import { Timestamp } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';
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
  logCall?: (c: JobCall) => void
): Promise<void> {
  const mailboxId = await getMailboxId(token);
  const client = new Anthropic();
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const foldersUrl = `/mailboxes/@.id==${mailboxId}/folders`;
  const foldersResp = await yahooGet<{ folders: Array<{ id: string; name: string; types?: string[] }> }>(
    token,
    foldersUrl
  );
  logCall?.({ ts: Date.now(), method: 'GET', url: foldersUrl, status: 200 });
  const inboxFolder = foldersResp.folders.find(
    (f: { types?: string[]; name: string }) => f.types?.includes('Inbox') || f.name === 'Inbox'
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
        if (internalDate && new Date(internalDate) < fourteenDaysAgo) continue;
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

      const deliveryTime = msg.internalDate ? new Date(msg.internalDate) : new Date();
      const { noteId, contentTier } = await stageA(uid, {
        id: msg.id,
        deliveryTime,
        from: msg.from,
        subject: msg.subject,
        body,
      });
      if (contentTier !== 'skip') noteIds.push(noteId);
    } catch (err) {
      console.warn(`[phase4] Stage A error for msg ${msg.id}:`, err);
    }
  }

  const systemPrompt = `You are a structured-data extractor for a personal assistant's Life Graph.
Given a batch of email notes, focus ONLY on commitments (deadlines, action items, meetings) due within the next 30 days.

Return a JSON object with:
{
  "commitments": [
    {
      "label": "Send Q2 report to Sarah",
      "dueDate": "2026-05-01",
      "owedByUser": true,
      "owedToEntityLabel": "Sarah Chen"
    }
  ],
  "events": [
    {
      "label": "Starbucks meeting with Sarah",
      "startTime": "2026-04-30T10:00:00",
      "participantEmails": ["sarah@stripe.com"]
    }
  ]
}

Rules:
- All datetimes must be ISO 8601 strings. Resolve relative references against each note's deliveryTime.
- Only include items due within 30 days. Omit anything further out or uncertain.
- Return only valid JSON, no markdown.`;

  for (let b = 0; b < noteIds.length; b += STAGE_B_BATCH_SIZE) {
    const batch = noteIds.slice(b, b + STAGE_B_BATCH_SIZE);
    const notes = await Promise.all(batch.map((nid) => getNote(uid, nid)));
    const validNotes = notes.filter((n) => n !== null);

    const noteContent = validNotes
      .map(
        (n) =>
          `[Note ${n!.sourceMessageId} | ${n!.deliveryTime.toDate().toISOString().slice(0, 10)} | From: ${n!.from.name} <${n!.from.email}>]\n${n!.notesText}\nsignals: [${n!.signals.join(', ')}]`
      )
      .join('\n\n');

    if (!noteContent.trim()) continue;

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: noteContent }],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';
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
        }
      }

      await Promise.all(validNotes.map((n) => markNoteStageB(uid, n!.id, 'processed', [])));
      await incrementIngestJobCost(uid, jobId, 0.003);
    } catch (err) {
      console.warn(`[phase4] Stage B error for batch ${b}:`, err);
    }
  }

  await finalize(uid, jobId);
}

async function finalize(uid: string, jobId: string) {
  await updateIngestJob(uid, jobId, { phase: 4, status: 'completed', completedAt: Timestamp.now() });
  await updateProfileBackfillStatus(uid, { phase: 4, completedAt: Timestamp.now(), progress: 1 });
}
