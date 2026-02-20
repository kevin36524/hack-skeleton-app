import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { gmailSearchAgent } from './agents/gmail-search-agent';
import { profileGeneratorAgent } from './agents/profile-generator-agent';
import { emailSummarizerAgent } from './agents/email-summarizer-agent';
import { buildUserProfileWorkflow } from './workflows/build-user-profile';
import { summarizeInboxWorkflow } from './workflows/summarize-inbox';

export const mastra = new Mastra({
  agents: {
    gmailSearchAgent,
    profileGeneratorAgent,
    emailSummarizerAgent,
  },
  workflows: {
    buildUserProfileWorkflow,
    summarizeInboxWorkflow,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
