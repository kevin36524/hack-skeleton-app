import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { adCreator } from './agents/ad-creator';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: { adCreator },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
