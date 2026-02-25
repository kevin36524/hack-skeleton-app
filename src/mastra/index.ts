import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { gmailSearchAgent } from './agents/gmail-search-agent';
import { profileGeneratorAgent } from './agents/profile-generator-agent';
import { emailSummarizerAgent } from './agents/email-summarizer-agent';
import { buildUserProfileWorkflow } from './workflows/build-user-profile';
import { generateSummaryWorkflow } from './workflows/generate-summary';

export const mastra = new Mastra({
  agents: {
    gmailSearchAgent,
    profileGeneratorAgent,
    emailSummarizerAgent,
  },
  workflows: {
    buildUserProfileWorkflow,
    generateSummaryWorkflow,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
