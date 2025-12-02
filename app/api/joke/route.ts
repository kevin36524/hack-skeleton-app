import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';

/**
 * POST /api/joke
 *
 * Generate a joke based on the provided prompt
 *
 * Request body:
 * {
 *   "prompt": string,  // The joke request (e.g., "Tell me a dad joke")
 *   "category"?: string // Optional: specific joke category
 * }
 *
 * Response:
 * {
 *   "joke": string,
 *   "success": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, category } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required', success: false },
        { status: 400 }
      );
    }

    // Get the joke agent from Mastra
    const jokeAgent = mastra.getAgent('jokeAgent');

    if (!jokeAgent) {
      return NextResponse.json(
        { error: 'Joke agent not found', success: false },
        { status: 500 }
      );
    }

    // Build the full prompt
    const fullPrompt = category
      ? `${prompt} (Category: ${category})`
      : prompt;

    // Generate the joke
    const response = await jokeAgent.generate(fullPrompt);

    return NextResponse.json({
      joke: response.text,
      success: true,
    });

  } catch (error) {
    console.error('Error generating joke:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate joke',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/joke
 *
 * Get a random joke
 *
 * Query parameters:
 * - category?: string (optional) - Specific joke category (e.g., "dad", "puns", "programming")
 *
 * Response:
 * {
 *   "joke": string,
 *   "category": string,
 *   "success": true
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // Get the joke agent from Mastra
    const jokeAgent = mastra.getAgent('jokeAgent');

    if (!jokeAgent) {
      return NextResponse.json(
        { error: 'Joke agent not found', success: false },
        { status: 500 }
      );
    }

    // Build prompt based on category
    let prompt = 'Tell me a joke';
    let responseCategory = 'random';

    if (category) {
      prompt = `Tell me a ${category} joke`;
      responseCategory = category;
    }

    // Generate the joke
    const response = await jokeAgent.generate(prompt);

    return NextResponse.json({
      joke: response.text,
      category: responseCategory,
      success: true,
    });

  } catch (error) {
    console.error('Error generating joke:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate joke',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
