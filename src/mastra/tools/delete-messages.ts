import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooDelete } from '../helpers/yahoo-api';

/**
 * Permanently delete messages (requires human approval)
 */
export const deleteMessages = createTool({
  id: 'delete-messages',
  description: 'Permanently delete one or more messages. This is irreversible. Requires user approval.',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    messageIds: z.array(z.string()).describe('Array of message IDs to delete'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deletedCount: z.number(),
  }),
  requireApproval: true,
  execute: async ({ mailboxId, messageIds }, context) => {
    const token = getToken(context);

    // Delete messages one by one matching frontend logic (message-service.ts)
    for (const messageId of messageIds) {
      const encodedMessageId = encodeURIComponent(`id:(${messageId})`);
      await yahooDelete(
        token,
        `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${encodedMessageId}&appid=YMailNorrin`
      );
    }

    return {
      success: true,
      deletedCount: messageIds.length,
    };
  },
});
