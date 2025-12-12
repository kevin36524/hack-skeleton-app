import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch all messages based on inputs
const fetchMessagesStep = createStep({
  id: 'fetch-messages',
  description: 'Fetch all messages from mailbox based on filters',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID'),
    accountId: z.string().describe('The account ID'),
    inboxFolderId: z.string().describe('The inbox folder ID'),
    duration: z.number().default(1).describe('Duration in days to fetch emails (default: 1 day)'),
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
    const { mailboxId, accountId, inboxFolderId, duration } = inputData;

    // Get OAuth token from runtime context
    const oauthToken = runtimeContext.get('oauthToken');
    if (!oauthToken) {
      throw new Error('OAuth token not found in runtime context');
    }

    // Calculate time range in seconds since epoch
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    const durationInSeconds = duration * 24 * 60 * 60; // Convert days to seconds
    const timeRangeAgo = currentTimeSeconds - durationInSeconds;

    // Build the query for messages in the specified time range
    // Format: folderId:{id}+-sort:date+date:[{startTime} TO *]+count:200
    const query = `folderId:${inboxFolderId}+-sort:date+date:[${timeRangeAgo} TO *]+count:200`;

    // Build API URL using the correct format
    const apiUrl = `http://localhost:3000/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${encodeURIComponent(query)}`;

    console.log('Fetching messages with query:', query);
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${oauthToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract messages from response
    // Assuming the API returns { result: { messages: [...] } } or similar
    const messages = data.result?.messages || data.messages || [];

    return {
      messages: messages.map((msg: any) => ({
        id: msg.id,
        snippet: msg.snippet || '',
      })),
      messageCount: messages.length,
      fetchedAt: new Date().toISOString(),
    };
  },
});

// Step 2: Get snippets of all messages
const extractSnippetsStep = createStep({
  id: 'extract-snippets',
  description: 'Extract and process snippets from all messages',
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
    processedAt: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { messages } = inputData;

    // Extract snippets from messages
    const snippets = messages
      .map((msg) => msg.snippet || '')
      .filter((snippet) => snippet.trim().length > 0);

    console.log(`Extracted ${snippets.length} snippets from ${messages.length} messages`);

    return {
      snippets,
      snippetCount: snippets.length,
      processedAt: new Date().toISOString(),
    };
  },
});

// Step 3: Call the digest agent and generate digest
const generateDigestStep = createStep({
  id: 'generate-digest',
  description: 'Generate email digest using the digest agent',
  inputSchema: z.object({
    snippets: z.array(z.string()),
    snippetCount: z.number(),
    processedAt: z.string(),
  }),
  outputSchema: z.object({
    digest: z.string(),
    status: z.string(),
    generatedAt: z.string(),
  }),
  execute: async ({ inputData, mastra, runtimeContext }) => {
    const { snippets, snippetCount } = inputData;

    // Check if there are any snippets to process
    if (snippetCount === 0 || snippets.length === 0) {
      return {
        digest: 'No emails found for the specified time period.',
        status: 'empty',
        generatedAt: new Date().toISOString(),
      };
    }

    // Get the email digest agent
    const agent = mastra.getAgent('emailDigestAgent');
    if (!agent) {
      throw new Error('emailDigestAgent not found. Make sure it is registered in Mastra.');
    }

    // Format snippets for the agent
    const emailList = snippets
      .map((snippet, index) => `Email ${index + 1}:\n${snippet}`)
      .join('\n\n---\n\n');

    const message = `Please generate a daily digest summary for the following emails:\n\n${emailList}`;

    console.log(`Generating digest for ${snippetCount} email snippets`);

    // Generate digest using the agent
    const userId = runtimeContext.get('userId') || 'default-user';
    const today = new Date().toISOString().split('T')[0];

    const result = await agent.generate(message, {
      memory: {
        resource: userId,
        thread: `digest-${today}`,
      },
    });

    return {
      digest: result.text,
      status: 'success',
      generatedAt: new Date().toISOString(),
    };
  },
});

// Create and export the workflow
export const emailDigestWorkflow = createWorkflow({
  id: 'email-digest-workflow',
  description: 'Fetch emails from mailbox and generate an AI-powered daily digest summary',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID'),
    accountId: z.string().describe('The account ID'),
    inboxFolderId: z.string().describe('The inbox folder ID'),
    duration: z.number().default(1).describe('Duration in days to fetch emails (default: 1 day)'),
  }),
  outputSchema: z.object({
    digest: z.string().describe('The generated email digest summary'),
    status: z.string().describe('Status of the digest generation'),
    generatedAt: z.string().describe('Timestamp when digest was generated'),
  }),
})
  .then(fetchMessagesStep)
  .then(extractSnippetsStep)
  .then(generateDigestStep)
  .commit();
