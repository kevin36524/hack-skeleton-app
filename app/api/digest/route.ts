import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';

/**
 * Email Digest API Route
 *
 * POST /api/digest
 *
 * Request body:
 * {
 *   "emails": [
 *     {
 *       "from": "sender@example.com",
 *       "subject": "Email subject",
 *       "snippet": "Email content preview...",
 *       "timestamp": "2024-03-15T09:30:00Z"
 *     }
 *   ],
 *   "userId": "user-123",
 *   "threadId": "digest-session-1"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "digest": "Generated digest text...",
 *   "metadata": {
 *     "emailCount": 5,
 *     "generatedAt": "2024-03-15T10:00:00Z"
 *   }
 * }
 */

interface EmailSnippet {
  from: string;
  subject: string;
  snippet: string;
  timestamp?: string;
}

interface DigestRequest {
  emails: EmailSnippet[];
  userId?: string;
  threadId?: string;
  format?: 'text' | 'json';
}

export async function POST(request: NextRequest) {
  try {
    const body: DigestRequest = await request.json();

    // Validate request
    if (!body.emails || !Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: emails array is required and must not be empty'
        },
        { status: 400 }
      );
    }

    // Validate email structure
    for (const email of body.emails) {
      if (!email.from || !email.subject || !email.snippet) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid email format: from, subject, and snippet are required fields'
          },
          { status: 400 }
        );
      }
    }

    // Get the email digest agent
    const agent = mastra.getAgent('emailDigestAgent');

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email digest agent not found'
        },
        { status: 500 }
      );
    }

    // Format emails for the agent
    const emailsText = body.emails
      .map((email, index) =>
        `Email ${index + 1}:
From: ${email.from}
Subject: ${email.subject}${email.timestamp ? `\nTime: ${email.timestamp}` : ''}
Content: ${email.snippet}
---`
      )
      .join('\n\n');

    // Generate default IDs if not provided
    const userId = body.userId || 'anonymous';
    const threadId = body.threadId || `digest-${Date.now()}`;

    // Generate the digest
    const prompt = `Please generate an email digest from the following ${body.emails.length} emails:\n\n${emailsText}`;

    const response = await agent.generate(prompt, {
      memory: {
        resource: userId,
        thread: threadId
      }
    });

    // Return the digest
    return NextResponse.json({
      success: true,
      digest: response.text,
      metadata: {
        emailCount: body.emails.length,
        generatedAt: new Date().toISOString(),
        userId,
        threadId
      }
    });

  } catch (error) {
    console.error('Error generating email digest:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate email digest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Follow-up Question API
 *
 * POST /api/digest?followup=true
 *
 * Request body:
 * {
 *   "question": "Which emails require immediate action?",
 *   "userId": "user-123",
 *   "threadId": "digest-session-1"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const question = searchParams.get('question');
    const userId = searchParams.get('userId') || 'anonymous';
    const threadId = searchParams.get('threadId');

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question parameter is required'
        },
        { status: 400 }
      );
    }

    if (!threadId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ThreadId parameter is required for follow-up questions'
        },
        { status: 400 }
      );
    }

    const agent = mastra.getAgent('emailDigestAgent');

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email digest agent not found'
        },
        { status: 500 }
      );
    }

    const response = await agent.generate(question, {
      memory: {
        resource: userId,
        thread: threadId
      }
    });

    return NextResponse.json({
      success: true,
      answer: response.text,
      metadata: {
        question,
        userId,
        threadId,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing follow-up question:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process follow-up question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
