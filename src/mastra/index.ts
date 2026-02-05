import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { emailSummarizer } from './agents/email-summarizer';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: { 
    emailSummarizer,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
