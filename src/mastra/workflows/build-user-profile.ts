import { createWorkflow, createStep } from '@mastra/core/workflows';
import { google } from 'googleapis';
import { z } from 'zod';

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
    importantEmails: z.number(),
    categoryCounts: z.record(z.string(), z.number()),
    topSenders: z.array(z.object({
      email: z.string(),
      name: z.string().optional(),
      count: z.number(),
    })),
  }),
});

const fetchAllCategories = createStep({
  id: 'fetch-all-categories',
  description: 'Fetch message IDs from all categories in parallel',
  inputSchema: z.object({
    accessToken: z.string(),
    maxResultsPerCategory: z.number().default(200),
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
      { name: 'READ', labelIds: undefined as string[] | undefined, query: 'is:read' as string | undefined },
      { name: 'SENT', labelIds: ['SENT'] as string[], query: undefined as string | undefined },
      { name: 'IMPORTANT', labelIds: ['IMPORTANT'] as string[], query: undefined as string | undefined },
      { name: 'CATEGORY_PRIMARY', labelIds: ['CATEGORY_PRIMARY'] as string[], query: undefined as string | undefined },
    ];

    const fetchCategory = async (cat: typeof categories[0]) => {
      let allMsgs: { id: string; threadId: string }[] = [];
      let pageToken: string | undefined;

      do {
        const resp = await gmail.users.messages.list({
          userId: 'me',
          labelIds: cat.labelIds,
          q: cat.query,
          maxResults: Math.min(maxResultsPerCategory - allMsgs.length, 500),
          pageToken,
        });
        const msgs = (resp.data.messages || []).map(m => ({
          id: m.id!, threadId: m.threadId!,
        }));
        allMsgs.push(...msgs);
        pageToken = resp.data.nextPageToken || undefined;
      } while (pageToken && allMsgs.length < maxResultsPerCategory);

      return { category: cat.name, messageIds: allMsgs.slice(0, maxResultsPerCategory) };
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
  description: 'Fetch metadata for all unique messages in batches',
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
    const { accessToken } = getInitData<{ accessToken: string }>();
    const gmail = createGmailClient(accessToken);

    const BATCH_SIZE = 50;
    const DELAY_MS = 100;
    const emailsWithMetadata: z.infer<typeof emailMetadataSchema>[] = [];
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

          emailsWithMetadata.push({
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

    return { emailsWithMetadata, categoryCounts: inputData.categoryCounts, fetchErrors };
  },
});

const classifyImportance = createStep({
  id: 'classify-importance',
  description: 'Use agent to classify which emails are important for profiling',
  inputSchema: z.object({
    emailsWithMetadata: z.array(emailMetadataSchema),
    categoryCounts: z.record(z.string(), z.number()),
    fetchErrors: z.number(),
  }),
  outputSchema: z.object({
    importantEmails: z.array(emailMetadataSchema),
    skippedCount: z.number(),
    categoryCounts: z.record(z.string(), z.number()),
    totalProcessed: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('emailClassifierAgent');
    const BATCH_SIZE = 20;
    const PARALLEL_CONCURRENCY = 3;
    const GROUP_DELAY_MS = 500;
    const allImportantIds = new Set<string>();
    const emails = inputData.emailsWithMetadata;

    // Split into small batches
    const batches: (typeof emails)[] = [];
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      batches.push(emails.slice(i, i + BATCH_SIZE));
    }

    const classifyBatch = async (batch: typeof emails) => {
      const batchData = batch.map(e => ({
        id: e.id,
        subject: e.subject,
        from: e.from,
        to: e.to,
        snippet: e.snippet.substring(0, 80),
        categories: e.categories,
        date: e.date,
      }));

      const response = await agent.generate(
        `Classify these emails for user profile building. Here are ${batchData.length} emails:\n\n${JSON.stringify(batchData)}`
      );

      const text = response.text || response.toString();
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                        text.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, text];
      const parsed = JSON.parse((jsonMatch[1] || text).trim());
      return parsed.classifications || [];
    };

    // Process batches in parallel groups
    for (let i = 0; i < batches.length; i += PARALLEL_CONCURRENCY) {
      const group = batches.slice(i, i + PARALLEL_CONCURRENCY);

      const results = await Promise.allSettled(group.map(classifyBatch));

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === 'fulfilled') {
          for (const c of result.value) {
            if (c.classification === 'important') {
              allImportantIds.add(c.id);
            }
          }
        } else {
          // Fallback: include all emails in failed batch
          batches[i + j].forEach(e => allImportantIds.add(e.id));
        }
      }

      if (i + PARALLEL_CONCURRENCY < batches.length) {
        await new Promise(resolve => setTimeout(resolve, GROUP_DELAY_MS));
      }
    }

    const importantEmails = emails.filter(e => allImportantIds.has(e.id));

    return {
      importantEmails,
      skippedCount: emails.length - importantEmails.length,
      categoryCounts: inputData.categoryCounts,
      totalProcessed: emails.length,
    };
  },
});

const generateProfile = createStep({
  id: 'generate-profile',
  description: 'Use agent to generate comprehensive markdown user profile',
  inputSchema: z.object({
    importantEmails: z.array(emailMetadataSchema),
    skippedCount: z.number(),
    categoryCounts: z.record(z.string(), z.number()),
    totalProcessed: z.number(),
  }),
  outputSchema: profileOutputSchema,
  execute: async ({ inputData, mastra, getInitData }) => {
    const agent = mastra.getAgent('profileGeneratorAgent');

    const senderFrequency = new Map<string, { name: string; count: number }>();
    for (const email of inputData.importantEmails) {
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

    const CHUNK_SIZE = 40;
    const PARALLEL_CONCURRENCY = 2;
    const CHUNK_DELAY_MS = 500;
    const MAX_EMAILS_FOR_PROFILE = 200;

    const stats = {
      totalEmailsFetched: inputData.totalProcessed,
      uniqueEmails: inputData.totalProcessed,
      importantEmails: inputData.importantEmails.length,
      categoryCounts: inputData.categoryCounts,
      topSenders,
    };

    const emailsForProfile = inputData.importantEmails.slice(0, MAX_EMAILS_FOR_PROFILE);

    // Split into chunks
    const chunks: (typeof emailsForProfile)[] = [];
    for (let i = 0; i < emailsForProfile.length; i += CHUNK_SIZE) {
      chunks.push(emailsForProfile.slice(i, i + CHUNK_SIZE));
    }

    const generateChunk = async (chunk: typeof emailsForProfile, chunkIndex: number) => {
      const emailData = chunk.map(e => ({
        subject: e.subject,
        from: e.from,
        to: e.to,
        snippet: e.snippet.substring(0, 100),
        date: e.date,
        categories: e.categories,
      }));

      const isFirst = chunkIndex === 0;
      const prompt = `${isFirst ? `Build a comprehensive user profile from these emails.\n\nSTATISTICS:\n${JSON.stringify(stats)}\n\n` : ''}Analyze these ${emailData.length} emails (batch ${chunkIndex + 1} of ${chunks.length}) and extract all profile-relevant information as markdown sections.

EMAIL DATA:
${JSON.stringify(emailData)}`;

      const response = await agent.generate(prompt);
      return response.text || response.toString();
    };

    // Process chunks in parallel groups
    const profileParts: string[] = [];
    for (let i = 0; i < chunks.length; i += PARALLEL_CONCURRENCY) {
      const group = chunks.slice(i, i + PARALLEL_CONCURRENCY);
      const results = await Promise.allSettled(
        group.map((chunk, j) => generateChunk(chunk, i + j))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          profileParts.push(result.value);
        }
      }

      if (i + PARALLEL_CONCURRENCY < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, CHUNK_DELAY_MS));
      }
    }

    const profileMarkdown = profileParts.join('\n\n---\n\n');

    const initData = getInitData<{ accessToken: string; emailAddress?: string }>();

    return {
      profile: profileMarkdown,
      emailAddress: initData.emailAddress || 'unknown',
      generatedAt: new Date().toISOString(),
      stats,
    };
  },
});

export const buildUserProfileWorkflow = createWorkflow({
  id: 'build-user-profile',
  description: 'Builds a comprehensive user profile by analyzing Gmail email data',
  inputSchema: z.object({
    accessToken: z.string(),
    maxResultsPerCategory: z.number().default(200),
    emailAddress: z.string().optional(),
  }),
  outputSchema: profileOutputSchema,
})
  .then(fetchAllCategories)
  .then(deduplicateAndAnnotate)
  .then(fetchAllMetadata)
  .then(classifyImportance)
  .then(generateProfile)
  .commit();
