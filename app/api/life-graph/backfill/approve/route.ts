import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { getIngestJob, updateIngestJob } from '@/src/lib/life-graph/db';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accountId, jobId, approvedEmails } = body as {
      accountId: string;
      jobId: string;
      approvedEmails?: string[];
    };
    if (!accountId || !jobId) {
      return NextResponse.json({ error: 'Missing accountId or jobId' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    const job = await getIngestJob(uid, jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const update: Record<string, unknown> = { status: 'pending' };
    if (approvedEmails !== undefined) {
      update.approvedCandidateEmails = approvedEmails;
    }

    await updateIngestJob(uid, jobId, update as never);
    console.log(`[backfill/approve] uid=${uid} jobId=${jobId} phase=${job.phase} approvedCount=${approvedEmails?.length ?? 'all'}`);
    return NextResponse.json({ approved: true, phase: job.phase });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/approve] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
