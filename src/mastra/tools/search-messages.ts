import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken } from '../helpers/get-token';
import { yahooGet } from '../helpers/yahoo-api';
import { getMailboxId } from '../helpers/get-mailbox-id';
import { toSlimMessage } from '../types';
import type { SearchMessagesApiResponse } from '../../../lib/types/api';

/**
 * Search messages by query
 */
export const searchMessages = createTool({
  id: 'search-messages',
  description: 'Search messages in the mailbox using a query string',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "from:john@example.com", "subject:invoice")'),
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
  execute: async ({ query, count = 30, offset = 0 }, context) => {
    const token = getToken(context);
    const mailboxId = await getMailboxId(token, context);

    // Build query string matching frontend logic (message-service.ts)
    const fullQuery = `${query}+offset:${offset}+count:${count}`;

    const response = await yahooGet<SearchMessagesApiResponse>(
      token,
      `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${fullQuery}`
    );

    return response.messages.map(toSlimMessage);
  },
});
