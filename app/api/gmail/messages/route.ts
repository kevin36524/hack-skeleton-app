import { NextRequest, NextResponse } from 'next/server';
import {
  getImapCredentials,
  withImap,
  encodeMessageId,
  buildGmailMetadata,
  gmailQueryToImapSearch,
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
    const q = searchParams.get('q') || '';
    const stream = searchParams.get('stream') === 'true';

    const labelId = labelIds[0] || 'INBOX';
    const folderPath = labelToImap[labelId] ?? labelToImap['INBOX'] ?? 'INBOX';
    const folderLabel = imapToLabel[folderPath] ?? labelId;

    if (stream) {
      // Stream each message as a NDJSON line as it arrives from IMAP
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            await withImap(email, password, async (client) => {
              const lock = await client.getMailboxLock(folderPath, { readonly: true });
              try {
                const criteria = gmailQueryToImapSearch(q);
                const uids = (await client.search(criteria, { uid: true })) as number[];
                const recentUids = uids.slice(-maxResults).reverse();

                for await (const msg of client.fetch(
                  recentUids,
                  { uid: true, envelope: true, flags: true, internalDate: true },
                  { uid: true }
                )) {
                  const metadata = buildGmailMetadata(
                    msg.uid, msg.envelope, msg.flags, msg.internalDate,
                    folderPath, folderLabel
                  );
                  controller.enqueue(encoder.encode(JSON.stringify(metadata) + '\n'));
                }
              } finally {
                lock.release();
              }
            }, provider);
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Non-streaming path: buffer and return JSON
    const messages = await withImap(email, password, async (client) => {
      const lock = await client.getMailboxLock(folderPath, { readonly: true });
      try {
        const criteria = gmailQueryToImapSearch(q);
        const uids = (await client.search(criteria, { uid: true })) as number[];

        // Most recent first
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
    }, provider);

    return NextResponse.json({ messages, resultSizeEstimate: messages.length });
  } catch (error: any) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: error.status || 500 }
    );
  }
}
