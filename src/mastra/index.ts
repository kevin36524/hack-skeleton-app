// Load environment variables (for non-Next.js contexts like test scripts)
// Next.js loads .env automatically, but tsx/node scripts need explicit loading
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or already loaded, continue
  }
}

import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { createStorage } from './storage';
import { mailTriageAgent } from './agents/mail-triage';

export const mastra = new Mastra({
  agents: { mailTriageAgent },
  storage: createStorage('mastra-storage'),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
