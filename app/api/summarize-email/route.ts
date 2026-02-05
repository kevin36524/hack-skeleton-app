import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';

/**
 * Email content interface
 */
interface EmailContent {
  subject: string;
  from: string;
  to?: string;
  body: string;
  date?: string;
}

/**
 * POST /api/summarize-email
 * 
 * Summarizes email content using the email summarizer agent.
 * 
 * Request body:
 * {
 *   "subject": "Email subject line",
 *   "from": "sender@example.com",
 *   "to": "recipient@example.com" (optional),
 *   "body": "Full email body text",
 *   "date": "2024-01-15T10:30:00Z" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "summary": "Concise summary of the email...",
 *   "actionItems": ["Action 1", "Action 2"],
 *   "keyDetails": ["Detail 1", "Detail 2"],
 *   "urgency": "high|medium|low"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { subject, from, to, body: emailBody, date } = body as EmailContent;

    // Validate required fields
    if (!subject || !from || !emailBody) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields. Please provide subject, from, and body.' 
        },
        { status: 400 }
      );
    }

    // Get the email summarizer agent
    const agent = mastra.getAgent('emailSummarizer');
    
    if (!agent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email summarizer agent not found' 
        },
        { status: 500 }
      );
    }

    // Format the email content for the agent
    const emailContent = `
Subject: ${subject}
From: ${from}
${to ? `To: ${to}` : ''}
${date ? `Date: ${date}` : ''}

Body:
${emailBody}
    `.trim();

    // Generate summary using the agent
    const response = await agent.generate(`
Please analyze and summarize the following email:

${emailContent}

Provide a structured summary with:
1. A brief overview (2-4 sentences)
2. Any action items or requests
3. Key details (dates, names, numbers)
4. The urgency/priority level

Format your response as JSON with these fields:
- summary: string (the main summary)
- actionItems: string[] (array of action items, empty if none)
- keyDetails: string[] (array of key details)
- urgency: "high" | "medium" | "low"
`);

    // Parse the agent's response to extract structured data
    let parsedResponse;
    try {
      // Try to parse JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured response from text
        parsedResponse = {
          summary: response.text,
          actionItems: [],
          keyDetails: [],
          urgency: 'medium'
        };
      }
    } catch {
      // If parsing fails, return the raw text
      parsedResponse = {
        summary: response.text,
        actionItems: [],
        keyDetails: [],
        urgency: 'medium'
      };
    }

    return NextResponse.json({
      success: true,
      summary: parsedResponse.summary,
      actionItems: parsedResponse.actionItems || [],
      keyDetails: parsedResponse.keyDetails || [],
      urgency: parsedResponse.urgency || 'medium',
    });

  } catch (error) {
    console.error('Email summarization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to summarize email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/summarize-email
 * 
 * Returns API information and usage instructions.
 */
export async function GET() {
  return NextResponse.json({
    name: 'Email Summarization API',
    description: 'Summarizes email content using AI',
    method: 'POST',
    endpoint: '/api/summarize-email',
    requestBody: {
      subject: 'Email subject line (required)',
      from: 'Sender email address (required)',
      to: 'Recipient email address (optional)',
      body: 'Full email body text (required)',
      date: 'Email date in ISO format (optional)'
    },
    response: {
      success: 'boolean',
      summary: 'string - Concise summary of the email',
      actionItems: 'string[] - List of action items',
      keyDetails: 'string[] - List of key details',
      urgency: '"high" | "medium" | "low"'
    }
  });
}
