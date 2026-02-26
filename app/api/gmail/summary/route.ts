import { NextRequest, NextResponse } from 'next/server';
import { getImapCredentials, getProviderFromHeader } from '@/lib/imap/client';
import { mastra } from '@/src/mastra';
import {
  profileStreamCallbacks,
  workflowAbortControllers,
  workflowKillSwitches,
  cleanupWorkflow
} from '@/src/mastra/profile-stream-bridge';

// Summarize step INPUT to avoid sending huge arrays over SSE
function summarizeInput(stepId: string, input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const d = { ...(input as Record<string, unknown>) };

  if ('appPassword' in d) d.appPassword = '[redacted]';

  switch (stepId) {
    case 'fetch-inbox-emails':
      return { maxResults: d.maxResults };

    case 'generate-summary':
      return {
        totalFetched: d.totalFetched,
        fetchErrors: d.fetchErrors,
        emails: Array.isArray(d.emails)
          ? `[${d.emails.length} emails]`
          : d.emails,
      };

    default:
      return d;
  }
}

// Summarize step OUTPUT to avoid sending huge arrays over SSE
function summarizeOutput(stepId: string, output: unknown): unknown {
  if (!output || typeof output !== 'object') return output;
  const d = output as Record<string, unknown>;

  switch (stepId) {
    case 'fetch-inbox-emails': {
      const emails = Array.isArray(d.emails) ? d.emails : [];
      return {
        totalFetched: d.totalFetched,
        fetchErrors: d.fetchErrors,
        sample: emails.slice(0, 3).map((e: any) => ({
          from: e.from,
          subject: e.subject,
          date: e.date,
        })),
      };
    }

    case 'generate-summary':
      return {
        emailAddress: d.emailAddress,
        generatedAt: d.generatedAt,
        short_summary: d.short_summary,
        emailCount: Array.isArray(d.emails) ? d.emails.length : 0,
        stats: d.stats,
      };

    default:
      return output;
  }
}

// Summarize profile workflow step INPUT
function summarizeProfileInput(stepId: string, input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const d = { ...(input as Record<string, unknown>) };

  if ('appPassword' in d) d.appPassword = '[redacted]';

  switch (stepId) {
    case 'fetch-all-categories':
      return { emailAddress: d.emailAddress, maxResultsPerCategory: d.maxResultsPerCategory };

    case 'deduplicate-and-annotate':
      return {
        totalFetched: d.totalFetched,
        categoryBreakdown: Array.isArray(d.results)
          ? d.results.map((r: any) => ({ category: r.category, count: r.messages?.length ?? 0 }))
          : d.results,
      };

    case 'fetch-all-metadata':
      return {
        totalUnique: d.totalUnique,
        categoryCounts: d.categoryCounts,
        emailsWithMetadata: Array.isArray(d.emailsWithMetadata)
          ? `[${d.emailsWithMetadata.length} messages]`
          : d.emailsWithMetadata,
      };

    case 'generate-profile':
      return {
        fetchErrors: d.fetchErrors,
        categoryCounts: d.categoryCounts,
        emailsWithMetadata: Array.isArray(d.emailsWithMetadata)
          ? `[${d.emailsWithMetadata.length} emails]`
          : d.emailsWithMetadata,
      };

    default:
      return d;
  }
}

// Summarize profile workflow step OUTPUT
function summarizeProfileOutput(stepId: string, output: unknown): unknown {
  if (!output || typeof output !== 'object') return output;
  const d = output as Record<string, unknown>;

  switch (stepId) {
    case 'fetch-all-categories':
      return {
        totalFetched: d.totalFetched,
        categoryBreakdown: Array.isArray(d.results)
          ? d.results.map((r: any) => ({ category: r.category, count: r.messages?.length ?? 0 }))
          : d.results,
      };

    case 'deduplicate-and-annotate':
      return {
        totalUnique: d.totalUnique,
        categoryCounts: d.categoryCounts,
        emailsWithMetadata: Array.isArray(d.emailsWithMetadata)
          ? `[${d.emailsWithMetadata.length} messages deduplicated]`
          : d.emailsWithMetadata,
      };

    case 'fetch-all-metadata': {
      const emails = Array.isArray(d.emailsWithMetadata) ? d.emailsWithMetadata : [];
      return {
        totalFetched: emails.length,
        fetchErrors: d.fetchErrors,
        categoryCounts: d.categoryCounts,
        sample: emails.slice(0, 3).map((e: any) => ({
          from: e.from,
          subject: e.subject,
          date: e.date,
        })),
      };
    }

    case 'generate-profile':
      return {
        emailAddress: d.emailAddress,
        generatedAt: d.generatedAt,
        profileLength: typeof d.profile === 'string' ? `${d.profile.length} chars` : 0,
        stats: d.stats,
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

    const { email, password } = getImapCredentials(authHeader);
    const provider = getProviderFromHeader(request);
    const emailAddress = email;

    const body = await request.json().catch(() => ({}));
    const maxResults = body.maxResults || 50;
    const timezone = body.timezone || 'UTC';
    const model = body.model || 'gemini-flash';
    let userProfile: string = body.userProfile || '';
    const currentDate = new Date().toLocaleString('en-US', { timeZone: timezone, dateStyle: 'full', timeStyle: 'short' });

    console.log('[API] Generating inbox summary for:', emailAddress, '| hasProfile:', !!userProfile);

    const streamId = crypto.randomUUID();
    const abortController = new AbortController();
    workflowAbortControllers.set(streamId, abortController);
    workflowKillSwitches.set(streamId, false);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const emit = (eventType: string, data: object) => {
          const chunk = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
        };

        try {
          let resolvedProfile = userProfile;

          // Phase 1: Build user profile if not provided
          if (!resolvedProfile) {
            console.log('[API] No user profile found, building profile first');

            // Register a no-op callback (profile tokens not shown in summary view)
            profileStreamCallbacks.set(streamId, (_token: string) => {});

            const profileWorkflow = mastra.getWorkflow('buildUserProfileWorkflow');
            const profileRun = await profileWorkflow.createRun();
            const profileStream = profileRun.stream({
              inputData: {
                email,
                appPassword: password,
                provider,
                maxResultsPerCategory: 20,
                maxPerSender: 20,
                emailAddress,
                currentDate,
                timezone,
                streamId,
                model,
              },
            });

            for await (const event of profileStream.fullStream as AsyncIterable<any>) {
              if (abortController.signal.aborted || workflowKillSwitches.get(streamId)) {
                emit('workflow-killed', { streamId, reason: 'User requested cancellation' });
                controller.close();
                return;
              }

              const { type, payload } = event ?? {};

              if (type === 'workflow-step-start') {
                const stepId = payload?.id;
                emit('step-start', {
                  stepId,
                  input: summarizeProfileInput(stepId, payload?.payload),
                });
              } else if (type === 'workflow-step-result') {
                const { id, status, output, payload: inputPayload } = payload ?? {};
                if (status === 'success') {
                  if (id === 'generate-profile') {
                    resolvedProfile = output?.profile || '';
                  }
                  emit('step-complete', {
                    stepId: id,
                    input: summarizeProfileInput(id, inputPayload),
                    output: summarizeProfileOutput(id, output),
                  });
                } else if (status === 'failed') {
                  emit('step-error', { stepId: id });
                }
              }
            }

            // Emit the profile so the FE can persist it
            if (resolvedProfile) {
              emit('profile-complete', { profile: resolvedProfile });
              console.log('[API] Profile built, proceeding to summary generation');
            }
          }

          // Phase 2: Generate summary (with profile if available)
          profileStreamCallbacks.set(streamId, (token: string) => {
            emit('summary-chunk', { token });
          });

          const summaryWorkflow = mastra.getWorkflow('generateSummaryWorkflow');
          const summaryRun = await summaryWorkflow.createRun();
          const summaryStream = summaryRun.stream({
            inputData: {
              email,
              appPassword: password,
              provider,
              maxResults,
              emailAddress,
              userProfile: resolvedProfile,
              currentDate,
              timezone,
              streamId,
              model,
            },
          });

          let finalResult: unknown = null;

          for await (const event of summaryStream.fullStream as AsyncIterable<any>) {
            if (abortController.signal.aborted || workflowKillSwitches.get(streamId)) {
              emit('workflow-killed', { streamId, reason: 'User requested cancellation' });
              controller.close();
              return;
            }

            const { type, payload } = event ?? {};

            if (type === 'workflow-step-start') {
              const stepId = payload?.id;
              emit('step-start', {
                stepId,
                input: summarizeInput(stepId, payload?.payload),
              });
            } else if (type === 'workflow-step-result') {
              const { id, status, output, payload: inputPayload } = payload ?? {};
              if (status === 'success') {
                if (id === 'generate-summary') finalResult = output;
                emit('step-complete', {
                  stepId: id,
                  input: summarizeInput(id, inputPayload),
                  output: summarizeOutput(id, output),
                });
              } else if (status === 'failed') {
                emit('step-error', { stepId: id });
              }
            }
          }

          emit('workflow-complete', { result: finalResult });
          controller.close();
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            emit('workflow-killed', { streamId, reason: 'User requested cancellation' });
            controller.close();
          } else {
            controller.error(err);
          }
        } finally {
          cleanupWorkflow(streamId);
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
    console.error('[API] Generate summary error:', error);
    const err = error as { message?: string; stack?: string; status?: number };
    return NextResponse.json(
      {
        error: err.message || 'Failed to generate summary',
        details: err.stack || 'No stack trace available',
      },
      { status: err.status || 500 }
    );
  }
}

/**
 * DELETE endpoint to kill a running summary generation workflow.
 * Expects the streamId as a query parameter: ?streamId=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');

    if (!streamId) {
      return NextResponse.json(
        { error: 'Missing streamId query parameter' },
        { status: 400 }
      );
    }

    const controller = workflowAbortControllers.get(streamId);
    if (controller) {
      controller.abort();
      cleanupWorkflow(streamId);
      return NextResponse.json({
        success: true,
        message: 'Workflow killed successfully',
        streamId,
      });
    }

    // Even if no controller found, mark as killed in case it's starting
    workflowKillSwitches.set(streamId, true);

    return NextResponse.json({
      success: false,
      message: 'No active workflow found with that streamId',
      streamId,
    }, { status: 404 });
  } catch (error: unknown) {
    console.error('[API] Kill workflow error:', error);
    const err = error as { message?: string };
    return NextResponse.json(
      { error: err.message || 'Failed to kill workflow' },
      { status: 500 }
    );
  }
}
