import { NextRequest, NextResponse } from 'next/server';
import { yaiLifeGraphDelete } from '@/src/lib/life-graph/yai-life-graph-client';

// Proxies to YAI POST /yai/life-graph-agent/delete.
// v2 server wipes entities/, threads/, events/, commitments/, facts/, rawInfo/,
// senderScreening/main, topOfMind/main, ownerInfo/main + staging, ingestJobs/,
// and profile/main. After this, /backfill/start produces a fresh v2 graph.
export async function POST(req: NextRequest) {
  console.log(`[life-graph/delete] inbound ${req.method} ${req.nextUrl.pathname}`);
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const accountId = body?.accountId;
  if (!accountId) return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });

  const res = await yaiLifeGraphDelete(token, '/delete', { accountId });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
