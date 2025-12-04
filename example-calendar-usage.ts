/**
 * Example: How to use the Calendar Event Extractor Agent
 *
 * This agent can extract calendar events from images including:
 * - Screenshots of digital calendars
 * - Photos of paper calendars
 * - Meeting invitations
 * - Event flyers
 */

import { mastra } from "./src/mastra";
import fs from "fs";

async function extractCalendarEvents(imagePath: string) {
  // Get the calendar event extractor agent
  const agent = mastra.getAgent("calendarEventExtractor");

  // Read the image file and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  // Send the image to the agent for analysis
  const response = await agent.generate([
    {
      role: "user",
      content: [
        {
          type: "image",
          image: `data:${mimeType};base64,${base64Image}`,
        },
        {
          type: "text",
          text: "Please extract all calendar events from this image.",
        },
      ],
    },
  ]);

  return response.text;
}

// Example usage:
// const events = await extractCalendarEvents("/path/to/calendar-screenshot.png");
// console.log(events);

export { extractCalendarEvents };
