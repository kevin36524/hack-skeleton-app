import { createWorkflow, createStep } from '@mastra/core/workflows';
import { RequestContext } from '@mastra/core/request-context';
import { z } from 'zod';
import { profileStreamCallbacks, isWorkflowKilled } from '../profile-stream-bridge';
import {
  withImap,
  encodeMessageId,
  imapFlagsToLabelIds,
  formatAddress,
  parseEmailSource,
} from '@/lib/imap/client';

const emailDataSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()),
  snippet: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.string(),
  internalDate: z.string(),
  bodyText: z.string().optional(),
  bodyHtml: z.string().optional(),
});

const summaryOutputSchema = z.object({
  summary: z.string(),
  emailAddress: z.string(),
  generatedAt: z.string(),
  stats: z.object({
    totalEmailsFetched: z.number(),
    uniqueSenders: z.number(),
    topSenders: z.array(z.object({
      email: z.string(),
      name: z.string().optional(),
      count: z.number(),
    })),
  }),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
});

const fetchInboxEmails = createStep({
  id: 'fetch-inbox-emails',
  description: 'Fetch top 50 emails from inbox folder via IMAP',
  inputSchema: z.object({
    email: z.string(),
    appPassword: z.string(),
    maxResults: z.number().default(50),
  }),
  outputSchema: z.object({
    emails: z.array(emailDataSchema),
    totalFetched: z.number(),
    fetchErrors: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { email, appPassword, maxResults } = inputData;
    const emails: z.infer<typeof emailDataSchema>[] = [];
    let fetchErrors = 0;

    await withImap(email, appPassword, async (client) => {
      const lock = await client.getMailboxLock('INBOX', { readonly: true });
      try {
        const uids = (await client.search({ all: true }, { uid: true })) as number[];
        const recentUids = uids.slice(-maxResults).reverse();
        if (recentUids.length === 0) return;

        for await (const msg of client.fetch(
          recentUids,
          { uid: true, envelope: true, flags: true, internalDate: true, source: true },
          { uid: true }
        )) {
          try {
            const parsed = parseEmailSource(msg.source ?? '');
            const msgId = encodeMessageId('INBOX', msg.uid);
            const labelIds = imapFlagsToLabelIds(msg.flags ?? new Set(), 'INBOX');

            emails.push({
              id: msgId,
              threadId: msgId,
              labelIds,
              snippet: parsed.snippet,
              from: formatAddress(msg.envelope?.from),
              to: formatAddress(msg.envelope?.to),
              subject: msg.envelope?.subject || '',
              date: msg.envelope?.date?.toUTCString() || '',
              internalDate: msg.internalDate ? msg.internalDate.getTime().toString() : Date.now().toString(),
              bodyText: parsed.textBody.substring(0, 2000),
              bodyHtml: parsed.htmlBody.substring(0, 2000),
            });
          } catch {
            fetchErrors++;
          }
        }
      } finally {
        lock.release();
      }
    });

    return { emails, totalFetched: emails.length, fetchErrors };
  },
});

const generateSummary = createStep({
  id: 'generate-summary',
  description: 'Generate personalized inbox summary using user profile context',
  inputSchema: z.object({
    emails: z.array(emailDataSchema),
    totalFetched: z.number(),
    fetchErrors: z.number(),
  }),
  outputSchema: summaryOutputSchema,
  execute: async ({ inputData, mastra, getInitData }) => {
    const agent = mastra.getAgent('emailSummarizerAgent');

    const initData = getInitData<{
      email: string;
      appPassword: string;
      emailAddress?: string;
      userProfile?: string;
      currentDate?: string;
      timezone?: string;
      streamId?: string;
      model?: string;
    }>();

    // Calculate sender statistics
    const senderFrequency = new Map<string, { name: string; count: number }>();
    for (const email of inputData.emails) {
      const fromEmail = email.from.match(/<(.+?)>/)?.[1] || email.from;
      const fromName = email.from.match(/^(.+?)\s*</)?.[1]?.replace(/"/g, '') || fromEmail;
      const existing = senderFrequency.get(fromEmail);
      if (existing) {
        existing.count++;
      } else {
        senderFrequency.set(fromEmail, { name: fromName, count: 1 });
      }
    }

    const topSenders = Array.from(senderFrequency.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([email, data]) => ({ email, name: data.name, count: data.count }));

    const stats = {
      totalEmailsFetched: inputData.totalFetched,
      uniqueSenders: senderFrequency.size,
      topSenders,
    };

    const emailList = inputData.emails.map(e => {
      const bodyPreview = e.bodyText
        ? e.bodyText.substring(0, 300).replace(/\n/g, ' ').trim()
        : e.snippet;
      return {
        from: e.from,
        subject: e.subject,
        date: e.date,
        snippet: e.snippet,
        bodyPreview: bodyPreview.substring(0, 300),
        labelIds: e.labelIds,
      };
    });

    const dateContext = initData.currentDate
      ? `Current date: ${initData.currentDate}${initData.timezone ? ` (${initData.timezone})` : ''}`
      : '';

    const prompt = `Please generate a personalized inbox summary based on the following information.

${dateContext}

## User Profile
${initData.userProfile || 'No user profile provided. Analyze emails based on general importance patterns.'}

## Inbox Statistics
- Total emails: ${stats.totalEmailsFetched}
- Unique senders: ${stats.uniqueSenders}
- Top senders: ${topSenders.slice(0, 5).map(s => `${s.name} (${s.count})`).join(', ')}

## Email Data (JSON)
${JSON.stringify(emailList, null, 2)}

Please provide a comprehensive summary following your instructions.`;

    const requestContext = new RequestContext();
    requestContext.set('model-id', initData.model || 'gemini-flash-lite');

    const emitToken = initData.streamId ? profileStreamCallbacks.get(initData.streamId) : undefined;

    const MAX_TOKENS = 8000;
    const MAX_CHARS_ESTIMATE = MAX_TOKENS * 4;

    const streamResult = await agent.stream(prompt, {
      requestContext,
      // @ts-expect-error - maxTokens is supported by the underlying AI SDK but not in types
      maxTokens: MAX_TOKENS,
    });

    let summaryMarkdown = '';
    let tokenCount = 0;
    const streamId = initData.streamId;

    for await (const chunk of streamResult.textStream as AsyncIterable<string>) {
      if (streamId && isWorkflowKilled(streamId)) {
        console.log(`[Workflow] Stream ${streamId} killed by user`);
        throw new Error('Workflow killed by user');
      }

      summaryMarkdown += chunk;
      tokenCount += chunk.length / 4;
      emitToken?.(chunk);

      if (summaryMarkdown.length > MAX_CHARS_ESTIMATE) {
        console.warn(`[Workflow] Summary generation exceeded max length limit, stopping`);
        summaryMarkdown += '\n\n*[Summary generation truncated due to length limit]*';
        break;
      }

      if (tokenCount > 6000 && !summaryMarkdown.includes('##')) {
        console.warn('[Workflow] Summary generation seems to be repeating, stopping');
        summaryMarkdown += '\n\n*[Summary generation stopped - possible repetition detected]*';
        break;
      }
    }

    const rawUsage = (await streamResult.usage) as any;
    const promptTokens = rawUsage?.promptTokens ?? rawUsage?.inputTokens ?? 0;
    const completionTokens = rawUsage?.completionTokens ?? rawUsage?.outputTokens ?? 0;
    const totalTokens = rawUsage?.totalTokens ?? (promptTokens + completionTokens);

    return {
      summary: summaryMarkdown,
      emailAddress: initData.emailAddress || initData.email || 'unknown',
      generatedAt: new Date().toISOString(),
      stats,
      usage: { promptTokens, completionTokens, totalTokens },
    };
  },
});

export const generateSummaryWorkflow = createWorkflow({
  id: 'generate-summary',
  description: 'Generates a personalized inbox summary by analyzing top 50 emails with user profile context',
  inputSchema: z.object({
    email: z.string(),
    appPassword: z.string(),
    maxResults: z.number().default(50),
    emailAddress: z.string().optional(),
    userProfile: z.string().optional(),
    currentDate: z.string().optional(),
    timezone: z.string().optional(),
    streamId: z.string().optional(),
    model: z.enum(['gemini-flash-lite', 'groq', 'kimi']).default('gemini-flash-lite'),
  }),
  outputSchema: summaryOutputSchema,
})
  .then(fetchInboxEmails)
  .then(generateSummary)
  .commit();
