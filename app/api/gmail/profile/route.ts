import { NextRequest, NextResponse } from 'next/server';
import { getImapCredentials, withImap } from '@/lib/imap/client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);

    const profile = await withImap(email, password, async (client) => {
      // Open INBOX to get message count
      const status = await client.status('INBOX', { messages: true, unseen: true });
      return {
        emailAddress: email,
        messagesTotal: status.messages ?? 0,
        threadsTotal: status.messages ?? 0,
        historyId: '0',
      };
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: error.status || 500 }
    );
  }
}
