import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { convert } from 'html-to-text';
import { getToken } from '../helpers/get-token';
import { yahooGet, YahooApiError } from '../helpers/yahoo-api';
import { getMailboxId } from '../helpers/get-mailbox-id';
import type { FullMessageBodyResponse, ListConversationsApiResponse } from '../../../lib/types/api';

function resolveBodyText(response: FullMessageBodyResponse): string {
  const rawText = response.simpleBody?.text;
  const rawHtml = response.simpleBody?.html;
  return rawText ?? (rawHtml ? convert(rawHtml, { wordwrap: false }) : '');
}

/**
 * Get full text/HTML body of one message or all messages in a conversation/thread
 */
export const getMessageBody = createTool({
  id: 'get-message-body',
  description: 'Get the full text and HTML body of a specific message or conversation thread',
  inputSchema: z.object({
    messageId: z.string().describe('The message ID or conversation ID to fetch the body for'),
  }),
  outputSchema: z.object({
    text: z.string(),
  }),
  execute: async ({ messageId }, context) => {
    const token = getToken(context);
    const mailboxId = await getMailboxId(token, context);

    // First try fetching as a direct message ID
    const directEndpoint = `/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`;
    console.log('[get-message-body] request:', { messageId, mailboxId, endpoint: directEndpoint });

    try {
      const response = await yahooGet<FullMessageBodyResponse>(token, directEndpoint);
      console.log('[get-message-body] simpleBody keys:', Object.keys(response.simpleBody ?? {}));
      console.log('[get-message-body] text:', response.simpleBody?.text?.slice(0, 200));
      console.log('[get-message-body] html (first 200):', response.simpleBody?.html?.slice(0, 200));

      const text = resolveBodyText(response);
      console.log('[get-message-body] resolved text (first 200):', text.slice(0, 200));
      return { text };
    } catch (err) {
      if (!(err instanceof YahooApiError) || err.status !== 400) {
        throw err;
      }
      // 400 means messageId is likely a conversationId — fetch all messages in the thread
      console.log('[get-message-body] direct fetch returned 400, falling back to conversationId query');
    }

    const convEndpoint = `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=conversationId:${messageId}`;
    console.log('[get-message-body] conversation query:', { convEndpoint });

    const convResponse = await yahooGet<ListConversationsApiResponse>(token, convEndpoint);
    const messages = convResponse.messages ?? [];
    console.log(`[get-message-body] conversation has ${messages.length} messages`);

    if (messages.length === 0) {
      return { text: '' };
    }

    // Fetch body for each message in the thread and concatenate
    const bodyTexts: string[] = [];
    for (const msg of messages) {
      try {
        const bodyEndpoint = `/mailboxes/@.id==${mailboxId}/messages/@.id==${msg.id}/content/simplebody/full`;
        const bodyResponse = await yahooGet<FullMessageBodyResponse>(token, bodyEndpoint);
        const text = resolveBodyText(bodyResponse);
        if (text) bodyTexts.push(text);
      } catch (e) {
        console.warn(`[get-message-body] failed to fetch body for message ${msg.id}:`, e);
      }
    }

    const combined = bodyTexts.join('\n\n---\n\n');
    console.log('[get-message-body] combined thread text (first 200):', combined.slice(0, 200));
    return { text: combined };
  },
});
