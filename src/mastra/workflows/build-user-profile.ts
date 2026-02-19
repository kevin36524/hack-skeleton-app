import { createWorkflow, createStep } from '@mastra/core/workflows';
import { google } from 'googleapis';
import { z } from 'zod';
import { profileStreamCallbacks } from '../profile-stream-bridge';

function createGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

const categoryFetchResultSchema = z.object({
  category: z.string(),
  messageIds: z.array(z.object({
    id: z.string(),
    threadId: z.string(),
  })),
});

const annotatedMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  categories: z.array(z.string()),
});

const emailMetadataSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()),
  snippet: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.string(),
  internalDate: z.string(),
  categories: z.array(z.string()),
});

const profileOutputSchema = z.object({
  profile: z.string(),
  emailAddress: z.string(),
  generatedAt: z.string(),
  stats: z.object({
    totalEmailsFetched: z.number(),
    uniqueEmails: z.number(),
    categoryCounts: z.record(z.string(), z.number()),
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

const fetchAllCategories = createStep({
  id: 'fetch-all-categories',
  description: 'Fetch message IDs from all categories in parallel',
  inputSchema: z.object({
    accessToken: z.string(),
    maxResultsPerCategory: z.number().default(20),
  }),
  outputSchema: z.object({
    results: z.array(categoryFetchResultSchema),
    totalFetched: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { accessToken, maxResultsPerCategory } = inputData;
    const gmail = createGmailClient(accessToken);

    const categories = [
      { name: 'STARRED', labelIds: ['STARRED'] as string[], query: undefined as string | undefined },
      { name: 'READ_UPDATES', labelIds: ['CATEGORY_UPDATES'] as string[] | undefined, query: 'is:read' as string | undefined },
      { name: 'SENT', labelIds: ['SENT'] as string[], query: undefined as string | undefined },
      { name: 'IMPORTANT', labelIds: ['IMPORTANT'] as string[], query: undefined as string | undefined },
      { name: 'CATEGORY_PRIMARY', labelIds: ['CATEGORY_PRIMARY'] as string[], query: undefined as string | undefined },
    ];

    const fetchCategory = async (cat: typeof categories[0]) => {
      const resp = await gmail.users.messages.list({
        userId: 'me',
        labelIds: cat.labelIds,
        q: cat.query,
        maxResults: maxResultsPerCategory,
      });
      const msgs = (resp.data.messages || []).map(m => ({
        id: m.id!, threadId: m.threadId!,
      }));
      return { category: cat.name, messageIds: msgs.slice(0, maxResultsPerCategory) };
    };

    const results = await Promise.allSettled(categories.map(fetchCategory));
    const successResults = results
      .filter((r): r is PromiseFulfilledResult<{ category: string; messageIds: { id: string; threadId: string }[] }> => r.status === 'fulfilled')
      .map(r => r.value);

    const totalFetched = successResults.reduce((sum, r) => sum + r.messageIds.length, 0);
    return { results: successResults, totalFetched };
  },
});

const deduplicateAndAnnotate = createStep({
  id: 'deduplicate-and-annotate',
  description: 'Merge all message IDs, deduplicate, annotate with categories',
  inputSchema: z.object({
    results: z.array(categoryFetchResultSchema),
    totalFetched: z.number(),
  }),
  outputSchema: z.object({
    annotatedMessages: z.array(annotatedMessageSchema),
    categoryCounts: z.record(z.string(), z.number()),
    totalUnique: z.number(),
  }),
  execute: async ({ inputData }) => {
    const messageMap = new Map<string, { threadId: string; categories: Set<string> }>();
    const categoryCounts: Record<string, number> = {};

    for (const result of inputData.results) {
      categoryCounts[result.category] = result.messageIds.length;
      for (const msg of result.messageIds) {
        const existing = messageMap.get(msg.id);
        if (existing) {
          existing.categories.add(result.category);
        } else {
          messageMap.set(msg.id, {
            threadId: msg.threadId,
            categories: new Set([result.category]),
          });
        }
      }
    }

    const annotatedMessages = Array.from(messageMap.entries()).map(([id, data]) => ({
      id,
      threadId: data.threadId,
      categories: Array.from(data.categories),
    }));

    return { annotatedMessages, categoryCounts, totalUnique: annotatedMessages.length };
  },
});

const fetchAllMetadata = createStep({
  id: 'fetch-all-metadata',
  description: 'Fetch metadata for all unique messages in batches, then cap per sender',
  inputSchema: z.object({
    annotatedMessages: z.array(annotatedMessageSchema),
    categoryCounts: z.record(z.string(), z.number()),
    totalUnique: z.number(),
  }),
  outputSchema: z.object({
    emailsWithMetadata: z.array(emailMetadataSchema),
    categoryCounts: z.record(z.string(), z.number()),
    fetchErrors: z.number(),
  }),
  execute: async ({ inputData, getInitData }) => {
    const { accessToken, maxPerSender = 20 } = getInitData<{ accessToken: string; maxPerSender?: number }>();
    const gmail = createGmailClient(accessToken);

    const BATCH_SIZE = 50;
    const DELAY_MS = 100;
    const allEmails: z.infer<typeof emailMetadataSchema>[] = [];
    let fetchErrors = 0;

    const categoryLookup = new Map<string, string[]>();
    for (const msg of inputData.annotatedMessages) {
      categoryLookup.set(msg.id, msg.categories);
    }

    const messageIds = inputData.annotatedMessages.map(m => m.id);

    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      const batch = messageIds.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(id =>
          gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'metadata',
            metadataHeaders: ['From', 'To', 'Subject', 'Date'],
          })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const msg = result.value.data;
          const headers = msg.payload?.headers || [];
          const getH = (name: string) =>
            headers.find((h: { name?: string | null; value?: string | null }) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

          allEmails.push({
            id: msg.id!,
            threadId: msg.threadId!,
            labelIds: msg.labelIds || [],
            snippet: msg.snippet || '',
            from: getH('From'),
            to: getH('To'),
            subject: getH('Subject'),
            date: getH('Date'),
            internalDate: msg.internalDate || '',
            categories: categoryLookup.get(msg.id!) || [],
          });
        } else {
          fetchErrors++;
        }
      }

      if (i + BATCH_SIZE < messageIds.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    // Cap emails per sender
    const senderCounts = new Map<string, number>();
    const emailsWithMetadata = allEmails.filter(email => {
      const senderEmail = email.from.match(/<(.+?)>/)?.[1]?.toLowerCase() || email.from.toLowerCase();
      const count = senderCounts.get(senderEmail) || 0;
      if (count >= maxPerSender) return false;
      senderCounts.set(senderEmail, count + 1);
      return true;
    });

    return { emailsWithMetadata, categoryCounts: inputData.categoryCounts, fetchErrors };
  },
});

const generateProfile = createStep({
  id: 'generate-profile',
  description: 'Use agent to generate comprehensive markdown user profile',
  inputSchema: z.object({
    emailsWithMetadata: z.array(emailMetadataSchema),
    categoryCounts: z.record(z.string(), z.number()),
    fetchErrors: z.number(),
  }),
  outputSchema: profileOutputSchema,
  execute: async ({ inputData, mastra, getInitData }) => {
    const agent = mastra.getAgent('profileGeneratorAgent');

    const senderFrequency = new Map<string, { name: string; count: number }>();
    for (const email of inputData.emailsWithMetadata) {
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
      .slice(0, 20)
      .map(([email, data]) => ({ email, name: data.name, count: data.count }));

    const stats = {
      totalEmailsFetched: inputData.emailsWithMetadata.length,
      uniqueEmails: inputData.emailsWithMetadata.length,
      categoryCounts: inputData.categoryCounts,
      topSenders,
    };

    const initData = getInitData<{ accessToken: string; emailAddress?: string; currentDate?: string; timezone?: string; streamId?: string; model?: string }>();
    const emitToken = initData.streamId ? profileStreamCallbacks.get(initData.streamId) : undefined;

    // Build CSV payload
    const escape = (s: string) => `"${s.replace(/"/g, '""').replace(/\n/g, ' ').trim()}"`;
    const csvRows = inputData.emailsWithMetadata.map(e =>
      [escape(e.date), escape(e.from), escape(e.subject), escape(e.snippet.substring(0, 120))].join(',')
    );
    const csv = `date,from,subject,snippet\n${csvRows.join('\n')}`;

    const dateContext = initData.currentDate
      ? `Current date: ${initData.currentDate}${initData.timezone ? ` (${initData.timezone})` : ''}`
      : '';

    const prompt = `Build a comprehensive user profile from these emails.

${dateContext}

STATISTICS:
- Total emails: ${stats.totalEmailsFetched}
- Categories: ${JSON.stringify(stats.categoryCounts)}
- Top senders: ${topSenders.slice(0, 10).map(s => `${s.name} (${s.count})`).join(', ')}

EMAIL DATA (CSV):
${csv}`;

    const requestContext = new Map<string, unknown>([['model-id', initData.model || 'gemini-flash-lite']]);
    const streamResult = await agent.stream(prompt, { requestContext });
    let profileMarkdown = '';
    for await (const chunk of streamResult.textStream as AsyncIterable<string>) {
      profileMarkdown += chunk;
      emitToken?.(chunk);
    }

    // AI SDK v5 uses inputTokens/outputTokens; v4 uses promptTokens/completionTokens
    const rawUsage = (await streamResult.usage) as any;
    const promptTokens = rawUsage?.promptTokens ?? rawUsage?.inputTokens ?? 0;
    const completionTokens = rawUsage?.completionTokens ?? rawUsage?.outputTokens ?? 0;
    const totalTokens = rawUsage?.totalTokens ?? (promptTokens + completionTokens);

    return {
      profile: profileMarkdown,
      emailAddress: initData.emailAddress || 'unknown',
      generatedAt: new Date().toISOString(),
      stats,
      usage: { promptTokens, completionTokens, totalTokens },
    };
  },
});

export const buildUserProfileWorkflow = createWorkflow({
  id: 'build-user-profile',
  description: 'Builds a comprehensive user profile by analyzing Gmail email data',
  inputSchema: z.object({
    accessToken: z.string(),
    maxResultsPerCategory: z.number().default(20),
    maxPerSender: z.number().default(20),
    emailAddress: z.string().optional(),
    currentDate: z.string().optional(),
    timezone: z.string().optional(),
    streamId: z.string().optional(),
    model: z.enum(['gemini-flash-lite', 'groq', 'kimi']).default('gemini-flash-lite'),
  }),
  outputSchema: profileOutputSchema,
})
  .then(fetchAllCategories)
  .then(deduplicateAndAnnotate)
  .then(fetchAllMetadata)
  .then(generateProfile)
  .commit();
