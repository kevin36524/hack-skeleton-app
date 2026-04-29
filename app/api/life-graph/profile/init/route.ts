import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/src/lib/life-graph/get-user-id';
import { getProfile, setProfile, updateProfileBackfillStatus } from '@/src/lib/life-graph/db';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import type { Profile } from '@/src/lib/life-graph/types';
import type { GetAccountsApiResponse } from '@/lib/types/api';

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

    // Fetch the account email from Yahoo so we can store it in the profile
    let email = '';
    try {
      const mailboxId = await getMailboxId(token);
      const resp = await yahooGet<GetAccountsApiResponse>(token, `/mailboxes/@.id==${mailboxId}/accounts`);
      const account = resp.accounts.find((a) => a.id === accountId);
      email = account?.email ?? '';
      console.log(`[profile/init] resolved email=${email} for accountId=${accountId}`);
    } catch (err) {
      console.warn(`[profile/init] could not resolve account email: ${err}`);
    }

    const existing = await getProfile(uid);
    if (existing) {
      // If profile exists but has no email, patch it now
      if (!existing.email && email) {
        await updateProfileBackfillStatus(uid, {});
        // Update email directly since updateProfileBackfillStatus only touches backfillStatus
        const { db } = await import('@/src/lib/life-graph/firestore-client');
        await db.collection('users').doc(uid).collection('profile').doc('main').update({ email });
        console.log(`[profile/init] patched email on existing profile uid=${uid}`);
        return NextResponse.json({ uid, created: false, emailPatched: true });
      }
      console.log(`[profile/init] profile already exists for uid=${uid} email=${existing.email}`);
      return NextResponse.json({ uid, created: false });
    }

    const profile: Profile = {
      uid,
      email,
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
    console.log(`[profile/init] created profile uid=${uid} email=${email}`);
    return NextResponse.json({ uid, created: true, email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[profile/init] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
