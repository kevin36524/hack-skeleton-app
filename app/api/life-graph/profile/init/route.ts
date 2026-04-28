import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { getProfile, setProfile } from '@/src/lib/life-graph/db';
import type { Profile } from '@/src/lib/life-graph/types';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    console.warn('[profile/init] missing auth token');
    return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const accountId: string = body.accountId;
    if (!accountId) {
      console.warn('[profile/init] missing accountId');
      return NextResponse.json({ error: 'Missing accountId in request body' }, { status: 400 });
    }

    const uid = await getUserId(token, accountId);
    console.log(`[profile/init] uid=${uid}`);

    const existing = await getProfile(uid);
    if (existing) {
      console.log(`[profile/init] profile already exists for uid=${uid}`);
      return NextResponse.json({ uid, created: false });
    }

    const profile: Profile = {
      uid,
      email: '',
      timezone: 'UTC',
      backfillWindowMonths: 12,
      backfillStatus: {
        phase: 0,
        progress: 0,
        completedAt: null,
        costSpent: 0,
      },
      pinnedEntityIds: [],
      consentScope: {
        digest: 'never',
        triage: 'never',
        reply: 'never',
      },
      digestLastDeliveredAt: null,
    };

    await setProfile(uid, profile);
    console.log(`[profile/init] created profile for uid=${uid}`);
    return NextResponse.json({ uid, created: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[profile/init] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
