import { NextRequest, NextResponse } from 'next/server';
import { Space } from '@/lib/types/api';
import { mastra } from '@/src/mastra';

interface GenerateFeedbackPhrasesRequest {
  guid: string;
  accountId: string;
  space: Space;
  userFeedback: string;
  phraseType: 'allowlist' | 'blocklist';
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateFeedbackPhrasesRequest = await request.json();
    const { guid, accountId, space, userFeedback, phraseType } = body;

    if (!guid || !accountId || !space || !userFeedback || !phraseType) {
      return NextResponse.json(
        { error: 'Missing required fields: guid, accountId, space, userFeedback, phraseType' },
        { status: 400 }
      );
    }

    console.log('[FEEDBACK-PHRASES] Generating phrases for:', userFeedback, 'Type:', phraseType);

    // Step 1: Generate phrases using Mastra agent
    console.log('[FEEDBACK-PHRASES] Step 1: Generating phrases with Mastra agent...');

    const feedbackPhraseGeneratorAgent = mastra.getAgent('feedbackPhraseGenerator');

    // Prepare context for the agent
    const spaceContext = {
      name: space.name,
      justification: space.justification,
      keywords: space.keywords,
      emailSenders: space.emailSenders.map(s => ({
        name: s.name,
        email: s.email,
      })),
    };

    const agentPrompt = `Generate phrases based on this user feedback:

User Feedback: ${userFeedback}
Phrase Type: ${phraseType}
Space Context: ${JSON.stringify(spaceContext, null, 2)}`;

    const agentResponse = await feedbackPhraseGeneratorAgent.generate(agentPrompt);

    let responseText = agentResponse.text || '{}';

    // Strip markdown code blocks if present
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      console.error('[FEEDBACK-PHRASES] Failed to parse agent response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Extract phrases from response
    const phrases: string[] = parsedResponse.phrases || [];

    if (!Array.isArray(phrases) || phrases.length === 0) {
      return NextResponse.json(
        { error: 'No phrases generated' },
        { status: 500 }
      );
    }

    console.log('[FEEDBACK-PHRASES] Generated', phrases.length, 'phrases');

    return NextResponse.json({
      success: true,
      phrases,
    });
  } catch (error) {
    console.error('[FEEDBACK-PHRASES] Error:', error);

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
