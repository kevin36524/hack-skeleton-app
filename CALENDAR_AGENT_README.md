# Calendar Event Extractor Agent

A Mastra AI agent that extracts calendar events from images using Google's Gemini vision model.

## Features

- **Multi-format Support**: Handles various calendar formats including:
  - Digital calendar screenshots (Google Calendar, Outlook, Apple Calendar, etc.)
  - Photos of paper calendars
  - Meeting invitations
  - Event flyers and posters
  - Schedule tables and timetables

- **Comprehensive Extraction**: Extracts the following event details:
  - Event title/name
  - Date (ISO format: YYYY-MM-DD)
  - Start time (24-hour format: HH:MM)
  - End time (24-hour format: HH:MM)
  - Location
  - Description/notes
  - Attendees/participants

- **Structured Output**: Returns events in JSON format for easy integration

## Agent Configuration

- **ID**: `calendar-event-extractor`
- **Model**: `google/gemini-2.5-flash-lite` (supports vision/image inputs)
- **Location**: `src/mastra/agents/calendar-event-extractor.ts`

## Usage

### Basic Usage

```typescript
import { mastra } from "./src/mastra";
import fs from "fs";

async function extractEvents(imagePath: string) {
  // Get the agent
  const agent = mastra.getAgent("calendarEventExtractor");

  // Read and encode image
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  // Generate response
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

  return JSON.parse(response.text);
}

// Use it
const events = await extractEvents("./calendar-screenshot.png");
console.log(events);
```

### Output Format

```json
{
  "events": [
    {
      "title": "Team Meeting",
      "date": "2024-12-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "location": "Conference Room A",
      "description": "Quarterly review meeting",
      "attendees": ["John Doe", "Jane Smith"]
    },
    {
      "title": "Lunch with Client",
      "date": "2024-12-15",
      "startTime": "12:30",
      "endTime": "13:30",
      "location": "Downtown Cafe",
      "description": null,
      "attendees": null
    }
  ]
}
```

### API Route Example (Next.js)

```typescript
// app/api/extract-calendar/route.ts
import { mastra } from "@/src/mastra";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type;

    // Get agent and process
    const agent = mastra.getAgent("calendarEventExtractor");
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

    const events = JSON.parse(response.text);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error extracting calendar events:", error);
    return NextResponse.json(
      { error: "Failed to extract calendar events" },
      { status: 500 }
    );
  }
}
```

### Frontend Example (React)

```typescript
// components/CalendarExtractor.tsx
"use client";

import { useState } from "react";

export default function CalendarExtractor() {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/extract-calendar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={loading}
      />
      {loading && <p>Extracting events...</p>}
      {events && (
        <pre>{JSON.stringify(events, null, 2)}</pre>
      )}
    </div>
  );
}
```

## Prerequisites

1. **Mastra Setup**: Ensure Mastra is properly configured in your project
2. **Google API Key**: Set `GOOGLE_GENERATIVE_AI_API_KEY` in your `.env` file
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

## Testing

Run the test script to verify the agent is working:

```bash
npx tsx test-calendar-agent.ts
```

Expected output:
```
✓ Agent created successfully!
  ID: calendar-event-extractor
  Name: Calendar Event Extractor
  Model: google/gemini-2.5-flash-lite
```

## Use Cases

1. **Personal Calendar Management**: Upload calendar screenshots to digitize events
2. **Event Planning**: Extract events from flyers or invitations
3. **Meeting Coordination**: Process shared calendar images from colleagues
4. **Schedule Integration**: Convert physical calendars to digital format
5. **Time Tracking**: Extract work schedules from screenshots

## Tips for Best Results

- Use clear, high-resolution images
- Ensure text in the image is readable
- For paper calendars, take photos with good lighting
- Include context if dates/years are ambiguous
- The agent handles multiple events in a single image

## Troubleshooting

**No events extracted:**
- Check if the image contains visible calendar information
- Ensure image quality is sufficient for text recognition
- Verify the API key is set correctly

**Incorrect dates/times:**
- Provide additional context in the prompt if needed
- Check if the original image has clear date/time information

**API errors:**
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env`
- Check API quota and billing status
- Ensure image file size is within limits (typically < 4MB)

## Files Created

- `src/mastra/agents/calendar-event-extractor.ts` - Agent definition
- `src/mastra/index.ts` - Updated with agent registration
- `example-calendar-usage.ts` - Usage example
- `test-calendar-agent.ts` - Test script
- `CALENDAR_AGENT_README.md` - This documentation

## Next Steps

1. Test the agent with sample calendar images
2. Create an API route to expose the functionality
3. Build a frontend interface for image upload
4. Consider adding tools for calendar integration (Google Calendar, iCal export, etc.)
5. Implement caching for frequently processed images

## Related Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [Google Gemini Vision API](https://ai.google.dev/gemini-api/docs/vision)
- [Mastra Agent Guide](https://mastra.ai/docs/agents)
