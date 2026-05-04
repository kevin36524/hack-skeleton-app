import { Timestamp } from 'firebase-admin/firestore';
import { mastra } from '@/src/mastra';
import { insertNote } from '../db';
import type { Note, ContentTier } from '../types';

const SKIP_PATTERNS = [
  /one.?time.?passcode|otp|\bverification code\b|\bsecurity code\b/i,
  /your order has shipped|delivery confirmation|tracking number/i,
  /unsubscribe.*click here/i,
];

const DIRECT_TO_SCHEMA_PATTERNS = [
  /(?:flight|itinerary|boarding pass|reservation|booking confirmation)/i,
  /(?:calendar invite|event invitation|you're invited to)/i,
  /(?:order receipt|payment received|invoice #)/i,
];

function classifyContentTier(subject: string, body: string): ContentTier {
  const text = `${subject} ${body}`;
  if (SKIP_PATTERNS.some((p) => p.test(text))) return 'skip';
  if (DIRECT_TO_SCHEMA_PATTERNS.some((p) => p.test(text))) return 'direct_to_schema';
  return 'two_stage';
}

interface StageAInput {
  id: string;
  deliveryTime: Date;
  from: { name: string; email: string };
  subject: string;
  body: string;
}

export async function stageA(
  uid: string,
  message: StageAInput,
  userEmail?: string
): Promise<{ noteId: string; contentTier: ContentTier }> {
  const contentTier = classifyContentTier(message.subject, message.body);
  console.log(`[stage-a] msg=${message.id} from=${message.from.email} subject="${message.subject.slice(0, 60)}" tier=${contentTier}`);

  let notesText = '';

  if (contentTier !== 'skip') {
    const noteAgent = mastra.getAgent('lifeGraphNoteAgent');
    const ownerLine = userEmail ? `Mailbox owner: ${userEmail}\n` : '';
    const dateLine = message.deliveryTime.toISOString().slice(0, 10);
    const userContent =
      `${ownerLine}` +
      `[msg id: ${message.id} | ${dateLine}]\n` +
      `From: ${message.from.name} <${message.from.email}>\n` +
      `Subject: ${message.subject}\n\n` +
      message.body.slice(0, 1500);

    console.log(`[stage-a] calling lifeGraphNoteAgent for msg=${message.id}`);
    const result = await noteAgent.generate(userContent);
    notesText = (result.text ?? '').trim();
    console.log(`[stage-a] note prose len=${notesText.length} for msg=${message.id}`);
  } else {
    console.log(`[stage-a] skipping LLM for msg=${message.id} (tier=skip)`);
  }

  const deliveryTs = Timestamp.fromDate(message.deliveryTime);
  const note: Note = {
    id: message.id,
    sourceMessageId: message.id,
    sourceMessageIds: [message.id],
    messageRecords: [{ id: message.id, deliveryTime: deliveryTs }],
    deliveryTime: deliveryTs,
    from: message.from,
    subject: message.subject,
    notesText,
    signals: [],
    contentTier,
    stageBStatus: contentTier === 'skip' ? 'processed' : 'pending',
    stageBProcessedAt: contentTier === 'skip' ? Timestamp.now() : null,
  };

  await insertNote(uid, note);
  console.log(`[stage-a] wrote note id=${message.id} stageBStatus=${note.stageBStatus}`);
  return { noteId: message.id, contentTier };
}
