import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { profileStreamCallbacks } from '@/src/mastra/profile-stream-bridge';

function summarizeStepInput(stepId: string, input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const d = { ...(input as Record<string, unknown>) };
  if ('accessToken' in d) d.accessToken = '[redacted]';

  switch (stepId) {
    case 'fetch-inbox-messages':
      return { maxResults: d.maxResults };

    case 'fetch-message-metadata':
      return {
        totalFound: d.totalFound,
        messageIds: Array.isArray(d.messageIds)
          ? `[${d.messageIds.length} IDs]`
          : d.messageIds,
      };

    case 'generate-summary':
      return {
        emailCount: d.emailCount,
        csvRows: typeof d.csv === 'string' ? d.csv.split('\n').length - 1 : 0,
      };

    default:
      return d;
  }
}

function summarizeStepOutput(stepId: string, output: unknown): unknown {
  if (!output || typeof output !== 'object') return output;
  const d = output as Record<string, unknown>;

  switch (stepId) {
    case 'fetch-inbox-messages':
      return { totalFound: d.totalFound };

    case 'fetch-message-metadata':
      return {
        emailCount: d.emailCount,
        fetchErrors: d.fetchErrors,
        csvRows: typeof d.csv === 'string' ? d.csv.split('\n').length - 1 : 0,
      };

    case 'generate-summary':
      return {
        emailCount: d.emailCount,
        generatedAt: d.generatedAt,
        summaryLength: typeof d.summary === 'string' ? `${d.summary.length} chars` : 0,
        usage: d.usage,
      };

    default:
      return output;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await request.json().catch(() => ({}));
    const maxResults: number = body.maxResults ?? 50;
    const userProfile: string = body.userProfile ?? '';
    const VALID_MODELS = ['gemini-flash-lite', 'groq', 'kimi'] as const;
    type SupportedModel = typeof VALID_MODELS[number];
    const rawModel = body.model ?? 'gemini-flash-lite';
    const model: SupportedModel = VALID_MODELS.includes(rawModel) ? rawModel : 'gemini-flash-lite';

    console.log('[inbox-summary] Starting inbox summary workflow');

    const streamId = crypto.randomUUID();
    const workflow = mastra.getWorkflow('summarizeInboxWorkflow');
    const run = await workflow.createRun();

    const streamOutput = run.stream({
      inputData: {
        accessToken: token,
        maxResults,
        userProfile,
        streamId,
        model,
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const emit = (eventType: string, data: object) => {
          const chunk = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        };

        // Register token callback before iterating so no summary tokens are missed
        profileStreamCallbacks.set(streamId, (tok: string) => {
          emit('summary-chunk', { token: tok });
        });

        try {
          let finalResult: unknown = null;

          for await (const event of streamOutput.fullStream as AsyncIterable<any>) {
            const { type, payload } = event ?? {};

            if (type === 'workflow-step-start') {
              const stepId = payload?.id;
              emit('step-start', {
                stepId,
                input: summarizeStepInput(stepId, payload?.payload),
              });
            } else if (type === 'workflow-step-result') {
              const { id, status, output, payload: inputPayload } = payload ?? {};
              if (status === 'success') {
                if (id === 'generate-summary') finalResult = output;
                emit('step-complete', {
                  stepId: id,
                  input: summarizeStepInput(id, inputPayload),
                  output: summarizeStepOutput(id, output),
                });
              } else if (status === 'failed') {
                emit('step-error', { stepId: id });
              }
            }
          }

          emit('workflow-complete', { result: finalResult });
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          profileStreamCallbacks.delete(streamId);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('[inbox-summary] Error:', error);
    const err = error as { message?: string; stack?: string; status?: number };
    return NextResponse.json(
      {
        error: err.message || 'Failed to summarize inbox',
        details: err.stack || 'No stack trace available',
      },
      { status: err.status || 500 }
    );
  }
}
