import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { InMemoryStore } from '@mastra/core/storage';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {  },
  storage: new InMemoryStore(),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
