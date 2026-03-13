import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import { getMailboxId } from '../helpers/get-mailbox-id';

/**
 * Star/unstar messages (requires human approval)
 */
export const starMessages = createTool({
  id: 'star-messages',
  description: 'Star or unstar one or more messages. Requires user approval.',
  inputSchema: z.object({
    messageIds: z.array(z.string()).describe('Array of message IDs to star/unstar'),
    starred: z.boolean().describe('true to star, false to unstar'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
  }),
  requireApproval: true,
  execute: async ({ messageIds, starred }, context) => {
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
              flags: {
                flagged: starred,
              },
            },
          },
        },
      ],
      responseType: 'json',
    };

    await yahooPost(token, '/batch', request);

    return {
      success: true,
      count: messageIds.length,
    };
  },
});
