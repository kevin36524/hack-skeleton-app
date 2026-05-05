import { NextRequest, NextResponse } from 'next/server';

const COLD_START_BUDGET = parseFloat(process.env.LIFE_GRAPH_COLD_START_BUDGET_USD ?? '10');
const BACKFILL_WINDOW_MONTHS = parseInt(process.env.LIFE_GRAPH_BACKFILL_WINDOW_MONTHS ?? '12', 10);

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (process.env.LIFE_GRAPH_BACKEND === 'yai') {
    const { yaiLifeGraphPost } = await import('@/src/lib/life-graph/yai-life-graph-client');
    const res = await yaiLifeGraphPost(token, '/backfill/start', body);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // Local implementation
  const { randomUUID } = await import('crypto');
  const { Timestamp } = await import('firebase-admin/firestore');
  const { getUserId } = await import('@/src/lib/life-graph/get-user-id');
  const { getProfile, createIngestJob } = await import('@/src/lib/life-graph/db');

  try {
    const accountId: string = body.accountId;
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId in request body' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    const profile = await getProfile(uid);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not initialized. Call /api/life-graph/profile/init first.' },
        { status: 400 }
      );
    }

    const jobId = randomUUID();
    const now = Timestamp.now();
    const windowStart = Timestamp.fromDate(
      new Date(Date.now() - BACKFILL_WINDOW_MONTHS * 30 * 24 * 60 * 60 * 1000)
    );

    await createIngestJob(uid, {
      id: jobId,
      kind: 'cold_start',
      phase: 0,
      windowStart,
      windowEnd: now,
      costBudget: COLD_START_BUDGET,
      costSpent: 0,
      status: 'pending',
      errorCount: 0,
      processedMessageIds: [],
      calls: [],
      callCount: 0,
      createdAt: now,
      completedAt: null,
      token,
    } as never);

    console.log(`[backfill/start] created job jobId=${jobId} budget=$${COLD_START_BUDGET}`);
    return NextResponse.json({ jobId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/start] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
