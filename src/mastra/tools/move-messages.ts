import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import { getMailboxId } from '../helpers/get-mailbox-id';
import type { MoveMessagesResponse } from '../../../lib/types/api';

/**
 * Move messages to another folder (requires human approval)
 */
export const moveMessages = createTool({
  id: 'move-messages',
  description: 'Move one or more messages to a different folder. Requires user approval.',
  inputSchema: z.object({
    messageIds: z.array(z.string()).describe('Array of message IDs to move'),
    targetFolderId: z.string().describe('The folder ID to move messages to'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    movedCount: z.number(),
  }),
  requireApproval: true,
  execute: async ({ messageIds, targetFolderId }, context) => {
    const token = getToken(context);
    const mailboxId = await getMailboxId(token, context);

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
                id: targetFolderId,
              },
            },
          },
        },
      ],
      responseType: 'json',
    };

    await yahooPost<MoveMessagesResponse>(token, '/batch', request);

    return {
      success: true,
      movedCount: messageIds.length,
    };
  },
});
