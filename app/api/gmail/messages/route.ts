import { NextRequest, NextResponse } from 'next/server';
import {
  getImapCredentials,
  withImap,
  GMAIL_LABEL_TO_IMAP,
  IMAP_TO_GMAIL_LABEL,
  encodeMessageId,
  gmailQueryToImapSearch,
  buildGmailMetadata,
} from '@/lib/imap/client';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);

    const { searchParams } = new URL(request.url);
    const labelIds = searchParams.get('labelIds')?.split(',') || ['INBOX'];
    const maxResults = parseInt(searchParams.get('maxResults') || '30');
    const q = searchParams.get('q') || '';

    const labelId = labelIds[0] || 'INBOX';
    const folderPath = GMAIL_LABEL_TO_IMAP[labelId] ?? 'INBOX';
    const folderLabel = IMAP_TO_GMAIL_LABEL[folderPath] ?? labelId;

    const messages = await withImap(email, password, async (client) => {
      const lock = await client.getMailboxLock(folderPath, { readonly: true });
      try {
        const criteria = gmailQueryToImapSearch(q);
        const uids = (await client.search(criteria, { uid: true })) as number[];

        // Most recent first: UIDs are assigned chronologically in Gmail
        const recentUids = uids.slice(-maxResults).reverse();
        if (recentUids.length === 0) return [];

        const result: Array<{ id: string; threadId: string }> = [];
        for await (const msg of client.fetch(
          recentUids,
          { uid: true, envelope: true, flags: true, internalDate: true },
          { uid: true }
        )) {
          const encodedId = encodeMessageId(folderPath, msg.uid);
          result.push({ id: encodedId, threadId: encodedId });
        }
        return result;
      } finally {
        lock.release();
      }
    });

    return NextResponse.json({ messages, resultSizeEstimate: messages.length });
  } catch (error: any) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: error.status || 500 }
    );
  }
}
