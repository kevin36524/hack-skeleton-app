import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { mailboxId, messageId } = body;

    // Validate inputs
    if (!mailboxId || !messageId) {
      return NextResponse.json(
        { error: 'mailboxId and messageId are required' },
        { status: 400 }
      );
    }

    // Get OAuth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.replace('Bearer ', '');

    // Create runtime context and set OAuth token
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', token);

    console.log('[API] Executing email summarization workflow');

    // Get and execute the workflow
    const workflow = mastra.getWorkflow('emailSummarizationWorkflow');

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 500 }
      );
    }

    const run = await workflow.createRunAsync();

    const workflowResult = await run.start({
      inputData: {
        mailboxId,
        messageId,
      },
      runtimeContext,
    });

    console.log('[API] Workflow completed successfully');

    // Check if workflow succeeded
    if (workflowResult.status !== 'success') {
      throw new Error(`Workflow failed with status: ${workflowResult.status}`);
    }

    return NextResponse.json({
      success: true,
      data: workflowResult.result,
    });
  } catch (error) {
    console.error('[API] Error executing workflow:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
