import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooGet } from '../helpers/yahoo-api';
import type { FullMessageBodyResponse } from '../../../lib/types/api';

/**
 * Get full text/HTML body of one message
 */
export const getMessageBody = createTool({
  id: 'get-message-body',
  description: 'Get the full text and HTML body of a specific message',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    messageId: z.string().describe('The message ID to fetch the body for'),
  }),
  outputSchema: z.object({
    text: z.string(),
    html: z.string().optional(),
  }),
  execute: async (params) => {
    const token = getToken(params);
    const { mailboxId, messageId } = params;

    // Use the same endpoint as frontend (message-service.ts)
    const response = await yahooGet<FullMessageBodyResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`
    );

    return {
      text: response.simpleBody.text,
      html: response.simpleBody.html,
    };
  },
});
