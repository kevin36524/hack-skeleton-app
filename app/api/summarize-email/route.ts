import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '../../../src/mastra';

const emailSummarizerAgent = mastra.getAgent('emailSummarizerAgent');

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { emailBody } = body;

    // Validate required field
    if (!emailBody || typeof emailBody !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: emailBody (must be a string)' },
        { status: 400 }
      );
    }

    // Invoke the summarizer agent
    // Using generate (not stream) since summaries are typically short
    const result = await emailSummarizerAgent.generate(emailBody);

    // Return the summary
    return NextResponse.json({
      summary: result.text,
    });
  } catch (error) {
    console.error('Email summarizer API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
