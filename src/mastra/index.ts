import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { gmailSearchAgent } from './agents/gmail-search-agent';
import { userProfileAgent } from './agents/user-profile-agent';

export const mastra = new Mastra({
  agents: {
    gmailSearchAgent,
    userProfileAgent,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
