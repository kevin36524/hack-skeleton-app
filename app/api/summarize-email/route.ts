import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '../../../src/mastra';

const emailSummarizerAgent = mastra.getAgent('emailSummarizerAgent');

/**
 * POST /api/summarize-email
 *
 * Summarizes email content using the Email Summarizer Agent.
 *
 * Request Body:
 * {
 *   "emailContent": "string" - The full text of the email to summarize
 * }
 *
 * Response:
 * {
 *   "summary": "string" - The generated summary
 * }
 *
 * Error Response:
 * {
 *   "error": "string" - Error message
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { emailContent } = body;

    // Validate required fields
    if (!emailContent || typeof emailContent !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid field: emailContent (must be a string)' },
        { status: 400 }
      );
    }

    // Prepare the prompt for summarization
    const prompt = `Please summarize the following email content:\n\n${emailContent}`;

    // Generate summary using the agent
    const result = await emailSummarizerAgent.generate(prompt);

    // Return the summary
    return NextResponse.json({
      summary: result.text,
    });
  } catch (error) {
    console.error('Email summarization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/summarize-email
 *
 * Returns API documentation/info
 */
export async function GET() {
  return NextResponse.json({
    name: 'Email Summarizer API',
    description: 'Provides brief summaries of email content using AI',
    method: 'POST',
    endpoint: '/api/summarize-email',
    requestBody: {
      emailContent: 'string (required) - The full text content of the email to summarize',
    },
    response: {
      summary: 'string - The generated summary of the email',
    },
    example: {
      request: {
        emailContent:
          'Hi Team,\n\nI hope this email finds you well. I wanted to follow up on the Q4 project timeline. We need to finalize the deliverables by next Friday. Can everyone please submit their progress reports by Wednesday?\n\nAlso, don\'t forget about the all-hands meeting tomorrow at 10am.\n\nThanks,\nSarah',
      },
      response: {
        summary:
          'Follow-up on Q4 project timeline. Requests progress reports by Wednesday with deliverables due next Friday. Reminder for all-hands meeting tomorrow at 10am. Action Required: Submit progress reports.',
      },
    },
  });
}
