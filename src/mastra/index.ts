import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { gmailSearchAgent } from './agents/gmail-search-agent';
import { emailClassifierAgent } from './agents/email-classifier-agent';
import { profileGeneratorAgent } from './agents/profile-generator-agent';
import { buildUserProfileWorkflow } from './workflows/build-user-profile';

export const mastra = new Mastra({
  agents: {
    gmailSearchAgent,
    emailClassifierAgent,
    profileGeneratorAgent,
  },
  workflows: {
    buildUserProfileWorkflow,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
