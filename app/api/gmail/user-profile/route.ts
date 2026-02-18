import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { mastra } from '@/src/mastra';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    let emailAddress = 'unknown';
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: token });
      const gmail = google.gmail({ version: 'v1', auth });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      emailAddress = profile.data.emailAddress || 'unknown';
    } catch (e) {
      console.warn('[USER PROFILE] Could not fetch email address:', e);
    }

    const body = await request.json().catch(() => ({}));
    const maxResultsPerCategory = body.maxResultsPerCategory || 200;

    console.log('[API] Building user profile for:', emailAddress);

    const workflow = mastra.getWorkflow('buildUserProfileWorkflow');
    const run = await workflow.createRun();

    const streamOutput = run.stream({
      inputData: {
        accessToken: token,
        maxResultsPerCategory,
        emailAddress,
      },
    });

    return new Response(streamOutput.fullStream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('[API] User profile error:', error);
    const err = error as { message?: string; stack?: string; status?: number };
    return NextResponse.json(
      {
        error: err.message || 'Failed to build user profile',
        details: err.stack || 'No stack trace available',
      },
      { status: err.status || 500 }
    );
  }
}
