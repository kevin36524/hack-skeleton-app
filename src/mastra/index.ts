import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { jokeTeller } from './agents/joke-teller';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: { jokeTeller },
  storage: new LibSQLStore({
    url: 'file:./mastra-memory.db',
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
