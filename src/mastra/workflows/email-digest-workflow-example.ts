/**
 * Example Usage: Email Digest Workflow
 *
 * This example demonstrates how to use the emailDigestWorkflow to:
 * 1. Fetch messages from a mailbox
 * 2. Extract email snippets
 * 3. Generate an AI-powered daily digest
 */

import { mastra } from '../index';
import { RuntimeContext } from '@mastra/core/runtime-context';

/**
 * Generate email digest for a user's mailbox
 *
 * @param mailboxId - The mailbox ID
 * @param accountId - The account ID
 * @param inboxFolderId - The inbox folder ID
 * @param oauthToken - OAuth token for API authentication
 * @param duration - Number of days to fetch emails (default: 1)
 * @param userId - Optional user ID for memory context
 * @returns The generated digest string
 */
export async function generateEmailDigestWorkflow(
  mailboxId: string,
  accountId: string,
  inboxFolderId: string,
  oauthToken: string,
  duration: number = 1,
  userId?: string
) {
  // Get the workflow
  const workflow = mastra.getWorkflow('emailDigestWorkflow');
  if (!workflow) {
    throw new Error('Email digest workflow not found');
  }

  // Create runtime context and set OAuth token
  const runtimeContext = new RuntimeContext();
  runtimeContext.set('oauthToken', oauthToken);
  if (userId) {
    runtimeContext.set('userId', userId);
  }

  // Create a workflow run
  const run = await workflow.createRunAsync();

  // Execute the workflow
  const result = await run.start({
    inputData: {
      mailboxId,
      accountId,
      inboxFolderId,
      duration,
    },
    runtimeContext,
  });

  // Check execution status
  if (result.status !== 'success') {
    throw new Error(`Workflow execution failed with status: ${result.status}`);
  }

  return result.result;
}

// Example usage:
// const digest = await generateEmailDigestWorkflow(
//   'mailbox-123',
//   'account-456',
//   'inbox-789',
//   'oauth-token-here',
//   1, // Last 1 day
//   'user-123'
// );
// console.log('Digest:', digest.digest);
