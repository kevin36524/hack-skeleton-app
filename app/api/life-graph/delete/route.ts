import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { deleteUserGraph } from '@/src/lib/life-graph/db';

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  try {
    const accountId = req.nextUrl.searchParams.get('accountId');
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    console.log(`[life-graph/delete] deleting all data for uid=${uid}`);
    await deleteUserGraph(uid);
    console.log(`[life-graph/delete] done uid=${uid}`);
    return NextResponse.json({ deleted: true, uid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[life-graph/delete] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
