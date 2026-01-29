import { NextRequest, NextResponse } from 'next/server';
import { Space } from '@/lib/types/api';
import { findSimilarEmails } from '@/lib/services/spaces-processing';

interface FindSimilarRequest {
  mailboxId: string;
  accountId: string;
  guid: string;
  space: Space;
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: FindSimilarRequest = await request.json();
    const { mailboxId, accountId, guid, space } = body;

    if (!mailboxId || !accountId || !guid || !space) {
      return NextResponse.json(
        { error: 'Missing required fields: mailboxId, accountId, guid, space' },
        { status: 400 }
      );
    }

    // Check if phrases exist
    const allowlistedPhrases = space.extraData?.allowlistedPhrases || [];
    if (allowlistedPhrases.length === 0) {
      return NextResponse.json(
        { error: 'No allowlisted phrases found. Please generate phrases first.' },
        { status: 400 }
      );
    }

    console.log('[FIND-SIMILAR] Finding similar emails for space:', space.name);

    // Use extracted function
    const result = await findSimilarEmails(space, mailboxId, accountId, authHeader);

    return NextResponse.json({
      success: true,
      filteredMessageIds: result.filteredMessageIds,
      allowlistedMessageIds: result.allowlistedMessageIds,
      blocklistedMessageIds: result.blocklistedMessageIds,
      totalMatches: result.filteredMessageIds.length,
      allowlistedCount: result.allowlistedMessageIds.length,
      blocklistedCount: result.blocklistedMessageIds.length,
    });
  } catch (error) {
    console.error('[FIND-SIMILAR] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find similar emails',
        details: errorMessage,
        filteredMessageIds: [],
        allowlistedMessageIds: [],
        blocklistedMessageIds: [],
        totalMatches: 0,
        allowlistedCount: 0,
        blocklistedCount: 0,
      },
      { status: 500 }
    );
  }
}
