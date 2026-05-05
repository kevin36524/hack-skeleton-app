import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  const accountId = req.nextUrl.searchParams.get('accountId');
  if (!accountId) return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });

  if (process.env.LIFE_GRAPH_BACKEND === 'yai') {
    const { yaiLifeGraphDelete } = await import('@/src/lib/life-graph/yai-life-graph-client');
    const res = await yaiLifeGraphDelete(token, '/delete', { accountId });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // Local implementation
  const { getUserId } = await import('@/src/lib/life-graph/get-user-id');
  const { deleteUserGraph } = await import('@/src/lib/life-graph/db');

  try {
    const uid = await getUserId(token, accountId);
    console.log(`[life-graph/delete] deleting all data for uid=${uid}`);
    await deleteUserGraph(uid);
    return NextResponse.json({ deleted: true, uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[life-graph/delete] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
