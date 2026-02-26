import { NextRequest, NextResponse } from 'next/server';
import {
  getImapCredentials,
  withImap,
  decodeMessageId,
  buildGmailMetadata,
  buildGmailFull,
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
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const folderLabel = imapToLabel[folder] ?? folder.toUpperCase();

    const message = await withImap(email, password, async (client) => {
      const lock = await client.getMailboxLock(folder, { readOnly: true });
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

        if (format === 'full' && msg.source) {
          const parsed = parseEmailSource(msg.source);
          return buildGmailFull(msg.uid, msg.envelope, msg.flags ?? new Set(), msg.internalDate, folder, folderLabel, parsed);
        }

        return buildGmailMetadata(msg.uid, msg.envelope, msg.flags ?? new Set(), msg.internalDate, folder, folderLabel);
      } finally {
        lock.release();
      }
    }, provider);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Message detail API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch message' },
      { status: error.status || 500 }
    );
  }
}
