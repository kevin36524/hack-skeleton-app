import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { phraseGenerator } from './agents/phrase-generator';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    phraseGenerator,
  },
  storage: new LibSQLStore({
    url: 'file:./mastra-memory.db',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
