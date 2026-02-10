import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { id } = params;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.messages.trash({
      userId: 'me',
      id,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Trash message API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to trash message' },
      { status: error.status || 500 }
    );
  }
}
