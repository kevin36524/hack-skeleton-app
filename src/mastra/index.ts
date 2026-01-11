import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { codemaster } from './agents/codemaster';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    codemaster
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
