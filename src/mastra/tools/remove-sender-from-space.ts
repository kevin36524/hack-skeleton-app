import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken, getAccountId } from '../helpers/get-token';
import { yaiPost } from '../helpers/yai-server-api';
import { getCurrentSpace } from '../helpers/get-current-space';

/**
 * Remove a specific email sender from the current space.
 * Fetches the current sender list, removes the matching entry, and saves.
 * Requires human approval (HITL) before executing.
 */
export const removeSenderFromSpace = createTool({
  id: 'remove-sender-from-space',
  description:
    'Remove a specific email sender from the current space. Provide the sender email address to remove. Automatically reads the current senders list and saves the updated list.',
  inputSchema: z.object({
    senderEmail: z.string().describe('Email address of the sender to remove'),
  }),
  requireApproval: true,
  outputSchema: z.object({
    success: z.boolean(),
    removedSender: z.string(),
    remainingSenders: z.array(
      z.object({ email: z.string(), name: z.string().optional() })
    ),
    message: z.string().optional(),
  }),
  execute: async ({ senderEmail }, context) => {
    const token = getToken(context);
    const accountId = getAccountId(context);
    if (!accountId) throw new Error('accountId is required');

    const { space, spaceId } = await getCurrentSpace(context);

    const currentSenders = space.emailSenders ?? [];
    const updatedSenders = currentSenders.filter(
      (s) => s.email.toLowerCase() !== senderEmail.toLowerCase()
    );

    if (updatedSenders.length === currentSenders.length) {
      return {
        success: false,
        removedSender: senderEmail,
        remainingSenders: currentSenders,
        message: `Sender "${senderEmail}" was not found in the space`,
      };
    }

    const response = await yaiPost<any>(token, '/yai/autopilot/editSpace', {
      accountId,
      spaceId,
      updateObj: { emailSenders: updatedSenders },
    });

    return {
      success: response.success ?? true,
      removedSender: senderEmail,
      remainingSenders: updatedSenders,
      message: response.message,
    };
  },
});
