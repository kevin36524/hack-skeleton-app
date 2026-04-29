import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { listEntitiesByDrawer, updateIngestJob, updateProfileBackfillStatus, updatePhase3Summary } from '../db';
import { stageA } from '../extraction/stage-a';
import { convert } from 'html-to-text';
import type { ListConversationsApiResponse, FullMessageBodyResponse } from '@/lib/types/api';
import type { JobCall } from '../types';


const MAX_MESSAGES = parseInt(process.env.LIFE_GRAPH_PHASE3_MAX_MESSAGES ?? '200', 10);

function internalDateMs(internalDate: string | undefined): number {
  if (!internalDate) return 0;
  const n = parseInt(internalDate, 10);
  return isNaN(n) ? 0 : n * 1000;
}

interface ThreadMessage {
  id: string;
  from: { name: string; email: string };
  subject: string;
  internalDate?: string;
}

export async function phase3ThreadSweep(
  uid: string,
  token: string,
  jobId: string,
  userEmail: string,
  logCall?: (c: JobCall) => void
): Promise<void> {
  console.log(`[phase3] start uid=${uid} jobId=${jobId} maxMessages=${MAX_MESSAGES}`);
  const mailboxId = await getMailboxId(token);

  const phase2Entities = await listEntitiesByDrawer(uid, 'people_orgs');
  const coveredEmails = new Set(phase2Entities.flatMap((e) => e.emailAddresses));
  console.log(`[phase3] phase2 covered ${coveredEmails.size} email addresses from ${phase2Entities.length} entities`);

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
    console.warn(`[phase3] no inbox folder found, skipping`);
    await updateIngestJob(uid, jobId, { phase: 3 });
    return;
  }

  const threadMap = new Map<string, ThreadMessage[]>();

  let offset = 0;
  const perPage = 200;
  let totalScanned = 0;
  while (offset < 2000) {
    const query = `folderId:${inboxFolder.id}+groupBy:conversationId+offset:${offset}+count:${perPage}`;
    const pageUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, pageUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: pageUrl, status: 200 });
      if (!resp.messages || resp.messages.length === 0) break;

      const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
      for (const msg of resp.messages) {
        const ms = internalDateMs(msg.headers?.internalDate);
        if (ms && ms < cutoff) continue;
        const convId = msg.conversationId ?? msg.id;
        const fromEmail = msg.headers?.from?.[0]?.email ?? '';
        if (!threadMap.has(convId)) threadMap.set(convId, []);
        threadMap.get(convId)!.push({
          id: msg.id,
          from: { name: msg.headers?.from?.[0]?.name ?? '', email: fromEmail },
          subject: msg.headers?.subject ?? '',
          internalDate: msg.headers?.internalDate,
        });
      }
      totalScanned += resp.messages.length;
      offset += perPage;
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: pageUrl, status: 'err' });
      console.warn(`[phase3] failed to fetch inbox at offset=${offset}: ${err}`);
      break;
    }
  }
  console.log(`[phase3] scanned ${totalScanned} msgs → ${threadMap.size} threads`);

  const eligibleThreads = Array.from(threadMap.entries())
    .filter(([, msgs]) => msgs.length >= 3)
    .filter(([, msgs]) => !msgs.some((m) => coveredEmails.has(m.from.email)));

  console.log(`[phase3] eligible uncovered threads with ≥3 msgs: ${eligibleThreads.length}`);

  let processed = 0;
  for (const [convId, msgs] of eligibleThreads) {
    if (processed >= MAX_MESSAGES) break;

    for (const msg of msgs) {
      if (processed >= MAX_MESSAGES) break;
      try {
        const bodyEndpoint = `/mailboxes/@.id==${mailboxId}/messages/@.id==${msg.id}/content/simplebody/full`;
        const bodyResp = await yahooGet<FullMessageBodyResponse>(token, bodyEndpoint);
        logCall?.({ ts: Date.now(), method: 'GET', url: bodyEndpoint, status: 200 });
        const rawText = bodyResp.simpleBody?.text;
        const rawHtml = bodyResp.simpleBody?.html;
        const body = rawText ?? (rawHtml ? convert(rawHtml, { wordwrap: false }) : '');

        const msgMs = internalDateMs(msg.internalDate);
        const deliveryTime = msgMs ? new Date(msgMs) : new Date();

        const { contentTier } = await stageA(uid, {
          id: msg.id,
          deliveryTime,
          from: msg.from,
          subject: msg.subject,
          body,
        }, userEmail);
        processed++;
        console.log(`[phase3] processed msg=${msg.id} convId=${convId} tier=${contentTier} (${processed}/${MAX_MESSAGES})`);
      } catch (err) {
        const failedEndpoint = `/mailboxes/@.id==${mailboxId}/messages/@.id==${msg.id}/content/simplebody/full`;
        logCall?.({ ts: Date.now(), method: 'GET', url: failedEndpoint, status: 'err' });
        console.warn(`[phase3] stage-a error for msg ${msg.id}: ${err}`);
      }
    }
  }

  console.log(`[phase3] done — processed ${processed} messages`);
  await updatePhase3Summary(uid, jobId, {
    threadsScanned: threadMap.size,
    eligibleThreads: eligibleThreads.length,
    messagesProcessed: processed,
  });
  await updateIngestJob(uid, jobId, { phase: 4 });
  await updateProfileBackfillStatus(uid, { phase: 3 });
}
