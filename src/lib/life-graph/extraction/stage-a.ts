import { Timestamp } from 'firebase-admin/firestore';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
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
  message: StageAInput
): Promise<{ noteId: string; contentTier: ContentTier }> {
  const contentTier = classifyContentTier(message.subject, message.body);
  console.log(`[stage-a] msg=${message.id} from=${message.from.email} subject="${message.subject.slice(0, 60)}" tier=${contentTier}`);

  let notesText = '';
  let signals: string[] = [];

  if (contentTier !== 'skip') {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
    const userContent = `From: ${message.from.name} <${message.from.email}>\nSubject: ${message.subject}\n\n${message.body.slice(0, 1500)}`;

    console.log(`[stage-a] calling Gemini Flash for msg=${message.id}`);
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system:
        'You are taking notes on an email for a personal assistant. Write a compact prose note (2-5 sentences) capturing what matters: who, what, when, where, any action items or changes to existing plans. Then list 1-5 short signal tags (snake_case) capturing the email\'s nature.\n\nRespond as JSON:\n{ "notes": "<prose>", "signals": ["signal1", "signal2", ...] }',
      prompt: userContent,
    });

    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      notesText = parsed.notes ?? '';
      signals = Array.isArray(parsed.signals) ? parsed.signals : [];
      console.log(`[stage-a] extracted signals=${signals.join(',')} for msg=${message.id}`);
    } catch (err) {
      console.warn(`[stage-a] JSON parse failed for msg=${message.id}, using raw text. err=${err}`);
      notesText = text.slice(0, 500);
    }
  } else {
    console.log(`[stage-a] skipping LLM for msg=${message.id} (tier=skip)`);
  }

  const note: Note = {
    id: message.id,
    sourceMessageId: message.id,
    deliveryTime: Timestamp.fromDate(message.deliveryTime),
    from: message.from,
    subject: message.subject,
    notesText,
    signals,
    contentTier,
    stageBStatus: contentTier === 'skip' ? 'processed' : 'pending',
    stageBProcessedAt: contentTier === 'skip' ? Timestamp.now() : null,
    producedFactIds: [],
  };

  await insertNote(uid, note);
  console.log(`[stage-a] wrote note id=${message.id} stageBStatus=${note.stageBStatus}`);
  return { noteId: message.id, contentTier };
}
