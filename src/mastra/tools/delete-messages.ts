import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import type { TriageResponse } from '../../../lib/types/api';

/**
 * Move messages to trash (requires human approval)
 */
export const deleteMessages = createTool({
  id: 'delete-messages',
  description: 'Move one or more messages to the trash folder. Requires user approval.',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    messageIds: z.array(z.string()).describe('Array of message IDs to trash'),
    trashFolderId: z.string().describe('The trash folder ID (get from listFolders)'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deletedCount: z.number(),
  }),
  requireApproval: true,
  execute: async ({ mailboxId, messageIds, trashFolderId }, context) => {
    const token = getToken(context);

    const idsQuery = messageIds.join('%20');
    const uri = `/ws/v3/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=id%3A(${idsQuery})`;

    const request = {
      requests: [
        {
          id: 'UnifiedUpdateMessage_0',
          uri,
          method: 'POST',
          payloadType: 'embedded',
          payload: {
            message: {
              folder: {
                id: trashFolderId,
              },
            },
          },
        },
      ],
      responseType: 'json',
    };

    await yahooPost<TriageResponse>(token, '/batch', request);

    return {
      success: true,
      deletedCount: messageIds.length,
    };
  },
});
