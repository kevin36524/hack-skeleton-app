import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { getIngestJob, updateIngestJob, appendJobCalls, getProfile } from '@/src/lib/life-graph/db';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import type { GetAccountsApiResponse } from '@/lib/types/api';
import type { JobCall } from '@/src/lib/life-graph/types';
import type { CandidateSender } from '@/src/lib/life-graph/cold-start/phase0-structural';
import { phase0Structural } from '@/src/lib/life-graph/cold-start/phase0-structural';
import { phase1SenderProfiling } from '@/src/lib/life-graph/cold-start/phase1-sender-profiling';
import { phase2DeepExtraction } from '@/src/lib/life-graph/cold-start/phase2-deep-extraction';
import { phase3ThreadSweep } from '@/src/lib/life-graph/cold-start/phase3-thread-sweep';
import { phase4TopOfMind } from '@/src/lib/life-graph/cold-start/phase4-topofmind';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    console.warn('[backfill/run] missing auth token');
    return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
  }

  let accountId: string, jobId: string;
  try {
    const body = await req.json();
    accountId = body.accountId;
    jobId = body.jobId;
    if (!accountId || !jobId) throw new Error('Missing accountId or jobId');
  } catch (err: unknown) {
    console.error(`[backfill/run] invalid body: ${err}`);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const uid = await getUserId(token, accountId);
  const profile = await getProfile(uid);
  let userEmail = profile?.email ?? '';

  // If profile exists but email wasn't captured at init time, fetch it now
  if (!userEmail) {
    try {
      const mailboxId = await getMailboxId(token);
      const resp = await yahooGet<GetAccountsApiResponse>(token, `/mailboxes/@.id==${mailboxId}/accounts`);
      const account = resp.accounts.find((a) => a.id === accountId);
      userEmail = account?.email ?? '';
      console.log(`[backfill/run] resolved userEmail=${userEmail} via accounts API`);
    } catch (err) {
      console.warn(`[backfill/run] could not resolve user email: ${err}`);
    }
  }

  console.log(`[backfill/run] uid=${uid} jobId=${jobId} userEmail=${userEmail}`);

  try {
    const job = await getIngestJob(uid, jobId);
    if (!job) {
      console.warn(`[backfill/run] job not found uid=${uid} jobId=${jobId}`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status === 'awaiting_approval') {
      return NextResponse.json({ error: 'Job is awaiting user approval before continuing' }, { status: 409 });
    }

    const windowMonths = parseInt(process.env.LIFE_GRAPH_BACKFILL_WINDOW_MONTHS ?? '12', 10);

    const CALL_CAP = 500;
    const callBuffer: JobCall[] = [];
    let totalCalls = 0;

    function logCall(call: JobCall) {
      totalCalls++;
      console.log(`[api-call] ${call.method} ${call.url} → ${call.status}`);
      if (totalCalls <= CALL_CAP) callBuffer.push(call);
    }

    async function flushCalls() {
      if (callBuffer.length === 0) return;
      const batch = callBuffer.splice(0);
      await appendJobCalls(uid, jobId, batch);
      console.log(`[backfill/run] flushed ${batch.length} calls (total=${totalCalls})`);
    }

    await updateIngestJob(uid, jobId, { status: 'running' });

    // ── Phase 0: structural scoring ──────────────────────────────────────────
    if (job.phase === 0) {
      console.log(`[backfill/run] phase 0 — structural scoring`);
      const candidates = await phase0Structural(uid, token, accountId, windowMonths, jobId, logCall);
      await flushCalls();

      const displayCandidates = candidates
        .slice(0, 200)
        .map((c) => ({ email: c.email, name: c.name, score: c.compositeScore, signals: c.signals }));

      // phase0Structural already set job.phase=1 internally
      await updateIngestJob(uid, jobId, {
        status: 'awaiting_approval',
        phase0Candidates: displayCandidates,
      });

      console.log(`[backfill/run] phase 0 done — ${candidates.length} candidates, awaiting approval`);
      return NextResponse.json({
        phase: 0,
        status: 'awaiting_approval',
        candidateCount: displayCandidates.length,
        candidates: displayCandidates,
      });
    }

    // ── Phase 1: sender profiling ─────────────────────────────────────────────
    if (job.phase === 1) {
      console.log(`[backfill/run] phase 1 — sender profiling`);
      const stored = job.phase0Candidates ?? [];
      const approvedEmails = job.approvedCandidateEmails;
      const toProfile = approvedEmails
        ? stored.filter((c) => approvedEmails.includes(c.email))
        : stored.slice(0, 200);

      const fakeCandidates: CandidateSender[] = toProfile.map((c) => ({
        email: c.email,
        name: c.name,
        compositeScore: c.score,
        signals: c.signals ?? { sentTo: false, starCount: 0, threadCount: 0, openWithDwellCount: 0 },
      }));

      const entityIds = await phase1SenderProfiling(uid, token, fakeCandidates, jobId, userEmail, logCall);
      await flushCalls();

      // phase1SenderProfiling already set job.phase=2 internally
      await updateIngestJob(uid, jobId, {
        status: 'awaiting_approval',
        phase1EntityIds: entityIds,
      });

      console.log(`[backfill/run] phase 1 done — ${entityIds.length} entities, awaiting approval`);
      return NextResponse.json({
        phase: 1,
        status: 'awaiting_approval',
        entityCount: entityIds.length,
      });
    }

    // ── Phases 2–4: deep extraction + thread sweep + top-of-mind ─────────────
    console.log(`[backfill/run] phase 2-4 — deep extraction`);
    const entityIds = job.phase1EntityIds ?? [];

    await phase2DeepExtraction(uid, token, entityIds, jobId, userEmail, logCall);
    await flushCalls();

    const jobAfterP2 = await getIngestJob(uid, jobId);
    if (jobAfterP2?.status === 'capped') {
      console.warn(`[backfill/run] cost cap hit after phase 2`);
      return NextResponse.json({ status: 'capped' });
    }

    await phase3ThreadSweep(uid, token, jobId, userEmail, logCall);
    await flushCalls();

    await phase4TopOfMind(uid, token, jobId, userEmail, logCall);
    await flushCalls();

    await updateIngestJob(uid, jobId, { status: 'completed', completedAt: Timestamp.now() });
    console.log(`[backfill/run] all phases complete`);
    return NextResponse.json({ status: 'completed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/run] fatal error: ${message}`);
    await updateIngestJob(uid, jobId, { status: 'failed' }).catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
