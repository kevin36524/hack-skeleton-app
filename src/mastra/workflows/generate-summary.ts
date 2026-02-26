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
import { getProviderConfig, type MailProvider } from '@/lib/imap/providers';

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

// New structured email classification
const classifiedEmailSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  section: z.enum(['read_now', 'worth_a_glance', 'low_priority']),
  subsection: z.string().optional(),
});

// Minimal classification from agent (to save tokens)
const minimalClassificationSchema = z.object({
  id: z.string(),
  section: z.enum(['read_now', 'worth_a_glance', 'low_priority']),
  subsection: z.string().optional(),
});

const summaryOutputSchema = z.object({
  short_summary: z.string(),
  emails: z.array(classifiedEmailSchema),
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
    provider: z.string().default('gmail'),
  }),
  outputSchema: z.object({
    emails: z.array(emailDataSchema),
    totalFetched: z.number(),
    fetchErrors: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { email, appPassword, maxResults, provider = 'gmail' } = inputData;
    const emails: z.infer<typeof emailDataSchema>[] = [];
    let fetchErrors = 0;

    console.log(`[fetch-inbox-emails] START — email=${email} provider=${provider} maxResults=${maxResults}`);

    const providerConfig = getProviderConfig(provider as MailProvider);
    const inboxFolder = providerConfig.labelToImap['INBOX'] ?? 'INBOX';

    console.log(`[fetch-inbox-emails] IMAP host=${providerConfig.host} port=${providerConfig.port} inboxFolder="${inboxFolder}"`);

    try {
      await withImap(email, appPassword, async (client) => {
        console.log(`[fetch-inbox-emails] IMAP connected OK`);

        const lock = await client.getMailboxLock(inboxFolder, { readonly: true });
        console.log(`[fetch-inbox-emails] mailbox locked: "${inboxFolder}"`);

        try {
          const uids = (await client.search({ all: true }, { uid: true })) as number[];
          console.log(`[fetch-inbox-emails] search returned ${uids.length} UIDs`);

          const recentUids = uids.slice(-maxResults).reverse();
          console.log(`[fetch-inbox-emails] fetching ${recentUids.length} messages`);

          if (recentUids.length === 0) return;

          for await (const msg of client.fetch(
            recentUids,
            { uid: true, envelope: true, flags: true, internalDate: true, source: true },
            { uid: true }
          )) {
            try {
              const parsed = parseEmailSource(msg.source ?? '');
              const msgId = encodeMessageId(inboxFolder, msg.uid);
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
            } catch (msgErr) {
              console.error(`[fetch-inbox-emails] failed to parse msg uid=${msg.uid}:`, msgErr);
              fetchErrors++;
            }
          }

          console.log(`[fetch-inbox-emails] fetched ${emails.length} emails, errors=${fetchErrors}`);
        } finally {
          lock.release();
          console.log(`[fetch-inbox-emails] mailbox lock released`);
        }
      }, provider as MailProvider);
    } catch (imapErr: any) {
      console.error(`[fetch-inbox-emails] IMAP error — message="${imapErr?.message}" responseCode="${imapErr?.responseCode}" serverMessage="${imapErr?.serverMessage}"`);
      console.error(`[fetch-inbox-emails] full error:`, imapErr);
      throw imapErr;
    }

    console.log(`[fetch-inbox-emails] DONE — returning ${emails.length} emails`);
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
        id: e.id,
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

Please provide a comprehensive summary following your instructions. Output ONLY valid JSON.`;

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

    let rawOutput = '';
    let tokenCount = 0;
    const streamId = initData.streamId;

    for await (const chunk of streamResult.textStream as AsyncIterable<string>) {
      if (streamId && isWorkflowKilled(streamId)) {
        console.log(`[Workflow] Stream ${streamId} killed by user`);
        throw new Error('Workflow killed by user');
      }

      rawOutput += chunk;
      tokenCount += chunk.length / 4;

      if (rawOutput.length > MAX_CHARS_ESTIMATE) {
        console.warn(`[Workflow] Summary generation exceeded max length limit, stopping`);
        break;
      }

      if (tokenCount > 6000) {
        console.warn('[Workflow] Summary generation seems to be repeating, stopping');
        break;
      }
    }

    const rawUsage = (await streamResult.usage) as any;
    const promptTokens = rawUsage?.promptTokens ?? rawUsage?.inputTokens ?? 0;
    const completionTokens = rawUsage?.completionTokens ?? rawUsage?.outputTokens ?? 0;
    const totalTokens = rawUsage?.totalTokens ?? (promptTokens + completionTokens);

    // Parse the JSON output from the agent
    let parsedResult: { short_summary: string; emails: z.infer<typeof minimalClassificationSchema>[] };
    
    // Create a lookup map for email data to enrich the agent's minimal output
    const emailDataMap = new Map(emailList.map(e => [e.id, e]));
    
    // Recovers short_summary + all complete email objects from a truncated JSON response.
    function recoverPartialJson(raw: string): typeof parsedResult | null {
      try {
        const summaryMatch = raw.match(/"short_summary"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
        const short_summary = summaryMatch ? summaryMatch[1] : 'Summary was incomplete.';

        const arrayStart = raw.search(/"emails"\s*:\s*\[/);
        if (arrayStart === -1) return null;

        const arrayContent = raw.slice(raw.indexOf('[', arrayStart) + 1);
        const emails: z.infer<typeof minimalClassificationSchema>[] = [];
        let depth = 0;
        let objStart = -1;

        for (let i = 0; i < arrayContent.length; i++) {
          const ch = arrayContent[i];
          if (ch === '{') {
            if (depth === 0) objStart = i;
            depth++;
          } else if (ch === '}') {
            depth--;
            if (depth === 0 && objStart !== -1) {
              try {
                const obj = JSON.parse(arrayContent.substring(objStart, i + 1));
                if (obj.id && obj.section) emails.push(obj);
              } catch { /* skip malformed object */ }
              objStart = -1;
            }
          }
        }

        if (emails.length === 0) return null;
        console.log(`[Workflow] Recovered ${emails.length} email(s) from partial JSON`);
        return { short_summary, emails };
      } catch {
        return null;
      }
    }

    try {
      // Try to extract JSON from the output (in case there's markdown code block)
      const jsonMatch = rawOutput.match(/```json\s*([\s\S]*?)```/) ||
                        rawOutput.match(/```\s*([\s\S]*?)```/) ||
                        rawOutput.match(/(\{[\s\S]*\})/);

      const jsonStr = jsonMatch ? jsonMatch[1] : rawOutput;
      parsedResult = JSON.parse(jsonStr.trim());

      // Validate that we have the required fields
      if (!parsedResult.short_summary || !Array.isArray(parsedResult.emails)) {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('[Workflow] Failed to parse agent output as JSON:', parseError);

      // Try to salvage whatever complete email objects were generated
      const recovered = recoverPartialJson(rawOutput);
      if (recovered) {
        parsedResult = recovered;
      } else {
        console.error('[Workflow] Recovery failed. Raw output:', rawOutput);
        // Fallback: create a basic structure
        parsedResult = {
          short_summary: 'Failed to parse summary. Please try again.',
          emails: emailList.map(e => ({
            id: e.id,
            section: 'low_priority' as const,
          })),
        };
      }
    }

    // Enrich the minimal classification with from/subject from original email data
    const enrichedEmails: z.infer<typeof classifiedEmailSchema>[] = parsedResult.emails.map(classifiedEmail => {
      const originalEmail = emailDataMap.get(classifiedEmail.id);
      return {
        id: classifiedEmail.id,
        from: originalEmail?.from || 'Unknown Sender',
        subject: originalEmail?.subject || 'No Subject',
        section: classifiedEmail.section,
        subsection: classifiedEmail.subsection,
      };
    });

    return {
      short_summary: parsedResult.short_summary,
      emails: enrichedEmails,
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
    provider: z.string().default('gmail'),
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
