import { NextRequest, NextResponse } from 'next/server';
import { RequestContext } from '@mastra/core/request-context';
import { supabase } from '../../../lib/supabase';
import { mastra } from '../../../src/mastra';

const mailTriageAgent = mastra.getAgent('mailTriageAgent');

export async function POST(req: NextRequest) {
  try {
    // Extract auth token from Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No auth token provided' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { message, userGuid, accountId, sessionId, runId, action } = body;

    // Validate required fields for normal agent invocation
    if (!action && (!message || !userGuid || !sessionId)) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userGuid, sessionId' },
        { status: 400 }
      );
    }

    // Handle HITL approval/decline actions
    if (action === 'approve' && runId) {
      console.log(`[HITL] Approving tool call for runId: ${runId}`);
      const resumed = await mailTriageAgent.approveToolCall({ runId });
      return streamAgentResponse(resumed);
    }

    if (action === 'decline' && runId) {
      console.log(`[HITL] Declining tool call for runId: ${runId}`);
      await mailTriageAgent.declineToolCall({ runId });
      return NextResponse.json({ declined: true });
    }

    // Upsert agent_sessions row in Supabase
    const { error: upsertError } = await supabase
      .from('agent_sessions')
      .upsert(
        {
          user_guid: userGuid,
          session_id: sessionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      );

    if (upsertError) {
      console.error('Failed to upsert agent_sessions:', upsertError);
      // Non-fatal: continue with agent invocation
    }

    // Create runtime context with token and accountId
    const requestContext = new RequestContext();
    requestContext.set('token', token);
    if (accountId) {
      requestContext.set('accountId', accountId);
    }

    // Invoke agent with memory context
    const stream = await mailTriageAgent.stream(message, {
      requestContext,
      memory: {
        resource: userGuid, // stable user identifier
        thread: sessionId, // conversation session ID
      },
    });

    return streamAgentResponse(stream);
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Stream agent response to client
 */
function streamAgentResponse(stream: AsyncIterable<any>) {
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
