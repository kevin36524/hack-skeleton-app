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
import { PostgresStore } from '@mastra/pg';
import { mailTriageAgent } from './agents/mail-triage';

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  throw new Error(
    'SUPABASE_DB_URL environment variable is required. ' +
    'Add it to your .env file with the Postgres connection string from Supabase.'
  );
}

export const mastra = new Mastra({
  agents: { mailTriageAgent },
  storage: new PostgresStore({
    id: 'mastra-storage',
    connectionString,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
