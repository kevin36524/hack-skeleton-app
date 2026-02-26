import { NextRequest, NextResponse } from 'next/server';
import { getImapCredentials, withImap, getProviderFromHeader } from '@/lib/imap/client';
import { getProviderConfig } from '@/lib/imap/providers';

function folderToLabel(
  path: string,
  delimiter: string,
  flags: Set<string>,
  imapToLabel: Record<string, string>,
  isSystemFolder: (p: string) => boolean
) {
  const name = path.split(delimiter ?? '/').pop() || path;
  const id = imapToLabel[path] ?? path;
  const type = isSystemFolder(path) ? 'system' : 'user';
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
    const provider = getProviderFromHeader(request);
    const { imapToLabel, isSystemFolder } = getProviderConfig(provider);

    const labels = await withImap(email, password, async (client) => {
      const tree = await client.list();
      return tree.map((item) =>
        folderToLabel(item.path, item.delimiter ?? '/', item.flags, imapToLabel, isSystemFolder)
      );
    }, provider);

    return NextResponse.json({ labels });
  } catch (error: any) {
    console.error('Labels API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch labels' },
      { status: error.status || 500 }
    );
  }
}
