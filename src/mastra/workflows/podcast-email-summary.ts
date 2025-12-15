import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch full message bodies for all message IDs
const fetchMessagesStep = createStep({
  id: 'fetch-messages',
  description: 'Fetch full message bodies for all message IDs',
  inputSchema: z.object({
    mailboxId: z.string(),
    messageIds: z.array(z.string()),
  }),
  outputSchema: z.object({
    messages: z.array(z.object({
      messageId: z.string(),
      subject: z.string().optional(),
      from: z.string().optional(),
      body: z.object({
        text: z.string().optional(),
        html: z.string().optional(),
      }),
    })),
    fetchedAt: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { mailboxId, messageIds } = inputData;

    // Get OAuth token from runtime context
    const token = runtimeContext.get('oauthToken');
    if (!token) {
      throw new Error('OAuth token not found in runtime context');
    }

    console.log(`[WORKFLOW] Fetching ${messageIds.length} messages`);

    // Determine base URL: use env var if set, otherwise use localhost with appropriate port
    const baseUrl = `http://localhost:${process.env.PORT || 3000}`;

    // Fetch all messages in parallel
    const messagePromises = messageIds.map(async (messageId) => {
      try {
        // Fetch full message body
        const apiUrl = `${baseUrl}/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`;

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`[WORKFLOW] Failed to fetch message ${messageId}: ${response.status}`);
          return null;
        }

        const data = await response.json();

        // Also fetch message metadata for subject and from
        const metadataUrl = `${baseUrl}/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}`;

        const metadataResponse = await fetch(metadataUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let subject = 'No Subject';
        let from = 'Unknown Sender';

        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          subject = metadata.result?.message?.headers?.subject || 'No Subject';
          const fromHeader = metadata.result?.message?.headers?.from?.[0];
          from = fromHeader?.name || fromHeader?.email || 'Unknown Sender';
        }

        return {
          messageId,
          subject,
          from,
          body: data.result.simpleBody,
        };
      } catch (error) {
        console.error(`[WORKFLOW] Error fetching message ${messageId}:`, error);
        return null;
      }
    });

    const messages = (await Promise.all(messagePromises)).filter((msg) => msg !== null);

    console.log(`[WORKFLOW] Successfully fetched ${messages.length} out of ${messageIds.length} messages`);

    return {
      messages,
      fetchedAt: new Date().toISOString(),
    };
  },
});

// Step 2: Convert HTML to plain text for all messages
const convertMessagesToTextStep = createStep({
  id: 'convert-to-text',
  description: 'Convert all HTML email bodies to plain text',
  inputSchema: z.object({
    messages: z.array(z.object({
      messageId: z.string(),
      subject: z.string().optional(),
      from: z.string().optional(),
      body: z.object({
        text: z.string().optional(),
        html: z.string().optional(),
      }),
    })),
    fetchedAt: z.string(),
  }),
  outputSchema: z.object({
    processedMessages: z.array(z.object({
      messageId: z.string(),
      subject: z.string(),
      from: z.string(),
      plainText: z.string(),
    })),
  }),
  execute: async ({ inputData }) => {
    const { messages } = inputData;

    console.log(`[WORKFLOW] Converting ${messages.length} messages to plain text`);

    const processedMessages = messages.map((message) => {
      let plainText = '';

      // If text is available, use it directly
      if (message.body.text && message.body.text.trim()) {
        plainText = message.body.text;
      }
      // Otherwise, convert HTML to text
      else if (message.body.html) {
        let text = message.body.html;
        // Simple HTML to text conversion
        text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        text = text.replace(/&nbsp;/g, ' ');
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<[^>]+>/g, '');
        plainText = text.trim();
      }

      return {
        messageId: message.messageId,
        subject: message.subject || 'No Subject',
        from: message.from || 'Unknown Sender',
        plainText,
      };
    });

    console.log(`[WORKFLOW] Converted ${processedMessages.length} messages to plain text`);

    return {
      processedMessages,
    };
  },
});

// Step 3: Summarize each email individually using AI
const summarizeIndividualEmailsStep = createStep({
  id: 'summarize-emails',
  description: 'Generate AI summaries for each email',
  inputSchema: z.object({
    processedMessages: z.array(z.object({
      messageId: z.string(),
      subject: z.string(),
      from: z.string(),
      plainText: z.string(),
    })),
  }),
  outputSchema: z.object({
    emailSummaries: z.array(z.object({
      messageId: z.string(),
      subject: z.string(),
      from: z.string(),
      summary: z.string(),
    })),
  }),
  execute: async ({ inputData, mastra }) => {
    const { processedMessages } = inputData;

    console.log(`[WORKFLOW] Summarizing ${processedMessages.length} emails`);

    // Get the podcast summarizer agent
    const agent = mastra.getAgent('podcastSummarizer');
    if (!agent) {
      throw new Error('podcastSummarizer agent not found');
    }

    // Summarize each email
    const summaryPromises = processedMessages.map(async (message) => {
      if (!message.plainText || message.plainText.trim().length === 0) {
        return {
          messageId: message.messageId,
          subject: message.subject,
          from: message.from,
          summary: `This email from ${message.from} with subject "${message.subject}" appears to be empty or couldn't be processed.`,
        };
      }

      try {
        const result = await agent.generate(
          `Please summarize this email in a podcast-style format:\n\nFrom: ${message.from}\nSubject: ${message.subject}\n\nContent:\n${message.plainText.slice(0, 5000)}`
        );

        return {
          messageId: message.messageId,
          subject: message.subject,
          from: message.from,
          summary: result.text,
        };
      } catch (error) {
        console.error(`[WORKFLOW] Error summarizing email ${message.messageId}:`, error);
        return {
          messageId: message.messageId,
          subject: message.subject,
          from: message.from,
          summary: `Unable to summarize this email from ${message.from} about "${message.subject}".`,
        };
      }
    });

    const emailSummaries = await Promise.all(summaryPromises);

    console.log(`[WORKFLOW] Generated ${emailSummaries.length} email summaries`);

    return {
      emailSummaries,
    };
  },
});

// Step 4: Combine all summaries into a podcast-style narrative
const combineToPodcastStep = createStep({
  id: 'combine-to-podcast',
  description: 'Combine individual email summaries into a cohesive podcast-style narrative',
  inputSchema: z.object({
    emailSummaries: z.array(z.object({
      messageId: z.string(),
      subject: z.string(),
      from: z.string(),
      summary: z.string(),
    })),
  }),
  outputSchema: z.object({
    podcastSummary: z.string(),
    emailCount: z.number(),
    generatedAt: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { emailSummaries } = inputData;

    console.log(`[WORKFLOW] Combining ${emailSummaries.length} email summaries into podcast format`);

    // Get the podcast summarizer agent
    const agent = mastra.getAgent('podcastSummarizer');
    if (!agent) {
      throw new Error('podcastSummarizer agent not found');
    }

    // Create a combined prompt with all summaries
    const combinedContent = emailSummaries
      .map((email, index) => `Email ${index + 1}:\n${email.summary}`)
      .join('\n\n');

    const prompt = `You are a podcast host creating a final email digest. You have ${emailSummaries.length} email summaries below. Please combine them into a cohesive, engaging podcast-style narrative.

Start with a friendly intro like "Welcome to your email digest! Today we have ${emailSummaries.length} emails to cover..."

Then naturally flow through each email summary, maintaining a conversational tone throughout.

End with a closing remark like "That's all for today's email digest. Stay productive!"

Here are the individual email summaries:

${combinedContent}

Create the final podcast-style narrative:`;

    const result = await agent.generate(prompt);

    console.log(`[WORKFLOW] Generated podcast summary of ${result.text.length} characters`);

    return {
      podcastSummary: result.text,
      emailCount: emailSummaries.length,
      generatedAt: new Date().toISOString(),
    };
  },
});

// Create the complete workflow
export const podcastEmailSummaryWorkflow = createWorkflow({
  id: 'podcast-email-summary',
  description: 'Fetch multiple emails, summarize them individually, and combine into a podcast-style summary',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID'),
    messageIds: z.array(z.string()).describe('Array of message IDs to summarize'),
  }),
  outputSchema: z.object({
    podcastSummary: z.string(),
    emailCount: z.number(),
    generatedAt: z.string(),
  }),
})
  .then(fetchMessagesStep)
  .then(convertMessagesToTextStep)
  .then(summarizeIndividualEmailsStep)
  .then(combineToPodcastStep)
  .commit();
