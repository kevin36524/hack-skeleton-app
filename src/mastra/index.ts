import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { gmailSearchAgent } from './agents/gmail-search-agent';

export const mastra = new Mastra({
  agents: {
    gmailSearchAgent,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
