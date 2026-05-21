import { NextRequest, NextResponse } from 'next/server';
import { yaiLifeGraphGet } from '@/src/lib/life-graph/yai-life-graph-client';

// Proxies to YAI /yai/life-graph-agent/backfill/status/:jobId.
// Returns the v2 job doc: phase / status / costSpent / errorCount / calls /
// v2Self / v2UserType / v2BucketCounts / v2ProcessedSenders.
export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const { jobId } = await params;
  const accountId = req.nextUrl.searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });

  const res = await yaiLifeGraphGet(token, `/backfill/status/${jobId}`, { accountId });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
