import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'full';

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.threads.get({
      userId: 'me',
      id,
      format: format as any,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Thread detail API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch thread' },
      { status: error.status || 500 }
    );
  }
}
