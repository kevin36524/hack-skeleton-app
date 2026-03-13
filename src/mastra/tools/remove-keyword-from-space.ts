import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken, getAccountId } from '../helpers/get-token';
import { yaiPost } from '../helpers/yai-server-api';
import { getCurrentSpace } from '../helpers/get-current-space';

/**
 * Remove a specific keyword from the current space.
 * Fetches the current keyword list, removes the matching entry, and saves.
 * Requires human approval (HITL) before executing.
 */
export const removeKeywordFromSpace = createTool({
  id: 'remove-keyword-from-space',
  description:
    'Remove a specific keyword from the current space. Provide the exact keyword to remove. Automatically reads the current keyword list and saves the updated list.',
  inputSchema: z.object({
    keyword: z.string().describe('The keyword to remove from the space'),
  }),
  requireApproval: true,
  outputSchema: z.object({
    success: z.boolean(),
    removedKeyword: z.string(),
    remainingKeywords: z.array(z.string()),
    message: z.string().optional(),
  }),
  execute: async ({ keyword }, context) => {
    const token = getToken(context);
    const accountId = getAccountId(context);
    if (!accountId) throw new Error('accountId is required');

    const { space, spaceId } = await getCurrentSpace(context);

    const currentKeywords = space.keywords ?? [];
    const updatedKeywords = currentKeywords.filter(
      (k) => k.toLowerCase() !== keyword.toLowerCase()
    );

    if (updatedKeywords.length === currentKeywords.length) {
      return {
        success: false,
        removedKeyword: keyword,
        remainingKeywords: currentKeywords,
        message: `Keyword "${keyword}" was not found in the space`,
      };
    }

    const response = await yaiPost<any>(token, '/yai/autopilot/editSpace', {
      accountId,
      spaceId,
      updateObj: { keywords: updatedKeywords },
    });

    return {
      success: response.success ?? true,
      removedKeyword: keyword,
      remainingKeywords: updatedKeywords,
      message: response.message,
    };
  },
});
