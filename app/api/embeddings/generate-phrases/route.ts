import { NextRequest, NextResponse } from 'next/server';
import { Space } from '@/lib/types/api';
import { generateAllowlistedPhrases } from '@/lib/services/spaces-processing';

interface GeneratePhrasesRequest {
  guid: string;
  accountId: string;
  space: Space;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GeneratePhrasesRequest = await request.json();
    const { guid, accountId, space } = body;

    if (!guid || !accountId || !space) {
      return NextResponse.json(
        { error: 'Missing required fields: guid, accountId, space' },
        { status: 400 }
      );
    }

    console.log('[PHRASES] Generating allowlisted phrases for space:', space.name);

    // Generate phrases using extracted function
    const phrases = await generateAllowlistedPhrases(space, guid, accountId);

    return NextResponse.json({
      success: true,
      phrases,
      filteredMessageIds: [],
      totalMatches: 0,
      originalMessageCount: 0,
    });
  } catch (error) {
    console.error('[PHRASES] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate phrases',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
