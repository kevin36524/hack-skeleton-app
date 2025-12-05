import { PinoLogger } from '@mastra/loggers';
import { Mastra } from '@mastra/core/mastra';
import { calendarEventExtractor } from './agents/calendar-event-extractor';


export const mastra = new Mastra({
  observability: {
    default: { enabled: true }
  },
  agents: {
    calendarEventExtractor,
  },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
