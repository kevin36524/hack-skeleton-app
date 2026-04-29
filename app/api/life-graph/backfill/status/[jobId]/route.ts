import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { getIngestJob } from '@/src/lib/life-graph/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    console.warn('[backfill/status] missing auth token');
    return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
  }

  try {
    const { jobId } = await params;
    const accountId = req.nextUrl.searchParams.get('accountId');
    if (!accountId) {
      console.warn('[backfill/status] missing accountId query param');
      return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    console.log(`[backfill/status] uid=${uid} jobId=${jobId}`);

    const job = await getIngestJob(uid, jobId);
    if (!job) {
      console.warn(`[backfill/status] job not found uid=${uid} jobId=${jobId}`);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    console.log(`[backfill/status] phase=${job.phase} status=${job.status} costSpent=$${job.costSpent.toFixed(4)} calls=${job.callCount ?? 0}`);
    const response: Record<string, unknown> = {
      phase: job.phase,
      status: job.status,
      costSpent: job.costSpent,
      errorCount: job.errorCount,
      calls: job.calls ?? [],
      callCount: job.callCount ?? 0,
    };
    // Include candidates so the UI can render the HITL review without waiting for the fire-and-forget /run response
    if (job.status === 'awaiting_approval' && job.phase === 1 && job.phase0Candidates) {
      response.candidates = job.phase0Candidates;
    }
    if (job.phase1SenderResults && job.phase1SenderResults.length > 0) {
      response.phase1SenderResults = job.phase1SenderResults;
    }
    if (job.phase2EntityProgress && job.phase2EntityProgress.length > 0) {
      response.phase2EntityProgress = job.phase2EntityProgress;
    }
    if (job.phase3Summary) {
      response.phase3Summary = job.phase3Summary;
    }
    if (job.phase4Summary) {
      response.phase4Summary = job.phase4Summary;
    }
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/status] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
