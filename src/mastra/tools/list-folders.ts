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
  execute: async (params) => {
    const token = getToken(params);
    const { mailboxId } = params;

    // Get accountId from params or requestContext
    const accountId = params.accountId || getAccountId(params);

    // Use the same endpoint as frontend (folder-service.ts)
    const response = await yahooGet<GetFoldersApiResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/folders`
    );

    let folders = response.folders;

    // Filter by accountId if provided
    if (accountId) {
      folders = folders.filter(folder => folder.acctId === accountId);
    }

    return folders.map(toSlimFolder);
  },
});
