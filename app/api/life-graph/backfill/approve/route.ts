import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (process.env.LIFE_GRAPH_BACKEND === 'yai') {
    const { yaiLifeGraphPost } = await import('@/src/lib/life-graph/yai-life-graph-client');
    const res = await yaiLifeGraphPost(token, '/backfill/approve', body);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // Local implementation
  const { getUserId } = await import('@/src/lib/life-graph/get-user-id');
  const { getIngestJob, updateIngestJob } = await import('@/src/lib/life-graph/db');

  try {
    const { accountId, jobId, approvedEmails } = body as {
      accountId: string;
      jobId: string;
      approvedEmails?: string[];
    };
    if (!accountId || !jobId) return NextResponse.json({ error: 'Missing accountId or jobId' }, { status: 400 });

    const uid = await getUserId(token, accountId);
    const job = await getIngestJob(uid, jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const update: Record<string, unknown> = { status: 'pending' };
    if (approvedEmails !== undefined) update.approvedCandidateEmails = approvedEmails;

    await updateIngestJob(uid, jobId, update as never);
    console.log(`[backfill/approve] uid=${uid} jobId=${jobId} approvedCount=${approvedEmails?.length ?? 'all'}`);
    return NextResponse.json({ approved: true, phase: job.phase });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/approve] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
