# Calendar Event Extractor App - Usage Guide

## Overview

A Next.js application that uses Mastra AI agents to extract calendar events from images. Simply upload or paste an image containing calendar information, and the AI will automatically extract all event details.

## Features

### 🖼️ Flexible Image Input
- **Upload**: Click to browse and select calendar images
- **Paste**: Press Ctrl+V (or Cmd+V on Mac) anywhere in the upload area to paste images directly from clipboard
- **Supported Formats**: JPG, PNG, and other common image formats

### 🤖 AI-Powered Extraction
- Powered by Google Gemini 2.5 Flash Lite with vision capabilities
- Extracts comprehensive event details:
  - Event title/name
  - Date (ISO format)
  - Start and end times
  - Location
  - Description
  - Attendees

### 📝 Custom Instructions
- Add specific instructions to guide the extraction
- Examples:
  - "Focus on events in December"
  - "Extract only meeting times"
  - "Include recurring events"
  - "Look for virtual meeting links"

### 📊 Beautiful Results Display
- View extracted events in a clean, organized format
- Copy all events as JSON with one click
- Responsive design works on desktop and mobile

## How to Use

### Step 1: Open the App
Navigate to `http://localhost:3000` (the app is already running in dev mode)

### Step 2: Add an Image
Choose one of these methods:
1. **Click to Upload**: Click anywhere in the upload area and select an image file
2. **Paste**: Copy an image to your clipboard and press Ctrl+V (Cmd+V on Mac) in the upload area
3. **Drag & Drop**: (Browser dependent) Drag an image file into the upload area

### Step 3: Add Instructions (Optional)
- Type any specific instructions in the text area
- This helps guide the AI for better extraction
- Examples:
  ```
  Please extract all meeting times and include Zoom links if visible
  ```
  ```
  Focus only on events happening in the next week
  ```

### Step 4: Extract Events
- Click the "Extract Calendar Events" button
- Wait a few seconds while the AI processes the image
- View the extracted events on the right side

### Step 5: Use the Results
- Review the extracted events
- Click "Copy JSON" to copy all events to clipboard
- Use the JSON data in your own applications or calendars

## Image Types Supported

The AI can extract events from various image types:

### ✅ Digital Calendar Screenshots
- Google Calendar
- Outlook Calendar
- Apple Calendar
- Microsoft Teams meetings
- Zoom invitations
- Any digital calendar app

### ✅ Physical Calendars
- Photos of paper calendars
- Wall calendars
- Desk calendars
- Planner pages

### ✅ Meeting Invitations
- Email screenshots with meeting details
- Meeting invite graphics
- Conference schedules

### ✅ Event Flyers
- Conference schedules
- Event posters
- Workshop timetables
- Class schedules

## Tips for Best Results

1. **Image Quality**: Use clear, high-resolution images
2. **Readable Text**: Ensure text in the image is legible
3. **Good Lighting**: For photos of physical calendars, use good lighting
4. **Complete Information**: Include dates, times, and other relevant details in the frame
5. **Custom Instructions**: Use the instructions field for specific needs

## Example Workflows

### Workflow 1: Digitize a Paper Calendar
1. Take a photo of your paper calendar page
2. Upload the photo
3. Add instruction: "Extract all events for this month"
4. Extract and copy the JSON
5. Import into your digital calendar app

### Workflow 2: Share Meeting Times
1. Screenshot your digital calendar
2. Paste the screenshot (Ctrl+V)
3. Add instruction: "Extract only meeting titles and times"
4. Share the extracted JSON with teammates

### Workflow 3: Event Planning
1. Upload an event flyer or schedule
2. Add instruction: "Include all session times and locations"
3. Get structured event data
4. Use for planning or coordination

## API Endpoint

The app exposes an API endpoint for programmatic access:

**Endpoint**: `POST /api/extract-events`

**Request**:
- Content-Type: `multipart/form-data`
- Fields:
  - `image`: Image file
  - `instructions` (optional): Custom extraction instructions

**Response**:
```json
{
  "success": true,
  "events": [
    {
      "title": "Team Meeting",
      "date": "2024-12-15",
      "startTime": "10:00",
      "endTime": "11:00",
      "location": "Conference Room A",
      "description": "Quarterly review",
      "attendees": ["John", "Jane"]
    }
  ]
}
```

## Troubleshooting

### No Events Found
- **Check Image Quality**: Make sure the image is clear and text is readable
- **Verify Calendar Content**: Ensure the image actually contains calendar information
- **Try Instructions**: Add specific instructions to guide the AI

### Incorrect Dates/Times
- **Check Original Image**: Verify the dates are visible in the image
- **Add Context**: Use instructions to clarify ambiguous dates
- **Check Format**: The AI returns dates in ISO format (YYYY-MM-DD)

### API Errors
- **Check API Key**: Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env`
- **Check Image Size**: Very large images may cause issues (keep under 4MB)
- **Check Console**: Look for error messages in the browser console

### Application Not Starting
- **Port Conflict**: Make sure port 3000 is available
- **Dependencies**: Run `npm install` if you see module errors
- **Environment**: Check that `.env` file exists with required keys

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **AI Agent**: Mastra with Google Gemini 2.5 Flash Lite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Files Structure

```
/app
  /api
    /extract-events
      route.ts           # API endpoint for event extraction
  layout.tsx            # App layout with metadata
  page.tsx              # Main page component

/components
  calendar-event-extractor.tsx  # Main UI component

/src
  /mastra
    /agents
      calendar-event-extractor.ts  # Mastra AI agent
    index.ts            # Mastra configuration
```

## Development

Since the app is already running in dev mode:
- Changes to components will hot-reload automatically
- API route changes require a manual refresh
- Agent changes will be picked up on next API call

## Next Steps

Consider enhancing the app with:
- Export to .ics (iCalendar) format
- Direct integration with Google Calendar/Outlook
- Batch processing of multiple images
- Calendar event editing before export
- Recurring event detection and handling
- Time zone conversion
- Event reminders setup

## Support

For issues or questions:
- Check the Mastra documentation: https://mastra.ai/docs
- Review the agent README: `CALENDAR_AGENT_README.md`
- Check browser console for errors
- Verify environment variables are set correctly

---

Enjoy extracting calendar events with AI! 🎉
