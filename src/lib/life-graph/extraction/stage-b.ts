import { Timestamp } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';
import { getNote, upsertEntity, markNoteStageB, incrementIngestJobCost } from '../db';
import { writeOrSupersedeFact } from '../supersedes';
import { resolvePersonOrOrg, resolveEvent } from './identity-resolution';
import type { Entity, Fact } from '../types';

interface StageBResult {
  factIds: string[];
}

export async function stageB(
  uid: string,
  entityId: string,
  noteIds: string[],
  jobId?: string
): Promise<StageBResult> {
  console.log(`[stage-b] start entityId=${entityId} noteIds=[${noteIds.join(',')}] jobId=${jobId ?? 'none'}`);

  const client = new Anthropic();
  const notes = await Promise.all(noteIds.map((nid) => getNote(uid, nid)));
  const validNotes = notes.filter((n) => n !== null && n.stageBStatus === 'pending');

  console.log(`[stage-b] resolved ${validNotes.length}/${noteIds.length} pending notes`);

  if (validNotes.length === 0) {
    console.log(`[stage-b] no pending notes, returning early`);
    return { factIds: [] };
  }

  const noteContent = validNotes
    .map(
      (n) =>
        `[Note ${n!.sourceMessageId} | ${n!.deliveryTime.toDate().toISOString().slice(0, 10)} | From: ${n!.from.name} <${n!.from.email}>]\n${n!.notesText}\nsignals: [${n!.signals.join(', ')}]`
    )
    .join('\n\n');

  const systemPrompt = `You are a structured-data extractor for a personal assistant's Life Graph.
Given a batch of notes about one person or organization, extract facts in JSON.

Return a JSON object with:
{
  "stableFactUpdates": [
    { "slot": "job", "value": "Staff Engineer @ Stripe" },
    { "slot": "birthday", "value": "1989-06-12" }
  ],
  "timeSensitiveFacts": [
    { "slot": "meeting.time", "value": "2026-04-30T10:00:00", "sourceNoteId": "msg_xxx" },
    { "slot": "meeting.location", "value": "Starbucks on Market St", "sourceNoteId": "msg_xxx" }
  ],
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
- All datetimes must be ISO 8601 strings. Resolve relative references ("next Thursday") against each note's deliveryTime.
- Only include facts you are confident about. Omit uncertain ones.
- Slot names: home_address, birthday, food_preference, school_name, job, sender_class, meeting.time, meeting.location, flight.time, deadline.date, parent_of, spouse_of, employs, attends.
- Return only valid JSON, no markdown.`;

  console.log(`[stage-b] calling Claude Sonnet for entityId=${entityId} with ${validNotes.length} notes`);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: noteContent }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log(`[stage-b] LLM response length=${raw.length} for entityId=${entityId}`);

  let extracted: {
    stableFactUpdates?: Array<{ slot: string; value: unknown }>;
    timeSensitiveFacts?: Array<{ slot: string; value: unknown; sourceNoteId: string }>;
    commitments?: Array<{ label: string; dueDate?: string; owedByUser?: boolean; owedToEntityLabel?: string }>;
    events?: Array<{ label: string; startTime?: string; participantEmails?: string[] }>;
  } = {};

  try {
    extracted = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
    console.log(`[stage-b] parsed: stableFacts=${extracted.stableFactUpdates?.length ?? 0} timeSensitive=${extracted.timeSensitiveFacts?.length ?? 0} commitments=${extracted.commitments?.length ?? 0} events=${extracted.events?.length ?? 0}`);
  } catch (err) {
    console.warn(`[stage-b] JSON parse failed for entityId=${entityId}: ${err}`);
    await Promise.all(validNotes.map((n) => markNoteStageB(uid, n!.id, 'failed', [])));
    return { factIds: [] };
  }

  const factIds: string[] = [];
  const now = Timestamp.now();

  for (const sf of extracted.stableFactUpdates ?? []) {
    console.log(`[stage-b] writing stable fact slot=${sf.slot} for entityId=${entityId}`);
    const fid = await writeOrSupersedeFact(uid, {
      entityId,
      slot: sf.slot,
      factType: 'stable',
      value: sf.value,
      status: 'current',
      authority: 'email_derived',
      confidence: 0.8,
      sourceMessageIds: validNotes.map((n) => n!.sourceMessageId),
      firstSeen: now,
      lastVerified: now,
      effectiveTime: now,
      drawer: 'people_orgs',
    });
    factIds.push(fid);
  }

  for (const tsf of extracted.timeSensitiveFacts ?? []) {
    const sourceNote = validNotes.find((n) => n!.sourceMessageId === tsf.sourceNoteId);
    const effectiveTime = sourceNote ? sourceNote.deliveryTime : now;
    console.log(`[stage-b] writing time_sensitive fact slot=${tsf.slot} for entityId=${entityId}`);
    const fid = await writeOrSupersedeFact(uid, {
      entityId,
      slot: tsf.slot,
      factType: 'time_sensitive',
      value: tsf.value,
      status: 'current',
      authority: 'email_derived',
      confidence: 0.85,
      sourceMessageIds: [tsf.sourceNoteId],
      firstSeen: now,
      lastVerified: now,
      effectiveTime,
      drawer: 'commitments',
    });
    factIds.push(fid);
  }

  for (const c of extracted.commitments ?? []) {
    const eid = randomUUID();
    console.log(`[stage-b] creating commitment entity label="${c.label}" eid=${eid}`);
    const entity: Entity = {
      id: eid,
      type: 'commitment',
      drawer: 'commitments',
      label: c.label,
      aliases: [],
      emailAddresses: [],
      sourceMessageIds: validNotes.map((n) => n!.sourceMessageId),
      firstSeen: now,
      lastUpdated: now,
      pinned: false,
      pinnedAt: null,
      entryClock: null,
      decayClock: null,
      dueDate: c.dueDate ? Timestamp.fromDate(new Date(c.dueDate)) : undefined,
      resolvedAt: null,
      owedBy: c.owedByUser ? uid : c.owedToEntityLabel,
      owedTo: c.owedByUser ? c.owedToEntityLabel : uid,
      payload: {},
      schemaVersion: 1,
    };
    await upsertEntity(uid, entity);
  }

  for (const e of extracted.events ?? []) {
    const participantEmails = e.participantEmails ?? [];
    const startDate = e.startTime ? new Date(e.startTime) : null;

    let eid: string | null = null;
    if (startDate) {
      eid = await resolveEvent(uid, e.label, startDate, participantEmails);
      if (eid) console.log(`[stage-b] resolved existing event eid=${eid} for label="${e.label}"`);
    }

    if (!eid) {
      eid = randomUUID();
      console.log(`[stage-b] creating event entity label="${e.label}" eid=${eid}`);
      const resolvedParticipantIds = await Promise.all(
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
        firstSeen: now,
        lastUpdated: now,
        pinned: false,
        pinnedAt: null,
        entryClock: null,
        decayClock: null,
        startTime: startDate ? Timestamp.fromDate(startDate) : undefined,
        participantIds: resolvedParticipantIds.filter((id): id is string => id !== null),
        payload: {},
        schemaVersion: 1,
      };
      await upsertEntity(uid, entity);
    }
  }

  await Promise.all(validNotes.map((n) => markNoteStageB(uid, n!.id, 'processed', factIds)));
  console.log(`[stage-b] marked ${validNotes.length} notes as processed, produced ${factIds.length} factIds`);

  if (jobId) {
    await incrementIngestJobCost(uid, jobId, 0.003);
    console.log(`[stage-b] incremented job cost $0.003 jobId=${jobId}`);
  }

  return { factIds };
}
