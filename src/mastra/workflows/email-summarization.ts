import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch full message body from mail API
const fetchMessageStep = createStep({
  id: 'fetch-message',
  description: 'Fetch full message body from mail API',
  inputSchema: z.object({
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  outputSchema: z.object({
    messageBody: z.object({
      text: z.string().optional(),
      html: z.string().optional(),
    }),
    fetchedAt: z.string(),
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  execute: async ({ runtimeContext, inputData }) => {
    const { mailboxId, messageId } = inputData;

    // Get OAuth token from runtime context
    const token = runtimeContext.get('oauthToken');
    if (!token) {
      throw new Error('OAuth token not found in runtime context');
    }

    // Fetch the message from the mail API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch message: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      messageBody: data.result.simpleBody || { text: '', html: '' },
      fetchedAt: new Date().toISOString(),
      mailboxId,
      messageId,
    };
  },
});

// Step 2: Convert HTML to plain text
const convertHtmlToTextStep = createStep({
  id: 'convert-html-to-text',
  description: 'Convert HTML email body to plain text',
  inputSchema: z.object({
    messageBody: z.object({
      text: z.string().optional(),
      html: z.string().optional(),
    }),
    fetchedAt: z.string(),
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  outputSchema: z.object({
    plainText: z.string(),
    conversionMethod: z.string(),
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { messageBody, mailboxId, messageId } = inputData;

    // If text is available, use it directly
    if (messageBody.text && messageBody.text.trim()) {
      return {
        plainText: messageBody.text,
        conversionMethod: 'direct',
        mailboxId,
        messageId,
      };
    }

    // Otherwise, convert HTML to text
    if (messageBody.html) {
      // Simple HTML to text conversion
      let text = messageBody.html
        // Remove script tags and content
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        // Remove style tags and content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // Convert common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // Convert line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        // Remove all other HTML tags
        .replace(/<[^>]+>/g, '')
        // Clean up whitespace
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      return {
        plainText: text,
        conversionMethod: 'html-strip',
        mailboxId,
        messageId,
      };
    }

    return {
      plainText: '',
      conversionMethod: 'none',
      mailboxId,
      messageId,
    };
  },
});

// Step 3: Summarize email using AI agent
const summarizeEmailStep = createStep({
  id: 'summarize-email',
  description: 'Generate AI summary of email content',
  inputSchema: z.object({
    plainText: z.string(),
    conversionMethod: z.string(),
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  outputSchema: z.object({
    summary: z.string(),
    status: z.string(),
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { plainText, mailboxId, messageId } = inputData;

    if (!plainText || plainText.trim().length === 0) {
      return {
        summary: 'No content available to summarize.',
        status: 'empty',
        mailboxId,
        messageId,
      };
    }

    // Get the email summarizer agent
    const agent = mastra.getAgent('emailSummarizer');
    if (!agent) {
      throw new Error('emailSummarizer agent not found');
    }

    // Generate summary
    const result = await agent.generate(
      `Please summarize the following email:\n\n${plainText}`
    );

    return {
      summary: result.text,
      status: 'success',
      mailboxId,
      messageId,
    };
  },
});

// Create and export the workflow
export const emailSummarizationWorkflow = createWorkflow({
  id: 'email-summarization',
  description: 'Fetch and summarize email messages using AI',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mail mailbox ID'),
    messageId: z.string().describe('The message ID to summarize'),
  }),
  outputSchema: z.object({
    summary: z.string(),
    status: z.string(),
    mailboxId: z.string(),
    messageId: z.string(),
  }),
})
  .then(fetchMessageStep)
  .then(convertHtmlToTextStep)
  .then(summarizeEmailStep)
  .commit();
