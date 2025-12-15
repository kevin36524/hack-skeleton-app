import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mailboxId, messageIds } = body;

    // Validate input
    if (!mailboxId || typeof mailboxId !== 'string') {
      return NextResponse.json(
        { error: 'mailboxId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'messageIds is required and must be a non-empty array' },
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

    const token = authHeader.replace('Bearer ', '');

    console.log('[PODCAST WORKFLOW API] Starting workflow for', messageIds.length, 'messages');

    // Create runtime context and set OAuth token
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', token);

    // Get and execute the workflow
    const workflow = mastra.getWorkflow('podcastEmailSummaryWorkflow');
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 500 }
      );
    }

    const run = await workflow.createRunAsync();
    const workflowResult = await run.start({
      inputData: { mailboxId, messageIds },
      runtimeContext,
    });

    console.log('[PODCAST WORKFLOW API] Workflow completed with status:', workflowResult.status);

    if (workflowResult.status !== 'success') {
      console.error('[PODCAST WORKFLOW API] Workflow failed:', workflowResult);
      return NextResponse.json(
        {
          success: false,
          error: `Workflow failed with status: ${workflowResult.status}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        podcastSummary: workflowResult.result.podcastSummary,
        emailCount: workflowResult.result.emailCount,
        generatedAt: workflowResult.result.generatedAt,
      },
    });
  } catch (error) {
    console.error('[PODCAST WORKFLOW API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
