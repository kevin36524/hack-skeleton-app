import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import type { TriageRequest, TriageResponse } from '../../../lib/types/api';

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
  execute: async (params) => {
    const token = getToken(params);
    const { mailboxId, messageIds, read } = params;

    // Use batch API matching frontend logic (message-service.ts)
    const request: TriageRequest = {
      batch: messageIds.map((id, index) => ({
        id: `mark-read-${index}`,
        method: 'PUT',
        uri: `/mailboxes/@.id==${mailboxId}/messages/@.id==${id}`,
        entity: {
          message: {
            id,
            flags: {
              read: read ? 1 : 0
            }
          }
        }
      }))
    };

    await yahooPost<TriageResponse>(token, '/batch', request);

    return {
      success: true,
      count: messageIds.length,
    };
  },
});
