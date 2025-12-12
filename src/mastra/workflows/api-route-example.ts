/**
 * Example API Route for Email Digest Workflow
 *
 * This file shows how to create a Next.js API route that executes
 * the email digest workflow.
 *
 * To use this, create a file at:
 * app/api/workflows/email-digest/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

/**
 * POST /api/workflows/email-digest
 *
 * Request body:
 * {
 *   "mailboxId": "string",
 *   "accountId": "string",
 *   "inboxFolderId": "string",
 *   "duration": number (optional, default 1)
 * }
 *
 * Headers:
 * - Authorization: Bearer <oauth-token>
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { mailboxId, accountId, inboxFolderId, duration = 1 } = body;

    // Validate required fields
    if (!mailboxId || !accountId || !inboxFolderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: mailboxId, accountId, or inboxFolderId',
        },
        { status: 400 }
      );
    }

    // Get OAuth token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authorization header with Bearer token is required',
        },
        { status: 401 }
      );
    }

    const oauthToken = authHeader.replace('Bearer ', '');

    // Create runtime context and set OAuth token
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', oauthToken);

    // Optional: Get user ID from session or request
    // const userId = await getUserIdFromSession(request);
    // if (userId) {
    //   runtimeContext.set('userId', userId);
    // }

    // Get the workflow
    const workflow = mastra.getWorkflow('emailDigestWorkflow');
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email digest workflow not found',
        },
        { status: 500 }
      );
    }

    // Create and execute workflow run
    const run = await workflow.createRunAsync();
    const workflowResult = await run.start({
      inputData: {
        mailboxId,
        accountId,
        inboxFolderId,
        duration,
      },
      runtimeContext,
    });

    // Check execution status
    if (workflowResult.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          error: `Workflow execution failed with status: ${workflowResult.status}`,
        },
        { status: 500 }
      );
    }

    // Return the digest result
    return NextResponse.json({
      success: true,
      data: {
        digest: workflowResult.result.digest,
        status: workflowResult.result.status,
        generatedAt: workflowResult.result.generatedAt,
      },
    });
  } catch (error) {
    console.error('Error in email digest workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Example curl request:
 *
 * curl -X POST http://localhost:3000/api/workflows/email-digest \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
 *   -d '{
 *     "mailboxId": "mailbox-123",
 *     "accountId": "account-456",
 *     "inboxFolderId": "inbox-789",
 *     "duration": 1
 *   }'
 */

/**
 * Example response:
 *
 * {
 *   "success": true,
 *   "data": {
 *     "digest": "# Daily Email Digest - 5 Emails\n\n## Overview...",
 *     "status": "success",
 *     "generatedAt": "2024-12-12T18:30:00.000Z"
 *   }
 * }
 */
