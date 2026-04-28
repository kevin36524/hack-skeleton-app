import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { getEntity, checkCostCap, updateIngestJob, updateProfileBackfillStatus } from '../db';
import { stageA } from '../extraction/stage-a';
import { stageB } from '../extraction/stage-b';
import type { SearchMessagesApiResponse, FullMessageBodyResponse } from '@/lib/types/api';
import type { JobCall } from '../types';
import { convert } from 'html-to-text';


const MAX_ENTITIES = parseInt(process.env.LIFE_GRAPH_PHASE2_MAX_ENTITIES ?? '50', 10);
const MAX_MESSAGES_PER_ENTITY = parseInt(
  process.env.LIFE_GRAPH_PHASE2_MAX_MESSAGES_PER_ENTITY ?? '80',
  10
);
const STAGE_B_BATCH_SIZE = 15;
const COST_RESERVE_FRACTION = 0.2;

function resolveBodyText(response: FullMessageBodyResponse): string {
  const rawText = response.simpleBody?.text;
  const rawHtml = response.simpleBody?.html;
  return rawText ?? (rawHtml ? convert(rawHtml, { wordwrap: false }) : '');
}

export async function phase2DeepExtraction(
  uid: string,
  token: string,
  entityIds: string[],
  jobId: string,
  logCall?: (c: JobCall) => void
): Promise<void> {
  console.log(`[phase2] start uid=${uid} jobId=${jobId} entityIds=${entityIds.length} maxEntities=${MAX_ENTITIES}`);
  const mailboxId = await getMailboxId(token);
  const toProcess = entityIds.slice(0, MAX_ENTITIES);

  for (let i = 0; i < toProcess.length; i++) {
    const eid = toProcess[i];
    const entity = await getEntity(uid, eid);
    if (!entity || entity.emailAddresses.length === 0) {
      console.log(`[phase2] skipping eid=${eid} — no entity or no email addresses`);
      continue;
    }

    const senderEmail = entity.emailAddresses[0];
    console.log(`[phase2] processing entity ${i + 1}/${toProcess.length} eid=${eid} email=${senderEmail}`);

    const searchQuery = `from:${senderEmail}+offset:0+count:${MAX_MESSAGES_PER_ENTITY}`;
    const searchUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${searchQuery}`;

    let messages: SearchMessagesApiResponse['messages'] = [];
    try {
      const resp = await yahooGet<SearchMessagesApiResponse>(token, searchUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: searchUrl, status: 200 });
      messages = resp.messages ?? [];
      const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
      messages = messages.filter(
        (m) => !m.headers?.internalDate || new Date(m.headers.internalDate).getTime() >= cutoff
      );
      console.log(`[phase2] fetched ${messages.length} messages for ${senderEmail}`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: searchUrl, status: 'err' });
      console.warn(`[phase2] failed to search messages for ${senderEmail}: ${err}`);
      continue;
    }

    // Stage A for all messages
    const noteIds: string[] = [];
    for (const msg of messages) {
      try {
        const bodyEndpoint = `/mailboxes/@.id==${mailboxId}/messages/@.id==${msg.id}/content/simplebody/full`;
        const bodyResp = await yahooGet<FullMessageBodyResponse>(token, bodyEndpoint);
        logCall?.({ ts: Date.now(), method: 'GET', url: bodyEndpoint, status: 200 });
        const body = resolveBodyText(bodyResp);

        const from = msg.headers?.from?.[0];
        const deliveryTime = msg.headers?.internalDate
          ? new Date(msg.headers.internalDate)
          : new Date();

        const { noteId, contentTier } = await stageA(uid, {
          id: msg.id,
          deliveryTime,
          from: { name: from?.name ?? '', email: from?.email ?? senderEmail },
          subject: msg.headers?.subject ?? '',
          body,
        });
        noteIds.push(noteId);
        console.log(`[phase2] stage-a done msgId=${msg.id} tier=${contentTier}`);
      } catch (err) {
        const failedUrl = `/mailboxes/@.id==${mailboxId}/messages/@.id==${msg.id}/content/simplebody/full`;
        logCall?.({ ts: Date.now(), method: 'GET', url: failedUrl, status: 'err' });
        console.warn(`[phase2] stage-a error for msg ${msg.id}: ${err}`);
      }
    }
    console.log(`[phase2] stage-a complete for ${senderEmail}: ${noteIds.length}/${messages.length} notes`);

    // Stage B in batches
    const batchCount = Math.ceil(noteIds.length / STAGE_B_BATCH_SIZE);
    for (let b = 0; b < noteIds.length; b += STAGE_B_BATCH_SIZE) {
      const batch = noteIds.slice(b, b + STAGE_B_BATCH_SIZE);
      const batchNum = Math.floor(b / STAGE_B_BATCH_SIZE) + 1;
      console.log(`[phase2] stage-b batch ${batchNum}/${batchCount} for eid=${eid} (${batch.length} notes)`);
      try {
        const { factIds } = await stageB(uid, eid, batch, jobId);
        console.log(`[phase2] stage-b batch ${batchNum} produced ${factIds.length} facts`);
      } catch (err) {
        console.warn(`[phase2] stage-b error for batch ${batchNum}: ${err}`);
      }

      const capped = await checkCostCap(uid, jobId);
      if (capped) {
        console.warn(`[phase2] cost cap hit after batch ${batchNum}, stopping`);
        return;
      }
    }

    const progress = ((i + 1) / toProcess.length) * (1 - COST_RESERVE_FRACTION);
    console.log(`[phase2] entity ${i + 1}/${toProcess.length} done, progress=${(progress * 100).toFixed(1)}%`);
    await updateProfileBackfillStatus(uid, { phase: 2, progress });

    const capped = await checkCostCap(uid, jobId);
    if (capped) {
      console.warn(`[phase2] cost cap hit after entity ${i + 1}, stopping`);
      return;
    }
  }

  console.log(`[phase2] done — processed ${toProcess.length} entities`);
  await updateIngestJob(uid, jobId, { phase: 3 });
}
