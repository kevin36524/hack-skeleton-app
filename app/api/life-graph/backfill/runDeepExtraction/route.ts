import { NextRequest, NextResponse } from 'next/server';
import { yaiLifeGraphPost } from '@/src/lib/life-graph/yai-life-graph-client';

// Proxies to YAI /yai/life-graph-agent/backfill/runDeepExtraction.
// Returns 202 immediately; the YAI server runs Phase 2.1-2.4 + 3 + 4 in the
// background. Poll /backfill/status/:jobId for progress.
export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const res = await yaiLifeGraphPost(token, '/backfill/runDeepExtraction', body);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
