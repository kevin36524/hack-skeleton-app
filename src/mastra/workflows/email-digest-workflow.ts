import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch all messages based on mailbox, account, folder, and duration
const fetchMessagesStep = createStep({
  id: 'fetch-messages',
  description: 'Fetch all messages from the mailbox based on filters',
  inputSchema: z.object({
    mailboxId: z.string(),
    inboxFolderId: z.string(),
    duration: z.number().default(1).describe('Duration in days to look back, defaults to 1 day'),
  }),
  outputSchema: z.object({
    messages: z.array(z.object({
      id: z.string(),
      snippet: z.string().optional(),
    })),
    messageCount: z.number(),
    fetchedAt: z.string(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const { mailboxId, inboxFolderId, duration } = inputData;

    // Get OAuth token from runtime context
    const token = runtimeContext.get('oauthToken');
    if (!token) {
      throw new Error('OAuth token not found in runtime context');
    }

    // Calculate time range based on duration (in seconds since epoch)
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    const timeAgo = currentTimeSeconds - (duration * 24 * 60 * 60);

    // Build the query without encoding (as per requirements)
    // Format: folderId:xxx+-sort:date+date:[timestamp TO *]+count:200
    const query = `folderId:${inboxFolderId}+-sort:date+date:[${timeAgo} TO *]+count:200`;

    // Build API URL using localhost:3000
    const apiUrl = `http://localhost:3000/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}`;

    console.log('Fetching messages from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const messages = data.result?.messages || [];

    console.log(`Fetched ${messages.length} messages`);

    return {
      messages,
      messageCount: messages.length,
      fetchedAt: new Date().toISOString(),
    };
  },
});

// Step 2: Extract snippets from all messages
const extractSnippetsStep = createStep({
  id: 'extract-snippets',
  description: 'Extract snippets from all messages',
  inputSchema: z.object({
    messages: z.array(z.object({
      id: z.string(),
      snippet: z.string().optional(),
    })),
    messageCount: z.number(),
    fetchedAt: z.string(),
  }),
  outputSchema: z.object({
    snippets: z.array(z.string()),
    snippetCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { messages } = inputData;

    // Extract snippets from messages, filter out empty ones
    const snippets = messages
      .map(msg => msg.snippet)
      .filter((snippet): snippet is string => Boolean(snippet && snippet.trim()));

    console.log(`Extracted ${snippets.length} snippets from ${messages.length} messages`);

    return {
      snippets,
      snippetCount: snippets.length,
    };
  },
});

// Step 3: Call the digest agent with all snippets
const generateDigestStep = createStep({
  id: 'generate-digest',
  description: 'Generate email digest summary using the digest agent',
  inputSchema: z.object({
    snippets: z.array(z.string()),
    snippetCount: z.number(),
  }),
  outputSchema: z.object({
    digest: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { snippets, snippetCount } = inputData;

    // Handle case where there are no snippets
    if (snippetCount === 0 || snippets.length === 0) {
      return {
        digest: 'No email messages found for the specified time period.',
      };
    }

    // Get the digest agent
    const agent = mastra.getAgent('digestAgent');
    if (!agent) {
      throw new Error('digestAgent not found in Mastra instance');
    }

    // Format snippets for the agent
    const snippetsText = snippets
      .map((snippet, index) => `${index + 1}. ${snippet}`)
      .join('\n\n');

    const prompt = `Generate a daily digest summary for the following ${snippetCount} email snippets:\n\n${snippetsText}`;

    console.log(`Generating digest for ${snippetCount} email snippets`);

    // Generate the digest using the agent
    const result = await agent.generate(prompt);

    return {
      digest: result.text,
    };
  },
});

// Create and export the workflow
export const emailDigestWorkflow = createWorkflow({
  id: 'email-digest-workflow',
  description: 'Fetches recent email messages and generates a daily digest summary',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID to fetch messages from'),
    inboxFolderId: z.string().describe('The inbox folder ID to filter messages'),
    duration: z.number().default(1).describe('Number of days to look back (default: 1 day)'),
  }),
  outputSchema: z.object({
    digest: z.string().describe('The generated email digest summary'),
  }),
})
  .then(fetchMessagesStep)
  .then(extractSnippetsStep)
  .then(generateDigestStep)
  .commit();
