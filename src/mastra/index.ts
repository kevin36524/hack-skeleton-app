import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
