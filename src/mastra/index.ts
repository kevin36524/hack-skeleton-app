import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { calendarExtractorAgent } from './agents/calendar-extractor';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    calendarExtractorAgent,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
