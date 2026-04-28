import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { stageA } from '../extraction/stage-a';
import { stageB } from '../extraction/stage-b';
import { resolvePersonOrOrg } from '../extraction/identity-resolution';
import { convert } from 'html-to-text';
import type { FullMessageBodyResponse } from '@/lib/types/api';

const HOT_KEYWORDS = /tomorrow|today|urgent|asap|deadline/i;

export interface DeepIngestInput {
  id: string;
  conversationId: string;
  deliveryTime: Date;
  from: { name: string; email: string };
  subject: string;
  isRead: boolean;
  isStarred: boolean;
}

export async function deepIngest(
  uid: string,
  token: string,
  message: DeepIngestInput,
  options: { path: 'hot' | 'warm' }
): Promise<{ noteId: string; factIds: string[] }> {
  console.log(`[deep-ingest] uid=${uid} msgId=${message.id} path=${options.path} from=${message.from.email} subject="${message.subject.slice(0, 60)}"`);
  const mailboxId = await getMailboxId(token);

  // Step 4 — Stage A: fetch body and extract note
  let body = '';
  try {
    const bodyResp = await yahooGet<FullMessageBodyResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/messages/@.id==${message.id}/content/simplebody/full`
    );
    const rawText = bodyResp.simpleBody?.text;
    const rawHtml = bodyResp.simpleBody?.html;
    body = rawText ?? (rawHtml ? convert(rawHtml, { wordwrap: false }) : '');
    console.log(`[deep-ingest] fetched body length=${body.length} for msg=${message.id}`);
  } catch (err) {
    console.warn(`[deep-ingest] could not fetch body for msg=${message.id}: ${err}`);
  }

  const { noteId, contentTier } = await stageA(uid, {
    id: message.id,
    deliveryTime: message.deliveryTime,
    from: message.from,
    subject: message.subject,
    body,
  });

  if (contentTier === 'skip') {
    console.log(`[deep-ingest] msg=${message.id} tier=skip, returning early`);
    return { noteId, factIds: [] };
  }

  // Step 5 — Stage B gating
  const hotBySubject = HOT_KEYWORDS.test(message.subject);
  const isHotPath = options.path === 'hot' || hotBySubject;
  console.log(`[deep-ingest] msg=${message.id} path=${options.path} hotBySubject=${hotBySubject} → isHotPath=${isHotPath}`);

  if (!isHotPath) {
    console.log(`[deep-ingest] msg=${message.id} queued for warm-batch stage-b`);
    return { noteId, factIds: [] };
  }

  // hot path — run Stage B immediately
  const entityId = await resolvePersonOrOrg(uid, message.from.email, message.from.name);
  if (!entityId) {
    console.log(`[deep-ingest] msg=${message.id} no entity resolved for ${message.from.email}, skipping stage-b`);
    return { noteId, factIds: [] };
  }

  console.log(`[deep-ingest] running stage-b hot path for msg=${message.id} entityId=${entityId}`);
  const { factIds } = await stageB(uid, entityId, [noteId]);
  console.log(`[deep-ingest] msg=${message.id} stage-b produced ${factIds.length} facts`);

  return { noteId, factIds };
}
