import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { yahooGet } from '../helpers/yahoo-api';
import { getToken } from '../helpers/get-token';
import type { GetMailBoxApiResponse } from '../../../lib/types/api';

/**
 * Get the user's primary mailbox ID and email
 */
export const getMailbox = createTool({
  id: 'get-mailbox',
  description: 'Get the user\'s primary mailbox ID and email address',
  inputSchema: z.object({}),
  outputSchema: z.object({
    mailboxId: z.string(),
    email: z.string(),
  }),
  execute: async (params) => {
    const token = getToken(params);
    const response = await yahooGet<GetMailBoxApiResponse>(token, '/mailboxes');

    const primaryMailbox = response.mailboxes.find((mb) => mb.isPrimary);
    if (!primaryMailbox) {
      throw new Error('No primary mailbox found');
    }

    return {
      mailboxId: primaryMailbox.id,
      email: primaryMailbox.email,
    };
  },
});
