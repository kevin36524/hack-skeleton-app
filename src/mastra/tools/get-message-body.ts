import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { convert } from 'html-to-text';
import { getToken } from '../helpers/get-token';
import { yahooGet } from '../helpers/yahoo-api';
import { getMailboxId } from '../helpers/get-mailbox-id';
import type { FullMessageBodyResponse } from '../../../lib/types/api';

/**
 * Get full text/HTML body of one message
 */
export const getMessageBody = createTool({
  id: 'get-message-body',
  description: 'Get the full text and HTML body of a specific message',
  inputSchema: z.object({
    messageId: z.string().describe('The message ID to fetch the body for'),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
  execute: async ({ messageId }, context) => {
    const token = getToken(context);
    const mailboxId = await getMailboxId(token, context);

    const endpoint = `/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`;
    console.log('[get-message-body] request:', { messageId, mailboxId, endpoint });

    const response = await yahooGet<FullMessageBodyResponse>(token, endpoint);
    console.log('[get-message-body] simpleBody keys:', Object.keys(response.simpleBody ?? {}));
    console.log('[get-message-body] text:', response.simpleBody?.text?.slice(0, 200));
    console.log('[get-message-body] html (first 200):', response.simpleBody?.html?.slice(0, 200));

    const rawText = response.simpleBody?.text;
    const rawHtml = response.simpleBody?.html;

    const text = rawText ?? (rawHtml ? convert(rawHtml, { wordwrap: false }) : '');
    console.log('[get-message-body] resolved text (first 200):', text.slice(0, 200));

    return { text };
  },
});
