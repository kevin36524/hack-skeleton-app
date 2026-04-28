import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { deleteEntity } from '@/src/lib/life-graph/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  try {
    const { entityId } = await params;
    const accountId = req.nextUrl.searchParams.get('accountId');
    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId query param' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    await deleteEntity(uid, entityId);
    console.log(`[entity/delete] uid=${uid} entityId=${entityId}`);
    return NextResponse.json({ deleted: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[entity/delete] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
