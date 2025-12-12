import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { digestAgent } from './agents/digest-agent';
import { emailDigestWorkflow } from './workflows/email-digest-workflow';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: { digestAgent },
  workflows: { emailDigestWorkflow },
  storage: new LibSQLStore({
    url: 'file:./mastra-memory.db',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
