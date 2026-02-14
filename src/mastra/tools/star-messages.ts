import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooPost } from '../helpers/yahoo-api';
import type { TriageRequest, TriageResponse } from '../../../lib/types/api';

/**
 * Star/unstar messages (requires human approval)
 */
export const starMessages = createTool({
  id: 'star-messages',
  description: 'Star or unstar one or more messages. Requires user approval.',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    messageIds: z.array(z.string()).describe('Array of message IDs to star/unstar'),
    starred: z.boolean().describe('true to star, false to unstar'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
  }),
  requireApproval: true,
  execute: async (params) => {
    const token = getToken(params);
    const { mailboxId, messageIds, starred } = params;

    // Use batch API matching frontend logic (message-service.ts)
    const request: TriageRequest = {
      batch: messageIds.map((id, index) => ({
        id: `toggle-star-${index}`,
        method: 'PUT',
        uri: `/mailboxes/@.id==${mailboxId}/messages/@.id==${id}`,
        entity: {
          message: {
            id,
            flags: {
              flagged: starred ? 1 : 0
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
