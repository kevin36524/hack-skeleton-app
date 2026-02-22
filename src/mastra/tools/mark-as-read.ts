import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import type { TriageResponse } from '../../../lib/types/api';

/**
 * Mark messages as read/unread (requires human approval)
 */
export const markAsRead = createTool({
  id: 'mark-as-read',
  description: 'Mark one or more messages as read or unread. Requires user approval.',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    messageIds: z.array(z.string()).describe('Array of message IDs to mark'),
    read: z.boolean().describe('true to mark as read, false to mark as unread'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
  }),
  requireApproval: true,
  execute: async ({ mailboxId, messageIds, read }, context) => {
    const token = getToken(context);

    // Combine all IDs into a single batch request using select query
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
                read,
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
      count: messageIds.length,
    };
  },
});
