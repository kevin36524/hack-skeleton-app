import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooGet } from '../helpers/yahoo-api';
import { getMailboxId } from '../helpers/get-mailbox-id';
import { toSlimMessage } from '../types';
import type { ListConversationsApiResponse } from '../../../lib/types/api';

/**
 * List messages in a folder (paginated)
 */
export const listMessages = createTool({
  id: 'list-messages',
  description: 'List messages in a folder with pagination support',
  inputSchema: z.object({
    folderId: z.string().describe('The folder ID to list messages from'),
    count: z.number().optional().default(30).describe('Number of messages to fetch (default 30)'),
    offset: z.number().optional().default(0).describe('Offset for pagination (default 0)'),
  }),
  outputSchema: z.array(
    z.object({
      id: z.string(),
      conversationId: z.string(),
      subject: z.string(),
      from: z.string(),
      to: z.string(),
      date: z.string(),
      snippet: z.string(),
      isRead: z.boolean(),
      isStarred: z.boolean(),
      hasAttachments: z.boolean(),
      folderName: z.string(),
    })
  ),
  execute: async ({ folderId, count = 30, offset = 0 }, context) => {
    const token = getToken(context);
    const mailboxId = await getMailboxId(token, context);

    // Build query string matching frontend logic (message-service.ts)
    const query = `folderId:${folderId}+groupBy:conversationId+offset:${offset}+count:${count}`;

    const response = await yahooGet<ListConversationsApiResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`
    );

    return response.messages.map(toSlimMessage);
  },
});
