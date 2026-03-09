import { createWorkflow, createStep } from '@mastra/core/workflows';
import { RequestContext } from '@mastra/core/di';
import { google } from 'googleapis';
import { z } from 'zod';
import { profileStreamCallbacks } from '../profile-stream-bridge';

function createGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return dateStr;
  }
}

function csvEscape(value: string): string {
  const str = value.replace(/[\r\n]+/g, ' ').trim();
  if (/[,"]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const summaryOutputSchema = z.object({
  summary: z.string(),
  emailCount: z.number(),
  generatedAt: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
});

// ---------------------------------------------------------------------------
// Step 1: list inbox message IDs from the last 24 hours
// ---------------------------------------------------------------------------
const fetchInboxMessages = createStep({
  id: 'fetch-inbox-messages',
  description: 'List inbox message IDs received in the last 24 hours',
  inputSchema: z.object({
    accessToken: z.string(),
    maxResults: z.number().default(50),
  }),
  outputSchema: z.object({
    messageIds: z.array(z.string()),
    totalFound: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { accessToken, maxResults } = inputData;
    const gmail = createGmailClient(accessToken);

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox newer_than:1d',
      maxResults,
    });

    const messageIds = (response.data.messages ?? [])
      .map((m) => m.id!)
      .filter(Boolean);

    return { messageIds, totalFound: messageIds.length };
  },
});

// ---------------------------------------------------------------------------
// Step 2: fetch metadata for each message and build CSV
// ---------------------------------------------------------------------------
const fetchMessageMetadata = createStep({
  id: 'fetch-message-metadata',
  description: 'Fetch date, sender, subject and snippet for each message; build CSV',
  inputSchema: z.object({
    messageIds: z.array(z.string()),
    totalFound: z.number(),
  }),
  outputSchema: z.object({
    csv: z.string(),
    emailCount: z.number(),
    fetchErrors: z.number(),
  }),
  execute: async ({ inputData, getInitData }) => {
    const { accessToken } = getInitData<{ accessToken: string }>();
    const gmail = createGmailClient(accessToken);

    const { messageIds } = inputData;
    const emails: { date: string; sender: string; subject: string; snippet: string }[] = [];
    let fetchErrors = 0;

    const BATCH_SIZE = 20;
    const DELAY_MS = 100;

    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      const batch = messageIds.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((id) =>
          gmail.users.messages.get({
            userId: 'me',
            id,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date'],
          })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const msg = result.value.data;
          const headers = msg.payload?.headers ?? [];
          const getH = (name: string) =>
            headers.find(
              (h: { name?: string | null; value?: string | null }) =>
                h.name?.toLowerCase() === name.toLowerCase()
            )?.value ?? '';

          emails.push({
            date: formatDate(getH('Date')),
            sender: getH('From'),
            subject: getH('Subject'),
            snippet: msg.snippet ?? '',
          });
        } else {
          fetchErrors++;
        }
      }

      if (i + BATCH_SIZE < messageIds.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    const csvRows = emails.map((e) =>
      [
        csvEscape(e.date),
        csvEscape(e.sender),
        csvEscape(e.subject),
        csvEscape(e.snippet),
      ].join(',')
    );
    const csv = ['date,sender,subject,snippet', ...csvRows].join('\n');

    return { csv, emailCount: emails.length, fetchErrors };
  },
});

// ---------------------------------------------------------------------------
// Step 3: call the email summarizer agent
// ---------------------------------------------------------------------------
const generateSummary = createStep({
  id: 'generate-summary',
  description: 'Use the email summarizer agent to produce a personalized markdown summary',
  inputSchema: z.object({
    csv: z.string(),
    emailCount: z.number(),
    fetchErrors: z.number(),
  }),
  outputSchema: summaryOutputSchema,
  execute: async ({ inputData, mastra, getInitData }) => {
    const agent = mastra.getAgent('emailSummarizerAgent');

    const initData = getInitData<{ userProfile?: string; streamId?: string; model?: string }>();
    const userProfile = initData.userProfile ?? '';
    const emitToken = initData.streamId
      ? profileStreamCallbacks.get(initData.streamId)
      : undefined;

    const prompt = [
      '## Emails (CSV)',
      '```',
      inputData.csv,
      '```',
      '',
      userProfile
        ? `## User Profile\n\n${userProfile}`
        : '## User Profile\n\n(No profile provided)',
    ].join('\n');

    const requestContext = new RequestContext([['model-id', initData.model ?? 'gemini-flash-lite']]);
    const streamResult = await agent.stream(prompt, { requestContext });
    let summaryMarkdown = '';
    for await (const chunk of streamResult.textStream as AsyncIterable<string>) {
      summaryMarkdown += chunk;
      emitToken?.(chunk);
    }

    const rawUsage = (await streamResult.usage) as any;
    const promptTokens = rawUsage?.promptTokens ?? rawUsage?.inputTokens ?? 0;
    const completionTokens = rawUsage?.completionTokens ?? rawUsage?.outputTokens ?? 0;
    const totalTokens = rawUsage?.totalTokens ?? (promptTokens + completionTokens);

    return {
      summary: summaryMarkdown,
      emailCount: inputData.emailCount,
      generatedAt: new Date().toISOString(),
      usage: { promptTokens, completionTokens, totalTokens },
    };
  },
});

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------
export const summarizeInboxWorkflow = createWorkflow({
  id: 'summarize-inbox',
  description: 'Fetches inbox emails from the last 24 hours and generates a personalized AI summary',
  inputSchema: z.object({
    accessToken: z.string(),
    maxResults: z.number().default(50),
    userProfile: z.string().optional(),
    streamId: z.string().optional(),
    model: z.enum(['gemini-flash-lite', 'groq', 'kimi']).default('gemini-flash-lite'),
  }),
  outputSchema: summaryOutputSchema,
})
  .then(fetchInboxMessages)
  .then(fetchMessageMetadata)
  .then(generateSummary)
  .commit();
