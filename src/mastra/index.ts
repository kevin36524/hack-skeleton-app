import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { emailSummarizer } from './agents/email-summarizer';
import { contentWorkflow, emailSummarizationWorkflow } from './workflows/email-summarization';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    emailSummarizer,
  },
  workflows: {
    contentWorkflow,
    emailSummarizationWorkflow,
  },
  storage: new LibSQLStore({
    url: 'file:./mastra-memory.db',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
