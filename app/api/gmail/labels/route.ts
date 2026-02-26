import { NextRequest, NextResponse } from 'next/server';
import { getImapCredentials, withImap } from '@/lib/imap/client';

// Map IMAP folder names to Gmail-style label objects
function folderToLabel(path: string, delimiter: string, flags: Set<string>) {
  const name = path.split(delimiter ?? '/').pop() || path;

  // Derive a stable Gmail-like ID
  const idMap: Record<string, string> = {
    INBOX: 'INBOX',
    '[Gmail]/Sent Mail': 'SENT',
    '[Gmail]/Drafts': 'DRAFT',
    '[Gmail]/Trash': 'TRASH',
    '[Gmail]/Spam': 'SPAM',
    '[Gmail]/Starred': 'STARRED',
    '[Gmail]/Important': 'IMPORTANT',
    '[Gmail]/All Mail': 'ALL',
  };
  const id = idMap[path] ?? path;
  const type = path.startsWith('[Gmail]') || idMap[path] ? 'system' : 'user';
  const labelListVisibility = flags.has('\\Noselect') ? 'labelHide' : 'labelShow';

  return {
    id,
    name,
    type,
    labelListVisibility,
    messageListVisibility: labelListVisibility === 'labelHide' ? 'hide' : 'show',
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);

    const labels = await withImap(email, password, async (client) => {
      const tree = await client.list();
      return tree.map((item) => folderToLabel(item.path, item.delimiter ?? '/', item.flags));
    });

    return NextResponse.json({ labels });
  } catch (error: any) {
    console.error('Labels API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch labels' },
      { status: error.status || 500 }
    );
  }
}
