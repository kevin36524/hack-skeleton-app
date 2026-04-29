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
  lastSentMs: number;           // 0 = never sent to; tracks recency of your outbound
  starCount: number;
  threadedConvIds: Set<string>; // unique convIds with >1 msg — deduped across both folders
  openWithDwellCount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365 * DAY_MS;

// internalDate is Unix seconds as a string — multiply by 1000 for ms.
function parseDateMs(internalDate: string | undefined): number {
  if (!internalDate) return 0;
  const n = parseInt(internalDate, 10);
  return isNaN(n) ? 0 : n * 1000;
}

// Bulk/transactional sender patterns — excluded before scoring.
// Matches on the local-part (before @) or full domain.
const BULK_LOCAL_PART = /^(no[_.-]?reply|noreply|donotreply|do-not-reply|notifications?|alerts?|mailer|bounce|auto|newsletter|deals?|offers?|promotions?|marketing|info|hello|support|subscriptions?)$/i;

// Subdomains/domains that are exclusively bulk or tracking infrastructure
const BULK_DOMAIN_PART = /\b(groupon|livingsocial|woot|dealhack|retailmenot|slickdeals|sendgrid|mailchimp|klaviyo|constantcontact|exacttarget|marketo|eloqua|responsys|salesforce\.email|em\..*|e\.[a-z]+\.|r\.[a-z]+\.|click\.[a-z]+\.|link\.[a-z]+\.|track\.[a-z]+\.|email\.[a-z]+\.|mail\.[a-z]+\.)\b/i;

function isBulkSender(email: string): boolean {
  const [local, domain] = email.split('@');
  if (!domain) return false;
  if (BULK_LOCAL_PART.test(local)) return true;
  if (BULK_DOMAIN_PART.test(domain)) return true;
  return false;
}

// Recency-tiered sent score — contacting someone last week is very different from 11 months ago.
function sentScore(lastSentMs: number): number {
  if (lastSentMs === 0) return 0;
  const age = Date.now() - lastSentMs;
  if (age < 30 * DAY_MS)  return 120;
  if (age < 90 * DAY_MS)  return 100;
  if (age < 180 * DAY_MS) return 70;
  return 40; // 6–12 months ago — still meaningful but deprioritised
}

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

  function getOrCreate(email: string, name: string): SenderData | null {
    if (isBulkSender(email)) return null;
    if (!senderMap.has(email)) {
      senderMap.set(email, { name, lastSentMs: 0, starCount: 0, threadedConvIds: new Set(), openWithDwellCount: 0 });
    }
    return senderMap.get(email)!;
  }

  const foldersUrl = `/mailboxes/@.id==${mailboxId}/folders`;
  const foldersResp = await yahooGet<GetFoldersApiResponse>(token, foldersUrl);
  logCall?.({ ts: Date.now(), method: 'GET', url: foldersUrl, status: 200 });

  const accountFolders = foldersResp.folders.filter((f) => f.acctId === accountId);
  console.log(`[phase0] found ${foldersResp.folders.length} total folders, ${accountFolders.length} for accountId=${accountId}`);

  const sentFolder  = accountFolders.find((f) => f.types?.includes('SENT')  || f.name === 'Sent');
  const inboxFolder = accountFolders.find((f) => f.types?.includes('INBOX') || f.name === 'Inbox');
  console.log(`[phase0] sentFolder=${sentFolder?.name ?? 'not found'} inboxFolder=${inboxFolder?.name ?? 'not found'}`);

  // ── Sent folder: outbound recency + thread participation ──────────────────
  // groupBy:conversationId gives resp.conversations (with messageIds) so we
  // know which threads had back-and-forth.  Track lastSentMs per recipient
  // for recency-weighted scoring.
  if (sentFolder) {
    const query = `folderId:${sentFolder.id}+groupBy:conversationId+offset:0+count:200`;
    const sentUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, sentUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: sentUrl, status: 200 });

      const threadConvIds = new Set(
        (resp.conversations ?? []).filter((c) => c.messageIds.length > 1).map((c) => c.id)
      );

      let recipientCount = 0;
      const cutoff = Date.now() - ONE_YEAR_MS;
      for (const msg of resp.messages ?? []) {
        const msgMs = parseDateMs(msg.headers?.internalDate);
        if (msgMs && msgMs < cutoff) continue;
        const isThread = threadConvIds.has(msg.conversationId);
        for (const recipient of msg.headers?.to ?? []) {
          if (recipient.email) {
            const s = getOrCreate(recipient.email, recipient.name ?? '');
            if (s) {
              if (msgMs) s.lastSentMs = Math.max(s.lastSentMs, msgMs);
              if (isThread) s.threadedConvIds.add(msg.conversationId);
              recipientCount++;
            }
          }
        }
      }
      console.log(`[phase0] sent: ${resp.messages?.length ?? 0} msgs, ${threadConvIds.size} threads, ${recipientCount} recipients`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: sentUrl, status: 'err' });
      console.warn(`[phase0] sent folder scan failed: ${err}`);
    }
  }

  // ── Inbox folder: star + read signals + thread participation ─────────────
  // groupBy:conversationId gives resp.conversations so we can identify threads
  // with back-and-forth (messageIds.length > 1) and credit the sender once per
  // conversation — not once per message.
  if (inboxFolder) {
    const query = `folderId:${inboxFolder.id}+groupBy:conversationId+offset:0+count:500`;
    const inboxUrl = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`;
    try {
      const resp = await yahooGet<ListConversationsApiResponse>(token, inboxUrl);
      logCall?.({ ts: Date.now(), method: 'GET', url: inboxUrl, status: 200 });

      // Conversations where someone replied (multi-message = genuine back-and-forth)
      const threadConvIds = new Set(
        (resp.conversations ?? []).filter((c) => c.messageIds.length > 1).map((c) => c.id)
      );

      const cutoff = Date.now() - ONE_YEAR_MS;
      for (const msg of resp.messages ?? []) {
        if (msg.headers?.internalDate && parseDateMs(msg.headers?.internalDate) < cutoff) continue;
        const fromEmail = msg.headers?.from?.[0]?.email;
        const fromName  = msg.headers?.from?.[0]?.name ?? '';
        if (!fromEmail) continue;
        const s = getOrCreate(fromEmail, fromName);
        if (!s) continue;
        if (msg.flags?.flagged) s.starCount++;
        else if (msg.flags?.read) s.openWithDwellCount++;
        // One thread credit per unique conversation — prevents bulk senders that
        // send reply-chains from inflating threadCount per-message.
        if (threadConvIds.has(msg.conversationId)) s.threadedConvIds.add(msg.conversationId);
      }
      console.log(`[phase0] inbox: ${resp.messages?.length ?? 0} msgs, ${threadConvIds.size} threads, senderMap size=${senderMap.size}`);
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
        if (msg.headers?.internalDate && parseDateMs(msg.headers?.internalDate) < cutoff) continue;
        const fromEmail = msg.headers?.from?.[0]?.email;
        const fromName  = msg.headers?.from?.[0]?.name ?? '';
        if (!fromEmail) continue;
        const s = getOrCreate(fromEmail, fromName);
        if (s) s.starCount++;
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
        if (msg.headers?.internalDate && parseDateMs(msg.headers?.internalDate) < cutoff) continue;
        const fromEmail = msg.headers?.from?.[0]?.email;
        const fromName  = msg.headers?.from?.[0]?.name ?? '';
        if (!fromEmail) continue;
        // Skip starred — already counted above
        if (!msg.flags?.flagged) {
          const s = getOrCreate(fromEmail, fromName);
          if (s) s.openWithDwellCount++;
        }
      }
      console.log(`[phase0] read scan: ${resp.messages?.length ?? 0} msgs`);
    } catch (err) {
      logCall?.({ ts: Date.now(), method: 'GET', url: readUrl, status: 'err' });
      console.warn(`[phase0] read scan failed: ${err}`);
    }
  }

  // ── Score and rank ────────────────────────────────────────────────────────
  // sentScore: recency-tiered (120→100→70→40) — old sent contacts don't
  //   crowd out people you've recently starred or read.
  // starCount * 30: explicit flag, high intent.
  // threadCount * 20: genuine back-and-forth, deduped per conversation.
  // openWithDwellCount * 5: weakest — you opened it.
  const candidates: CandidateSender[] = Array.from(senderMap.entries())
    .map(([email, s]) => ({
      email,
      name: s.name,
      compositeScore:
        sentScore(s.lastSentMs) +
        s.starCount * 30 +
        s.threadedConvIds.size * 20 +
        s.openWithDwellCount * 5,
      signals: {
        sentTo: s.lastSentMs > 0,
        starCount: s.starCount,
        threadCount: s.threadedConvIds.size,
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
