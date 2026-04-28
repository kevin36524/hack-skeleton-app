import { getNote } from '@/src/lib/life-graph/db';
import { deepIngest } from './deep-ingest';

export async function retroactiveBoost(
  uid: string,
  token: string,
  messageId: string,
  from: { name: string; email: string },
  subject: string,
  deliveryTime: Date,
  conversationId: string
): Promise<void> {
  console.log(`[retroactive-boost] uid=${uid} messageId=${messageId} from=${from.email}`);

  const existingNote = await getNote(uid, messageId);

  if (existingNote && existingNote.contentTier !== 'skip') {
    console.log(`[retroactive-boost] msg=${messageId} already fully ingested (tier=${existingNote.contentTier}), skipping`);
    return;
  }

  if (existingNote?.contentTier === 'skip') {
    console.log(`[retroactive-boost] msg=${messageId} upgrading from skip → hot ingest`);
  } else {
    console.log(`[retroactive-boost] msg=${messageId} no prior note, running full hot ingest`);
  }

  await deepIngest(uid, token, {
    id: messageId,
    conversationId,
    deliveryTime,
    from,
    subject,
    isRead: true,
    isStarred: true,
  }, { path: 'hot' });

  console.log(`[retroactive-boost] msg=${messageId} done`);
}
