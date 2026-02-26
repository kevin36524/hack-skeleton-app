import { NextRequest, NextResponse } from 'next/server';
import {
  getImapCredentials,
  withImap,
  encodeMessageId,
  getProviderFromHeader,
} from '@/lib/imap/client';
import { getProviderConfig } from '@/lib/imap/providers';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);
    const provider = getProviderFromHeader(request);
    const { labelToImap, imapToLabel } = getProviderConfig(provider);

    const { searchParams } = new URL(request.url);
    const labelIds = searchParams.get('labelIds')?.split(',') || ['INBOX'];
    const maxResults = parseInt(searchParams.get('maxResults') || '30');

    const labelId = labelIds[0] || 'INBOX';
    const folderPath = labelToImap[labelId] ?? labelToImap['INBOX'] ?? 'INBOX';

    const threads = await withImap(email, password, async (client) => {
      const lock = await client.getMailboxLock(folderPath, { readonly: true });
      try {
        const uids = (await client.search({ all: true }, { uid: true })) as number[];
        const recentUids = uids.slice(-maxResults).reverse();
        if (recentUids.length === 0) return [];

        const result: Array<{ id: string; snippet: string; historyId: string }> = [];
        for await (const msg of client.fetch(
          recentUids,
          { uid: true, envelope: true, flags: true, internalDate: true },
          { uid: true }
        )) {
          const encodedId = encodeMessageId(folderPath, msg.uid);
          result.push({
            id: encodedId,
            snippet: msg.envelope?.subject || '',
            historyId: msg.uid.toString(),
          });
        }
        return result;
      } finally {
        lock.release();
      }
    }, provider);

    return NextResponse.json({ threads, resultSizeEstimate: threads.length });
  } catch (error: any) {
    console.error('Threads API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch threads' },
      { status: error.status || 500 }
    );
  }
}
