import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

/**
 * POST /api/workflows/summarize-email
 *
 * Executes the email summarization workflow.
 *
 * Request body:
 * {
 *   "mailboxId": "string",
 *   "messageId": "string"
 * }
 *
 * Request headers:
 * Authorization: Bearer <oauth-token>
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "summary": "string",
 *     "status": "success",
 *     "mailboxId": "string",
 *     "messageId": "string"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { mailboxId, messageId } = body;

    // Validate required fields
    if (!mailboxId || !messageId) {
      return NextResponse.json(
        {
          success: false,
          error: 'mailboxId and messageId are required'
        },
        { status: 400 }
      );
    }

    // Get OAuth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authorization header required'
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create runtime context and set OAuth token
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', token);

    // Get the workflow
    const workflow = mastra.getWorkflow('emailSummarizationWorkflow');
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found'
        },
        { status: 500 }
      );
    }

    // Create a workflow run
    const run = await workflow.createRunAsync();

    // Execute the workflow with input data and runtime context
    const workflowResult = await run.start({
      inputData: { mailboxId, messageId },
      runtimeContext,
    });

    // Check workflow execution status
    if (workflowResult.status !== 'success') {
      throw new Error(`Workflow failed with status: ${workflowResult.status}`);
    }

    // Return the workflow result
    return NextResponse.json({
      success: true,
      data: workflowResult.result,
    });

  } catch (error) {
    console.error('Error executing email summarization workflow:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
