import { NextRequest, NextResponse } from 'next/server';
import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import { getMailboxId } from '@/src/mastra/helpers/get-mailbox-id';
import type { GetAccountsApiResponse } from '@/lib/types/api';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  try {
    const mailboxId = await getMailboxId(token);
    const resp = await yahooGet<GetAccountsApiResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/accounts`
    );
    const enabled = resp.accounts.filter((a) => a.status === 'ENABLED');
    const primary = enabled.find((a) => a.isPrimary) ?? enabled[0];
    if (!primary) return NextResponse.json({ error: 'No accounts found' }, { status: 404 });

    console.log(`[whoami] mailboxId=${mailboxId} accountId=${primary.id} email=${primary.email}`);
    return NextResponse.json({ accountId: primary.id, email: primary.email, mailboxId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[whoami] error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
