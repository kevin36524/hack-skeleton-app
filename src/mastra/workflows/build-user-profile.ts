import { createWorkflow, createStep } from '@mastra/core/workflows';
import { RequestContext } from '@mastra/core/request-context';
import { z } from 'zod';
import { profileStreamCallbacks, isWorkflowKilled } from '../profile-stream-bridge';
import {
  withImap,
  encodeMessageId,
  imapFlagsToLabelIds,
  formatAddress,
  IMAP_TO_GMAIL_LABEL,
} from '@/lib/imap/client';

// ── Schemas ───────────────────────────────────────────────────────────────────

const categoryMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()),
  snippet: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.string(),
  internalDate: z.string(),
  messageIdHeader: z.string(),
});

const categoryFetchResultSchema = z.object({
  category: z.string(),
  messages: z.array(categoryMessageSchema),
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

// ── Step 1: fetch message IDs + envelope metadata from each category folder ──

const fetchAllCategories = createStep({
  id: 'fetch-all-categories',
  description: 'Fetch message metadata from all category folders via IMAP',
  inputSchema: z.object({
    email: z.string(),
    appPassword: z.string(),
    maxResultsPerCategory: z.number().default(20),
  }),
  outputSchema: z.object({
    results: z.array(categoryFetchResultSchema),
    totalFetched: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { email, appPassword, maxResultsPerCategory } = inputData;

    const categories = [
      { name: 'STARRED',   folder: '[Gmail]/Starred',   criteria: { all: true } as Record<string, any> },
      { name: 'READ',      folder: 'INBOX',              criteria: { seen: true } as Record<string, any> },
      { name: 'SENT',      folder: '[Gmail]/Sent Mail',  criteria: { all: true } as Record<string, any> },
      { name: 'IMPORTANT', folder: '[Gmail]/Important',  criteria: { all: true } as Record<string, any> },
      { name: 'PRIMARY',   folder: 'INBOX',              criteria: { all: true } as Record<string, any> },
      { name: 'ARCHIVE',   folder: '[Gmail]/All Mail',   criteria: { all: true } as Record<string, any> },
      { name: 'DELETED',   folder: '[Gmail]/Trash',      criteria: { all: true } as Record<string, any> },
    ];

    const results = await withImap(email, appPassword, async (client) => {
      const allResults: z.infer<typeof categoryFetchResultSchema>[] = [];

      for (const cat of categories) {
        try {
          const lock = await client.getMailboxLock(cat.folder, { readonly: true });
          try {
            const uids = (await client.search(cat.criteria, { uid: true })) as number[];
            const recentUids = uids.slice(-maxResultsPerCategory).reverse();

            const messages: z.infer<typeof categoryMessageSchema>[] = [];
            if (recentUids.length > 0) {
              const folderLabel = IMAP_TO_GMAIL_LABEL[cat.folder] ?? cat.name;
              for await (const msg of client.fetch(
                recentUids,
                { uid: true, envelope: true, flags: true, internalDate: true },
                { uid: true }
              )) {
                const encodedId = encodeMessageId(cat.folder, msg.uid);
                const labelIds = imapFlagsToLabelIds(msg.flags ?? new Set(), folderLabel);
                messages.push({
                  id: encodedId,
                  threadId: encodedId,
                  labelIds,
                  snippet: msg.envelope?.subject || '',
                  from: formatAddress(msg.envelope?.from),
                  to: formatAddress(msg.envelope?.to),
                  subject: msg.envelope?.subject || '',
                  date: msg.envelope?.date?.toUTCString() || '',
                  internalDate: msg.internalDate ? msg.internalDate.getTime().toString() : Date.now().toString(),
                  messageIdHeader: msg.envelope?.messageId || '',
                });
              }
            }
            allResults.push({ category: cat.name, messages });
          } finally {
            lock.release();
          }
        } catch (err) {
          console.warn(`[build-user-profile] Failed to fetch category ${cat.name}:`, err);
          allResults.push({ category: cat.name, messages: [] });
        }
      }

      return allResults;
    });

    const totalFetched = results.reduce((sum, r) => sum + r.messages.length, 0);
    return { results, totalFetched };
  },
});

// ── Step 2: deduplicate by Message-ID header, annotate with categories ────────

const deduplicateAndAnnotate = createStep({
  id: 'deduplicate-and-annotate',
  description: 'Deduplicate messages by Message-ID header and annotate with categories',
  inputSchema: z.object({
    results: z.array(categoryFetchResultSchema),
    totalFetched: z.number(),
  }),
  outputSchema: z.object({
    emailsWithMetadata: z.array(emailMetadataSchema),
    categoryCounts: z.record(z.string(), z.number()),
    totalUnique: z.number(),
  }),
  execute: async ({ inputData }) => {
    // Deduplicate by messageIdHeader (RFC 2822 Message-ID), fall back to encoded id
    const messageMap = new Map<string, { data: z.infer<typeof categoryMessageSchema>; categories: Set<string> }>();
    const categoryCounts: Record<string, number> = {};

    for (const result of inputData.results) {
      categoryCounts[result.category] = result.messages.length;
      for (const msg of result.messages) {
        const key = msg.messageIdHeader || msg.id;
        const existing = messageMap.get(key);
        if (existing) {
          existing.categories.add(result.category);
        } else {
          messageMap.set(key, { data: msg, categories: new Set([result.category]) });
        }
      }
    }

    const emailsWithMetadata = Array.from(messageMap.values()).map(({ data, categories }) => ({
      ...data,
      categories: Array.from(categories),
    }));

    return { emailsWithMetadata, categoryCounts, totalUnique: emailsWithMetadata.length };
  },
});

// ── Step 3: cap emails per sender ─────────────────────────────────────────────

const fetchAllMetadata = createStep({
  id: 'fetch-all-metadata',
  description: 'Cap emails per sender from the deduplicated set',
  inputSchema: z.object({
    emailsWithMetadata: z.array(emailMetadataSchema),
    categoryCounts: z.record(z.string(), z.number()),
    totalUnique: z.number(),
  }),
  outputSchema: z.object({
    emailsWithMetadata: z.array(emailMetadataSchema),
    categoryCounts: z.record(z.string(), z.number()),
    fetchErrors: z.number(),
  }),
  execute: async ({ inputData, getInitData }) => {
    const { maxPerSender = 20 } = getInitData<{ email: string; appPassword: string; maxPerSender?: number }>();

    const senderCounts = new Map<string, number>();
    const emailsWithMetadata = inputData.emailsWithMetadata.filter(email => {
      const senderEmail = email.from.match(/<(.+?)>/)?.[1]?.toLowerCase() || email.from.toLowerCase();
      const count = senderCounts.get(senderEmail) || 0;
      if (count >= maxPerSender) return false;
      senderCounts.set(senderEmail, count + 1);
      return true;
    });

    return { emailsWithMetadata, categoryCounts: inputData.categoryCounts, fetchErrors: 0 };
  },
});

// ── Step 4: generate profile with AI ─────────────────────────────────────────

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

    const initData = getInitData<{
      email: string;
      appPassword: string;
      emailAddress?: string;
      currentDate?: string;
      timezone?: string;
      streamId?: string;
      model?: string;
    }>();
    const emitToken = initData.streamId ? profileStreamCallbacks.get(initData.streamId) : undefined;

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

    const requestContext = new RequestContext();
    requestContext.set('model-id', initData.model || 'gemini-flash-lite');

    const MAX_TOKENS = 8000;
    const MAX_CHARS_ESTIMATE = MAX_TOKENS * 4;

    const streamResult = await agent.stream(prompt, {
      requestContext,
      // @ts-expect-error - maxTokens is supported by the underlying AI SDK but not in types
      maxTokens: MAX_TOKENS,
    });

    let profileMarkdown = '';
    let tokenCount = 0;
    const streamId = initData.streamId;

    for await (const chunk of streamResult.textStream as AsyncIterable<string>) {
      if (streamId && isWorkflowKilled(streamId)) {
        console.log(`[Workflow] Stream ${streamId} killed by user`);
        throw new Error('Workflow killed by user');
      }

      profileMarkdown += chunk;
      tokenCount += chunk.length / 4;
      emitToken?.(chunk);

      if (profileMarkdown.length > MAX_CHARS_ESTIMATE) {
        console.warn(`[Workflow] Profile generation exceeded max length limit, stopping`);
        profileMarkdown += '\n\n*[Profile generation truncated due to length limit]*';
        break;
      }

      if (tokenCount > 6000 && !profileMarkdown.includes('##')) {
        console.warn('[Workflow] Profile generation seems to be repeating, stopping');
        profileMarkdown += '\n\n*[Profile generation stopped - possible repetition detected]*';
        break;
      }
    }

    const rawUsage = (await streamResult.usage) as any;
    const promptTokens = rawUsage?.promptTokens ?? rawUsage?.inputTokens ?? 0;
    const completionTokens = rawUsage?.completionTokens ?? rawUsage?.outputTokens ?? 0;
    const totalTokens = rawUsage?.totalTokens ?? (promptTokens + completionTokens);

    return {
      profile: profileMarkdown,
      emailAddress: initData.emailAddress || initData.email || 'unknown',
      generatedAt: new Date().toISOString(),
      stats,
      usage: { promptTokens, completionTokens, totalTokens },
    };
  },
});

// ── Workflow ──────────────────────────────────────────────────────────────────

export const buildUserProfileWorkflow = createWorkflow({
  id: 'build-user-profile',
  description: 'Builds a comprehensive user profile by analyzing Gmail email data via IMAP',
  inputSchema: z.object({
    email: z.string(),
    appPassword: z.string(),
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
