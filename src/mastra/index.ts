import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { phraseGenerator } from './agents/phrase-generator';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    phraseGenerator,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
