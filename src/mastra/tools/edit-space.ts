import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken, getAccountId } from '../helpers/get-token';
import { yaiPost } from '../helpers/yai-server-api';

/**
 * Edit a space — update keywords, senders, semantic matching phrases, or thresholds.
 * Requires human approval (HITL) before executing.
 */
export const editSpace = createTool({
  id: 'edit-space',
  description: `Edit a space's properties. Can update:
- keywords: list of search keywords (replaces existing list)
- emailSenders: list of {email, name?} senders (replaces existing list)
- extraData.allowlistedPhrases: phrases for emails to INCLUDE (semantic matching)
- extraData.blocklistedPhrases: phrases for emails to EXCLUDE (semantic matching)
- extraData.allowThreshold: min similarity score for allowlist (0.0–1.0, default 0.5)
- extraData.blockThreshold: min similarity score for blocklist (0.0–1.0, default 0.7)
Use "__DELETE__" as a value to remove a field entirely (e.g. clearing messageScores forces recompute).`,
  inputSchema: z.object({
    spaceId: z.string().describe('The ID of the space to edit'),
    updateObj: z
      .object({
        name: z.string().optional().describe('New name for the space'),
        shortName: z.string().optional().describe('New short name'),
        keywords: z
          .array(z.string())
          .optional()
          .describe('Full replacement keyword list for the space'),
        emailSenders: z
          .array(
            z.object({
              email: z.string().describe('Sender email address'),
              name: z.string().optional().describe('Sender display name'),
            })
          )
          .optional()
          .describe('Full replacement emailSenders list for the space'),
        extraData: z
          .object({
            allowlistedPhrases: z
              .union([z.array(z.string()), z.literal('__DELETE__')])
              .optional()
              .describe('Phrases for emails to INCLUDE. Pass [] to clear, "__DELETE__" to remove field.'),
            blocklistedPhrases: z
              .union([z.array(z.string()), z.literal('__DELETE__')])
              .optional()
              .describe('Phrases for emails to EXCLUDE. Pass [] to clear, "__DELETE__" to remove field.'),
            allowThreshold: z
              .number()
              .min(0)
              .max(1)
              .optional()
              .describe('Min similarity score for allowlist matching (0.0–1.0)'),
            blockThreshold: z
              .number()
              .min(0)
              .max(1)
              .optional()
              .describe('Min similarity score for blocklist matching (0.0–1.0)'),
            messageScores: z
              .union([z.array(z.string()), z.literal('__DELETE__')])
              .optional()
              .describe('Pass "__DELETE__" to force a full recompute of message scores'),
            messageScoresUpdatedAt: z
              .union([z.string(), z.literal('__DELETE__')])
              .optional()
              .describe('Pass "__DELETE__" alongside messageScores "__DELETE__" to trigger recompute'),
          })
          .optional(),
      })
      .describe('Fields to update — only provided fields are changed'),
  }),
  requireApproval: true,
  outputSchema: z.object({
    success: z.boolean(),
    space: z.any().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ spaceId, updateObj }, context) => {
    const token = getToken(context);
    const accountId = getAccountId(context);
    if (!accountId) throw new Error('accountId is required for editSpace');

    const response = await yaiPost<any>(token, '/yai/autopilot/editSpace', {
      accountId,
      spaceId,
      updateObj,
    });

    return {
      success: response.success ?? true,
      space: response.space,
      message: response.message,
    };
  },
});
