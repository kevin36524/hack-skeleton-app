import { NextRequest, NextResponse } from 'next/server';
import { yaiLifeGraphGet } from '@/src/lib/life-graph/yai-life-graph-client';

// Proxies to YAI /yai/life-graph-agent/graph.
// Returns the v2 graph: { entities, threads, events, commitments, facts,
// topOfMind, screening, counts }.
export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  const accountId = req.nextUrl.searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });

  const res = await yaiLifeGraphGet(token, '/graph', { accountId });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
