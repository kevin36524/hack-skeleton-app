import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { searchParams } = new URL(request.url);
    const labelIds = searchParams.get('labelIds')?.split(',');
    const maxResults = parseInt(searchParams.get('maxResults') || '30');
    const q = searchParams.get('q');

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds,
      maxResults,
      q: q || undefined,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: error.status || 500 }
    );
  }
}
