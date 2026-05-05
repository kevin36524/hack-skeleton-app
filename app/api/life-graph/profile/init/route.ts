import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (process.env.LIFE_GRAPH_BACKEND === 'yai') {
    const { yaiLifeGraphPost } = await import('@/src/lib/life-graph/yai-life-graph-client');
    const res = await yaiLifeGraphPost(token, '/profile/init', body);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  // Local implementation
  const { getUserId } = await import('@/src/lib/life-graph/get-user-id');
  const { getProfile, setProfile, updateProfileBackfillStatus } = await import('@/src/lib/life-graph/db');
  const { yahooGet } = await import('@/src/mastra/helpers/yahoo-api');
  const { getMailboxId } = await import('@/src/mastra/helpers/get-mailbox-id');
  const type = await import('@/src/lib/life-graph/types');
  void type;

  try {
    const accountId: string = body.accountId;
    if (!accountId) {
      console.warn('[profile/init] missing accountId');
      return NextResponse.json({ error: 'Missing accountId in request body' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    console.log(`[profile/init] uid=${uid}`);

    let email = '';
    try {
      const mailboxId = await getMailboxId(token);
      const resp = await yahooGet<{ accounts: { id: string; email: string }[] }>(
        token,
        `/mailboxes/@.id==${mailboxId}/accounts`
      );
      email = resp.accounts.find((a) => a.id === accountId)?.email ?? '';
    } catch (err) {
      console.warn(`[profile/init] could not resolve account email: ${err}`);
    }

    const existing = await getProfile(uid);
    if (existing) {
      if (!existing.email && email) {
        await updateProfileBackfillStatus(uid, {});
        const { db } = await import('@/src/lib/life-graph/firestore-client');
        await db.collection('users').doc(uid).collection('profile').doc('main').update({ email });
        return NextResponse.json({ uid, created: false, emailPatched: true });
      }
      return NextResponse.json({ uid, created: false });
    }

    const profile = {
      uid,
      email,
      timezone: 'UTC',
      backfillWindowMonths: 12,
      backfillStatus: { phase: 0, progress: 0, completedAt: null, costSpent: 0 },
      pinnedEntityIds: [],
      consentScope: { digest: 'never', triage: 'never', reply: 'never' },
      digestLastDeliveredAt: null,
    };

    await setProfile(uid, profile as never);
    return NextResponse.json({ uid, created: true, email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[profile/init] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
