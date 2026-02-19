import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken, getAccountId } from '../helpers/get-token';
import { yahooGet } from '../helpers/yahoo-api';
import { toSlimFolder } from '../types';
import type { GetFoldersApiResponse } from '../../../lib/types/api';

/**
 * List all folders with unread counts, optionally filtered by accountId
 */
export const listFolders = createTool({
  id: 'list-folders',
  description: 'List all mail folders with unread message counts. If accountId is available in context, returns folders for that account only.',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID from getMailbox'),
    accountId: z.string().optional().describe('Optional account ID to filter folders. If not provided, will try to use accountId from requestContext.'),
  }),
  outputSchema: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      unreadCount: z.number(),
    })
  ),
  execute: async ({ mailboxId, accountId: inputAccountId }, context) => {
    const token = getToken(context);

    // Get accountId from input or requestContext
    const accountId = inputAccountId || getAccountId(context);

    // Use server-side account filter when accountId is available
    const endpoint = accountId
      ? `/mailboxes/@.id==${mailboxId}/folders/@.select==q?q=acctId:${accountId}`
      : `/mailboxes/@.id==${mailboxId}/folders`;

    const response = await yahooGet<GetFoldersApiResponse>(token, endpoint);

    return response.folders.map(toSlimFolder);
  },
});
