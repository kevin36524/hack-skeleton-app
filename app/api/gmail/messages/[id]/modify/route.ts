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
    const body = await request.json();

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        addLabelIds: body.addLabelIds,
        removeLabelIds: body.removeLabelIds,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Modify message API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to modify message' },
      { status: error.status || 500 }
    );
  }
}
