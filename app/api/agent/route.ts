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

    // Handle HITL approval
    if (action === 'approve' && runId) {
      console.log(`[HITL] Approving tool call for runId: ${runId}`);
      const resumed = await mailTriageAgent.approveToolCall({ runId });
      return streamAgentResponse(resumed);
    }

    // Handle HITL decline
    if (action === 'decline' && runId) {
      console.log(`[HITL] Declining tool call for runId: ${runId}`);
      await mailTriageAgent.declineToolCall({ runId });
      return NextResponse.json({ declined: true });
    }

    // Upsert agent_sessions row in Supabase (non-fatal)
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
        resource: userGuid,
        thread: sessionId,
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
 * Reads a MastraModelOutput's fullStream and maps Mastra chunk types to the
 * SSE protocol expected by the frontend (text-delta, tool-call-pending,
 * tool-result, finish, error).
 *
 * Mastra chunk shape:  { type, runId, from, payload: { ... } }
 * Frontend SSE shape:  data: <json>\n\n
 */
function streamAgentResponse(output: any) {
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      const enqueue = (event: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // output.fullStream is a ReadableStream<ChunkType> from Mastra
      const reader: ReadableStreamDefaultReader<any> = output.fullStream.getReader();

      try {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;

          switch (chunk.type) {
            // Streaming text from the model
            case 'text-delta':
              enqueue({ type: 'text-delta', textDelta: chunk.payload?.text ?? '' });
              break;

            // Agent wants to execute a write tool — pause and ask the user
            case 'tool-call-approval':
              enqueue({
                type: 'tool-call-pending',
                runId: chunk.runId,
                toolName: chunk.payload?.toolName,
                input: chunk.payload?.args ?? {},
              });
              break;

            // Tool finished executing
            case 'tool-result':
              enqueue({
                type: 'tool-result',
                toolName: chunk.payload?.toolName,
                result: chunk.payload?.result,
              });
              break;

            // Model finished generating
            case 'finish':
              enqueue({
                type: 'finish',
                finishReason: chunk.payload?.stepResult?.reason ?? 'stop',
              });
              break;

            // Error during generation
            case 'error':
              enqueue({
                type: 'error',
                error: String(chunk.payload?.error ?? 'Unknown error'),
              });
              break;

            // All other chunk types (step-start, step-finish, tool-call, raw, etc.)
            // are intentionally ignored — the frontend doesn't need them
          }
        }
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        try {
          enqueue({
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream error',
          });
          controller.close();
        } catch {
          controller.error(error);
        }
      } finally {
        reader.releaseLock();
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
