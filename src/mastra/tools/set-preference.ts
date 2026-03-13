import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const ButtonAction = z.enum(['DELETE', 'ARCHIVE', 'STAR', 'READ', 'SKIP']);
const GroupBy = z.enum(['sender', 'delete_decos', 'open_decos']);

const DigestPrefsSchema = z.object({
  lastVisitTime: z.number(),
  groupby: GroupBy.optional(),
  buttons: z.array(ButtonAction).min(2).max(3),
  extraQueryParams: z.string().optional(),
});

export const setPreference = createTool({
  id: 'setPreference',
  description: 'Persists the updated digest preferences. Always call this after computing the new prefs.',
  inputSchema: z.object({
    prefs: DigestPrefsSchema,
  }),
  execute: async ({ prefs }) => {
    // No-op on the server — the FE intercepts this tool-result and writes to localStorage
    return { success: true, prefs };
  },
});
