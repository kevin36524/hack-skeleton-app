import { NextRequest, NextResponse } from 'next/server';
import { yaiGet } from '../../../src/mastra/helpers/yai-server-api';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');

  if (!accountId) {
    return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  }

  try {
    const response = await yaiGet<any>(
      token,
      `/yai/autopilot/getSpaces?acctId=${accountId}&appVer=7.80.0_74539`
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch spaces:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
