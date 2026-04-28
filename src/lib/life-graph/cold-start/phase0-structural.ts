import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import { updateIngestJob, updateProfileBackfillStatus } from '../db';
import type { GetFoldersApiResponse, ListConversationsApiResponse } from '@/lib/types/api';
import type { JobCall } from '../types';


export interface CandidateSender {
  email: string;
  name: string;
  compositeScore: number;
  signals: {
    sentTo: boolean;
    starCount: number;
    threadCount: number;
    openWithDwellCount: number;
  };
}

interface SenderData {
  name: string;
  sentTo: boolean;
  starCount: number;
  threadCount: number;
  openWithDwellCount: number;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export async function phase0Structural(
  uid: string,
  token: string,
  accountId: string,
  windowMonths: number,
  jobId: string,
  logCall?: (c: JobCall) => void
): Promise<CandidateSender[]> {
  console.log(`[phase0] start uid=${uid} jobId=${jobId} accountId=${accountId} windowMonths=${windowMonths}`);
  const mailboxId = await getMailboxId(token);
  console.log(`[phase0] resolved mailboxId=${mailboxId}`);

  const senderMap = new Map<string, SenderData>();

  function getOrCreate(email: string, name: string): SenderData {
    if (!senderMap.has(email)) {
      senderMap.set(email, { name, sentTo: false, starCount: 0, threadCount: 0, openWithDwellCount: 0 });
    }
    return senderMap.get(email)!;
  }

  const foldersUrl = `/mailboxes/@.id==${mailboxId}/folders`;
  const foldersResp = await yahooGet<GetFoldersApiResponse>(token, foldersUrl);
  logCall?.({ ts: Date.now(), method: 'GET', url: foldersUrl, status: 200 });

  // Filter to only folders belonging to the target account
  const accountFolders = foldersResp.folders.filter((f) => f.acctId === accountId);
  console.log(`[phase0] found ${foldersResp.folders.length} total folders, ${accountFolders.length} for accountId=${accountId}`);

  const sentFolder = accountFolders.find((f) => f.types?.includes('SENT') || f.name === 'Sent');
  const inboxFolder = accountFolders.find((f) => f.types?.includes('INBOX') || f.name === 'Inbox');
  console.log(`[phase0] sentFolder=${sentFolder?.name ?? 'not found'} inboxFolder=${inboxFolder?.name ?? 'not found'}`);

  // ── Sent folder: mark recipients as sentTo ────────────────────────────────
  if (sentFolder) {
    const query = `folderId:${sentFolder.id}+groupBy:conversationId+offset:0+count:200`;
    const sentUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, sentUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: sentUrl, status: 200 });
      let recipientCount = 0;
      const cutoff = Date.now() - ONE_YEAR_MS;
      for (const msg of resp.messages ?? []) {
        if (msg.headers?.internalDate && new Date(msg.headers.internalDate).getTime() < cutoff) continue;
        for (const recipient of msg.headers?.to ?? []) {
          if (recipient.email) {
            getOrCreate(recipient.email, recipient.name ?? '').sentTo = true;
            recipientCount++;
          }
        }
      }
      console.log(`[phase0] sent folder: scanned ${resp.messages?.length ?? 0} msgs, ${recipientCount} recipients`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: sentUrl, status: 'err' });
      console.warn(`[phase0] sent folder scan failed: ${err}`);
    }
  }

  // ── Inbox: thread participation + read/star signals ───────────────────────
  // A sender appearing in a multi-message conversation is a real engagement
  // signal regardless of which folder the conversation lives in.
  if (inboxFolder) {
    const query = `folderId:${inboxFolder.id}+groupBy:conversationId+offset:0+count:500`;
    const inboxUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, inboxUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: inboxUrl, status: 200 });

      // Build conversationId → message count from the conversations array
      const threadSize = new Map<string, number>();
      for (const conv of resp.conversations ?? []) {
        threadSize.set(conv.id, conv.messageIds.length);
      }

      const cutoff = Date.now() - ONE_YEAR_MS;
      for (const msg of resp.messages ?? []) {
        if (msg.headers?.internalDate && new Date(msg.headers.internalDate).getTime() < cutoff) continue;
        const fromEmail = msg.headers?.from?.[0]?.email;
        const fromName = msg.headers?.from?.[0]?.name ?? '';
        if (!fromEmail) continue;
        const s = getOrCreate(fromEmail, fromName);
        if (msg.flags?.flagged) s.starCount++;
        else if (msg.flags?.read) s.openWithDwellCount++;
        // Thread signal: conversation has more than one message (back-and-forth)
        if ((threadSize.get(msg.conversationId) ?? 1) > 1) s.threadCount++;
      }
      console.log(`[phase0] inbox: scanned ${resp.messages?.length ?? 0} msgs, senderMap size=${senderMap.size}`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: inboxUrl, status: 'err' });
      console.warn(`[phase0] inbox scan failed: ${err}`);
    }
  }

  // ── Starred: account-scoped, catches starred outside the inbox window ─────
  {
    const starredUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=is:flagged+acctId:${accountId}+count:200&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, starredUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: starredUrl, status: 200 });
      const cutoff = Date.now() - ONE_YEAR_MS;
      for (const msg of resp.messages ?? []) {
        if (msg.headers?.internalDate && new Date(msg.headers.internalDate).getTime() < cutoff) continue;
        const fromEmail = msg.headers?.from?.[0]?.email;
        const fromName = msg.headers?.from?.[0]?.name ?? '';
        if (!fromEmail) continue;
        getOrCreate(fromEmail, fromName).starCount++;
      }
      console.log(`[phase0] starred scan: ${resp.messages?.length ?? 0} msgs`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: starredUrl, status: 'err' });
      console.warn(`[phase0] starred scan failed: ${err}`);
    }
  }

  // ── Read: account-scoped, broader engagement beyond the inbox window ──────
  {
    const readUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=acctId:${accountId}+is:read+count:200&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, readUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: readUrl, status: 200 });
      const cutoff = Date.now() - ONE_YEAR_MS;
      for (const msg of resp.messages ?? []) {
        if (msg.headers?.internalDate && new Date(msg.headers.internalDate).getTime() < cutoff) continue;
        const fromEmail = msg.headers?.from?.[0]?.email;
        const fromName = msg.headers?.from?.[0]?.name ?? '';
        if (!fromEmail) continue;
        // Skip starred — already counted above
        if (!msg.flags?.flagged) getOrCreate(fromEmail, fromName).openWithDwellCount++;
      }
      console.log(`[phase0] read scan: ${resp.messages?.length ?? 0} msgs`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: readUrl, status: 'err' });
      console.warn(`[phase0] read scan failed: ${err}`);
    }
  }

  // ── Score and rank ────────────────────────────────────────────────────────
  // Scoring reflects genuine engagement only — no folder-placement signal.
  // sentTo:  you replied / initiated contact     → strongest signal
  // starred: you explicitly flagged it           → high intent
  // thread:  back-and-forth conversation (>1 msg)→ medium signal
  // read:    you opened it                       → weak signal
  const candidates: CandidateSender[] = Array.from(senderMap.entries())
    .map(([email, s]) => ({
      email,
      name: s.name,
      compositeScore:
        (s.sentTo ? 100 : 0) +
        s.starCount * 30 +
        s.threadCount * 20 +
        s.openWithDwellCount * 5,
      signals: {
        sentTo: s.sentTo,
        starCount: s.starCount,
        threadCount: s.threadCount,
        openWithDwellCount: s.openWithDwellCount,
      },
    }))
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 500);

  console.log(`[phase0] done — ${candidates.length} candidates. Top 5: ${candidates.slice(0, 5).map((c) => `${c.email}(${c.compositeScore})`).join(', ')}`);

  await updateIngestJob(uid, jobId, { phase: 1 });
  await updateProfileBackfillStatus(uid, { phase: 1 });

  return candidates;
}
