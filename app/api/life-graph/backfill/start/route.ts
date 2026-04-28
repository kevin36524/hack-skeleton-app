import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { getProfile, createIngestJob } from '@/src/lib/life-graph/db';
import type { IngestJob } from '@/src/lib/life-graph/types';

const COLD_START_BUDGET = parseFloat(process.env.LIFE_GRAPH_COLD_START_BUDGET_USD ?? '10');
const BACKFILL_WINDOW_MONTHS = parseInt(process.env.LIFE_GRAPH_BACKFILL_WINDOW_MONTHS ?? '12', 10);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    console.warn('[backfill/start] missing auth token');
    return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const accountId: string = body.accountId;
    if (!accountId) {
      console.warn('[backfill/start] missing accountId');
      return NextResponse.json({ error: 'Missing accountId in request body' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    console.log(`[backfill/start] uid=${uid}`);

    const profile = await getProfile(uid);
    if (!profile) {
      console.warn(`[backfill/start] no profile found for uid=${uid}`);
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

    const job: IngestJob = {
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
    };

    await createIngestJob(uid, job);
    console.log(`[backfill/start] created job jobId=${jobId} budget=$${COLD_START_BUDGET}`);

    // The client is responsible for calling /backfill/run to kick off the pipeline.
    return NextResponse.json({ jobId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[backfill/start] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
