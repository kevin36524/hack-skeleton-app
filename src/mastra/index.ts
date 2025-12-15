import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { podcastSummarizer } from './agents/podcast-summarizer';
import { textToVoiceAgent } from './agents/text-to-voice-agent';
import { podcastEmailSummaryWorkflow } from './workflows/podcast-email-summary';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    podcastSummarizer,
    textToVoiceAgent,
  },
  workflows: {
    podcastEmailSummaryWorkflow,
  },
  storage: new LibSQLStore({
    url: 'file:./mastra-memory.db',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
