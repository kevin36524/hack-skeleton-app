import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const { jobId } = await params;
  const accountId = req.nextUrl.searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });

  if (process.env.LIFE_GRAPH_BACKEND === 'yai') {
    const { yaiLifeGraphGet } = await import('@/src/lib/life-graph/yai-life-graph-client');
    const res = await yaiLifeGraphGet(token, `/backfill/status/${jobId}`, { accountId });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // Local implementation
  const { getUserId } = await import('@/src/lib/life-graph/get-user-id');
  const { getIngestJob } = await import('@/src/lib/life-graph/db');

  try {
    const uid = await getUserId(token, accountId);
    const job = await getIngestJob(uid, jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    console.log(`[backfill/status] phase=${job.phase} status=${job.status} costSpent=$${job.costSpent.toFixed(4)}`);
    const response: Record<string, unknown> = {
      phase: job.phase,
      status: job.status,
      costSpent: job.costSpent,
      errorCount: job.errorCount,
      calls: job.calls ?? [],
      callCount: job.callCount ?? 0,
    };
    if (job.status === 'awaiting_approval' && job.phase === 1 && job.phase0Candidates) {
      response.candidates = job.phase0Candidates;
    }
    if (job.phase1SenderResults?.length) response.phase1SenderResults = job.phase1SenderResults;
    if (job.phase2EntityProgress?.length) response.phase2EntityProgress = job.phase2EntityProgress;
    if (job.phase3Summary) response.phase3Summary = job.phase3Summary;
    if (job.phase4Summary) response.phase4Summary = job.phase4Summary;
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/status] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
