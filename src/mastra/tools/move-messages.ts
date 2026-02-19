import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import type { MoveMessagesRequest, MoveMessagesResponse } from '../../../lib/types/api';

/**
 * Move messages to another folder (requires human approval)
 */
export const moveMessages = createTool({
  id: 'move-messages',
  description: 'Move one or more messages to a different folder. Requires user approval.',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    messageIds: z.array(z.string()).describe('Array of message IDs to move'),
    targetFolderId: z.string().describe('The folder ID to move messages to'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    movedCount: z.number(),
  }),
  requireApproval: true,
  execute: async ({ mailboxId, messageIds, targetFolderId }, context) => {
    const token = getToken(context);

    // Use batch API matching frontend logic (message-service.ts)
    const request: MoveMessagesRequest = {
      responseType: "json",
      requests: messageIds.map((id, index) => ({
        id: `UnifiedUpdateMessage_${index}`,
        exportResponse: false,
        uri: `/ws/v3/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=id%3A(${id})`,
        method: "POST",
        requests: [],
        filters: {},
        payload: {
          message: {
            folder: {
              id: targetFolderId
            }
          }
        },
        suppressResponse: false
      }))
    };

    await yahooPost<MoveMessagesResponse>(token, '/batch', request);

    return {
      success: true,
      movedCount: messageIds.length,
    };
  },
});
