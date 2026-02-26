import { NextRequest, NextResponse } from 'next/server';
import {
  getImapCredentials,
  withImap,
  decodeMessageId,
  buildGmailFull,
  buildGmailMetadata,
  parseEmailSource,
  getProviderFromHeader,
} from '@/lib/imap/client';
import { getProviderConfig } from '@/lib/imap/providers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);
    const provider = getProviderFromHeader(request);
    const { imapToLabel } = getProviderConfig(provider);
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'full';

    const { folder, uid } = decodeMessageId(id);
    if (!uid) {
      return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 });
    }

    const folderLabel = imapToLabel[folder] ?? folder.toUpperCase();

    const thread = await withImap(email, password, async (client) => {
      const lock = await client.getMailboxLock(folder, { readonly: true });
      try {
        const fetchOptions: any = {
          uid: true,
          envelope: true,
          flags: true,
          internalDate: true,
        };
        if (format === 'full') {
          fetchOptions.source = true;
        }

        const msg = await client.fetchOne(uid.toString(), fetchOptions, { uid: true });
        if (!msg) return null;

        let msgData: any;
        if (format === 'full' && msg.source) {
          const parsed = parseEmailSource(msg.source);
          msgData = buildGmailFull(msg.uid, msg.envelope, msg.flags, msg.internalDate, folder, folderLabel, parsed);
        } else {
          msgData = buildGmailMetadata(msg.uid, msg.envelope, msg.flags, msg.internalDate, folder, folderLabel);
        }

        return {
          id,
          historyId: msg.uid.toString(),
          snippet: msg.envelope?.subject || '',
          messages: [msgData],
        };
      } finally {
        lock.release();
      }
    }, provider);

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json(thread);
  } catch (error: any) {
    console.error('Thread detail API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch thread' },
      { status: error.status || 500 }
    );
  }
}
