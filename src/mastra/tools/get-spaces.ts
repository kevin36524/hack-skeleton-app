import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getToken, getAccountId } from '../helpers/get-token';
import { yaiGet } from '../helpers/yai-server-api';

const SPACES_CACHE_KEY = 'cachedSpaces';

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
      filteredMessageIds: z.array(z.string()).optional(),
      showSemanticMessages: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Get accepted and suggested spaces for the user.
 * Results are cached in requestContext to avoid repeated API calls.
 * If spaceId is provided (or available as referenceId in context), returns that space as currentSpace.
 */
export const getSpaces = createTool({
  id: 'get-spaces',
  description:
    'Get all accepted and suggested spaces for the user. Returns space IDs, names, keywords, emailSenders, and semantic matching config. Results are cached in context — subsequent calls return cached data. If spaceId is provided (or the session has a referenceId), also returns that specific space as currentSpace with its full keywords and emailSenders.',
  inputSchema: z.object({
    spaceId: z
      .string()
      .optional()
      .describe(
        'Optional: ID of a specific space to return as currentSpace. If omitted, uses referenceId from context.'
      ),
  }),
  outputSchema: z.object({
    acceptedSpaces: z.array(spaceSchema),
    suggestedSpaces: z.array(spaceSchema),
    currentSpace: z.any().nullable().optional().describe('The specific space matching spaceId or referenceId'),
  }),
  execute: async ({ spaceId }, context) => {
    const token = getToken(context);
    const accountId = getAccountId(context);
    if (!accountId) throw new Error('accountId is required for getSpaces');

    // Resolve effective spaceId: explicit input takes precedence, then context referenceId
    const effectiveSpaceId =
      spaceId || (context?.requestContext?.get('referenceId') as string | undefined) || null;

    // Return from cache if available
    let spaces = context?.requestContext?.get(SPACES_CACHE_KEY) as
      | { acceptedSpaces: any[]; suggestedSpaces: any[] }
      | undefined;

    if (!spaces) {
      const response = await yaiGet<any>(
        token,
        `/yai/autopilot/getSpaces?acctId=${accountId}&appVer=7.80.0_74539`
      );

      spaces = {
        acceptedSpaces: Array.isArray(response?.acceptedSpaces) ? response.acceptedSpaces : [],
        suggestedSpaces: Array.isArray(response?.suggestedSpaces) ? response.suggestedSpaces : [],
      };

      // Cache for subsequent tool calls within this request
      context?.requestContext?.set(SPACES_CACHE_KEY, spaces);
    }

    // Find the specific space if we have an ID
    let currentSpace: any = null;
    if (effectiveSpaceId) {
      currentSpace =
        spaces.acceptedSpaces.find((s: any) => s.id === effectiveSpaceId) ||
        spaces.suggestedSpaces.find((s: any) => s.id === effectiveSpaceId) ||
        null;
    }

    return {
      acceptedSpaces: spaces.acceptedSpaces,
      suggestedSpaces: spaces.suggestedSpaces,
      currentSpace,
    };
  },
});
