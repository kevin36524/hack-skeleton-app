import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken, getAccountId } from '../helpers/get-token';
import { yaiGet } from '../helpers/yai-server-api';

const emailSenderSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
});

const spaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  status: z.string().optional(),
  justification: z.string().optional(),
  relevanceScore: z.number().optional(),
  keywords: z.array(z.string()).optional().default([]),
  emailSenders: z.array(emailSenderSchema).optional().default([]),
  extraData: z
    .object({
      allowlistedPhrases: z.array(z.string()).optional(),
      blocklistedPhrases: z.array(z.string()).optional(),
      allowThreshold: z.number().optional(),
      blockThreshold: z.number().optional(),
      messageScores: z.array(z.string()).optional(),
      messageScoresUpdatedAt: z.string().optional(),
      showSemanticMessages: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Get accepted and suggested spaces for the user
 */
export const getSpaces = createTool({
  id: 'get-spaces',
  description:
    'Get all accepted and suggested spaces for the user. Returns space IDs, names, keywords, emailSenders, and semantic matching config (allowlistedPhrases, blocklistedPhrases, thresholds, messageScores).',
  inputSchema: z.object({}),
  outputSchema: z.object({
    acceptedSpaces: z.array(spaceSchema),
    suggestedSpaces: z.array(spaceSchema),
  }),
  execute: async (_input, context) => {
    const token = getToken(context);
    const accountId = getAccountId(context);
    if (!accountId) throw new Error('accountId is required for getSpaces');

    const response = await yaiGet<any>(
      token,
      `/yai/autopilot/getSpaces?acctId=${accountId}&appVer=7.80.0_74539`
    );

    return {
      acceptedSpaces: response.acceptedSpaces || [],
      suggestedSpaces: response.suggestedSpaces || [],
    };
  },
});
