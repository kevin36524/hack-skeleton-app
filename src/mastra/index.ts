import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';

import { jokeAgent } from './agents';

export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: { jokeAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
