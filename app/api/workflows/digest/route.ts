import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mailboxId, inboxFolderId, duration = 1 } = body;

    // Validate required fields
    if (!mailboxId || !inboxFolderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: mailboxId and inboxFolderId are required'
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

    // Get the email digest workflow
    const workflow = mastra.getWorkflow('emailDigestWorkflow');
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email digest workflow not found'
        },
        { status: 500 }
      );
    }

    console.log('[DIGEST API] Starting workflow with:', { mailboxId, inboxFolderId, duration });

    // Execute the workflow
    const run = await workflow.createRunAsync();
    const workflowResult = await run.start({
      inputData: {
        mailboxId,
        inboxFolderId,
        duration
      },
      runtimeContext,
    });

    console.log('[DIGEST API] Workflow completed with status:', workflowResult.status);

    if (workflowResult.status !== 'success') {
      throw new Error(`Workflow failed with status: ${workflowResult.status}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        digest: workflowResult.result.digest,
        mailboxId,
        inboxFolderId,
        duration,
      },
    });
  } catch (error) {
    console.error('[DIGEST API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
