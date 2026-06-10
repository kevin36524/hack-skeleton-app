import { NextRequest, NextResponse } from 'next/server';
import { yaiLifeGraphPost } from '@/src/lib/life-graph/yai-life-graph-client';

// Proxies to YAI /yai/life-graph-agent/backfill/run.
// Single-call auto-run: runs Phase 0 (corpus) + Phase 1 (segmentation)
// synchronously, auto-accepts all top candidates ("select all"), then runs the
// heavy extraction (Phase 2→3→4) in the background. Returns 202 immediately with
// { jobId, accepted }. No approval round-trip, no candidate list.
// Poll /backfill/status/:jobId for progress.
export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const res = await yaiLifeGraphPost(token, '/backfill/run', body);
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
