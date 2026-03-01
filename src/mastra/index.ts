import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { crosswordAgent } from './agents/crossword-agent';

export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: { 
    crosswordAgent,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
