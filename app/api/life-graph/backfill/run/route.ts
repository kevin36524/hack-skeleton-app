import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (process.env.LIFE_GRAPH_BACKEND === 'yai') {
    const { yaiLifeGraphPost } = await import('@/src/lib/life-graph/yai-life-graph-client');
    const res = await yaiLifeGraphPost(token, '/backfill/run', body);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // Local implementation
  const { Timestamp } = await import('firebase-admin/firestore');
  const { getUserId } = await import('@/src/lib/life-graph/get-user-id');
  const { getIngestJob, updateIngestJob, appendJobCalls, getProfile } = await import('@/src/lib/life-graph/db');
  const { yahooGet } = await import('@/src/mastra/helpers/yahoo-api');
  const { getMailboxId } = await import('@/src/mastra/helpers/get-mailbox-id');
  const { phase0Structural } = await import('@/src/lib/life-graph/cold-start/phase0-structural');
  const { phase1SenderProfiling } = await import('@/src/lib/life-graph/cold-start/phase1-sender-profiling');
  const { phase2DeepExtraction } = await import('@/src/lib/life-graph/cold-start/phase2-deep-extraction');
  const { phase3ThreadSweep } = await import('@/src/lib/life-graph/cold-start/phase3-thread-sweep');
  const { phase4TopOfMind } = await import('@/src/lib/life-graph/cold-start/phase4-topofmind');

  let accountId: string, jobId: string;
  try {
    accountId = body.accountId;
    jobId = body.jobId;
    if (!accountId || !jobId) throw new Error('Missing accountId or jobId');
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const uid = await getUserId(token, accountId);
  const profile = await getProfile(uid);
  let userEmail = profile?.email ?? '';

  if (!userEmail) {
    try {
      const mailboxId = await getMailboxId(token);
      const resp = await yahooGet<{ accounts: { id: string; email: string }[] }>(
        token,
        `/mailboxes/@.id==${mailboxId}/accounts`
      );
      userEmail = resp.accounts.find((a) => a.id === accountId)?.email ?? '';
    } catch (err) {
      console.warn(`[backfill/run] could not resolve user email: ${err}`);
    }
  }

  console.log(`[backfill/run] uid=${uid} jobId=${jobId} userEmail=${userEmail}`);

  try {
    const job = await getIngestJob(uid, jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (job.status === 'awaiting_approval') {
      return NextResponse.json({ error: 'Job is awaiting user approval before continuing' }, { status: 409 });
    }

    const windowMonths = parseInt(process.env.LIFE_GRAPH_BACKFILL_WINDOW_MONTHS ?? '12', 10);
    const CALL_CAP = 500;
    const callBuffer: import('@/src/lib/life-graph/types').JobCall[] = [];
    let totalCalls = 0;

    function logCall(call: import('@/src/lib/life-graph/types').JobCall) {
      totalCalls++;
      console.log(`[api-call] ${call.method} ${call.url} → ${call.status}`);
      if (totalCalls <= CALL_CAP) callBuffer.push(call);
    }

    async function flushCalls() {
      if (callBuffer.length === 0) return;
      const batch = callBuffer.splice(0);
      await appendJobCalls(uid, jobId, batch);
    }

    await updateIngestJob(uid, jobId, { status: 'running' });

    if (job.phase === 0) {
      const candidates = await phase0Structural(uid, token, accountId, windowMonths, jobId, logCall);
      await flushCalls();
      const displayCandidates = candidates
        .slice(0, 200)
        .map((c) => ({ email: c.email, name: c.name, score: c.compositeScore, signals: c.signals }));
      await updateIngestJob(uid, jobId, { status: 'awaiting_approval', phase0Candidates: displayCandidates });
      return NextResponse.json({ phase: 0, status: 'awaiting_approval', candidateCount: displayCandidates.length, candidates: displayCandidates });
    }

    if (job.phase === 1) {
      const stored = job.phase0Candidates ?? [];
      const approvedEmails = job.approvedCandidateEmails;
      const toProfile = approvedEmails ? stored.filter((c) => approvedEmails.includes(c.email)) : stored.slice(0, 200);
      const fakeCandidates = toProfile.map((c) => ({
        email: c.email,
        name: c.name,
        compositeScore: c.score,
        signals: c.signals ?? { sentTo: false, starCount: 0, threadCount: 0, openWithDwellCount: 0 },
      }));
      const entityIds = await phase1SenderProfiling(uid, token, fakeCandidates, jobId, userEmail, logCall);
      await flushCalls();
      await updateIngestJob(uid, jobId, { status: 'awaiting_approval', phase1EntityIds: entityIds });
      return NextResponse.json({ phase: 1, status: 'awaiting_approval', entityCount: entityIds.length });
    }

    const entityIds = job.phase1EntityIds ?? [];
    await phase2DeepExtraction(uid, token, entityIds, jobId, userEmail, logCall);
    await flushCalls();
    const jobAfterP2 = await getIngestJob(uid, jobId);
    if (jobAfterP2?.status === 'capped') return NextResponse.json({ status: 'capped' });

    await phase3ThreadSweep(uid, token, jobId, userEmail, logCall);
    await flushCalls();
    await phase4TopOfMind(uid, token, jobId, userEmail, logCall);
    await flushCalls();

    await updateIngestJob(uid, jobId, { status: 'completed', completedAt: Timestamp.now() });
    return NextResponse.json({ status: 'completed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/run] fatal error: ${message}`);
    await updateIngestJob(uid, jobId, { status: 'failed' }).catch(() => {});
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
