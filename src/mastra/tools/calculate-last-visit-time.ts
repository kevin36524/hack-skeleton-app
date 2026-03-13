import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const calculateLastVisitTime = createTool({
  id: 'calculateLastVisitTime',
  description: 'Calculates a lastVisitTime epoch (seconds) by subtracting n hours, days, or weeks from now. Use this whenever the user wants to set or reset lastVisitTime to a relative time in the past.',
  inputSchema: z.object({
    n: z.number().describe('Number of units to go back'),
    unit: z.enum(['hours', 'days', 'weeks']).describe('Time unit'),
  }),
  outputSchema: z.object({
    lastVisitTime: z.number().describe('Epoch time in seconds'),
  }),
  execute: async ({ n, unit }) => {
    const UNIT_SECONDS: Record<string, number> = {
      hours: 3600,
      days: 86400,
      weeks: 604800,
    };
    const lastVisitTime = Math.floor(Date.now() / 1000) - n * UNIT_SECONDS[unit];
    return { lastVisitTime };
  },
});
