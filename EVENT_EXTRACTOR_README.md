# Event Extractor

An AI-powered application that extracts event information from images using the Mastra framework and Google's Gemini AI.

## Features

- 📸 Upload images containing event information
- 🤖 AI-powered event extraction using Mastra agents
- 📅 Structured event data extraction (title, date, time, location, etc.)
- 🎨 Beautiful, responsive UI with dark mode support
- ⚡ Real-time processing and display

## How It Works

### 1. Backend (Mastra Agent)

The application uses a custom Mastra agent (`eventExtractor`) that:
- Analyzes images using Google's Gemini 2.5 Flash Lite model
- Identifies event information from various sources (calendars, tickets, posters)
- Extracts structured data (title, date, time, location, type, description)
- Returns formatted event details

**Agent Location:** `/src/mastra/agents/event-extractor.ts`

### 2. API Route

**Endpoint:** `POST /api/extract-events`

The API route:
- Accepts image uploads via FormData
- Converts images to base64 for AI processing
- Invokes the Mastra event extractor agent
- Returns extracted event information as JSON

**Route Location:** `/app/api/extract-events/route.ts`

### 3. Frontend UI

A React component that provides:
- Drag-and-drop image upload
- Image preview
- Loading states during extraction
- Beautifully formatted event cards
- Responsive design for mobile and desktop

**Component Location:** `/components/event-extractor.tsx`

## Usage

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the application** in your browser:
   ```
   http://localhost:3000
   ```

3. **Upload an image** containing event information:
   - Click the upload area
   - Select an image (PNG, JPG, JPEG)
   - Click "Extract Events"

4. **View extracted events** in the results panel with:
   - Event title
   - Date and time
   - Location
   - Event type
   - Description
   - Additional information

## Supported Image Types

The event extractor works with various types of images:

- **Calendar Screenshots**: Google Calendar, Outlook, Apple Calendar, etc.
- **Event Tickets**: Concert tickets, sports events, theater shows
- **Posters & Flyers**: Event posters, promotional materials
- **Email Invitations**: Screenshots of event invitations
- **Meeting Invites**: Meeting invitation screenshots
- **Schedule Boards**: Timetables or schedule displays

## API Response Format

```json
{
  "success": true,
  "extractedText": "Event 1:\n- Title: Tech Conference\n- Date: 2024-03-15\n- Time: 09:00 AM\n...",
  "metadata": {
    "filename": "event.png",
    "size": 245678,
    "type": "image/png"
  }
}
```

## Configuration

### Environment Variables

Make sure you have the required API key in your `.env` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Agent Configuration

The agent is configured in `/src/mastra/index.ts` and uses:
- **Model:** `google/gemini-2.5-flash-lite`
- **Storage:** LibSQL (local SQLite database)
- **Observability:** Enabled by default

## Development

### File Structure

```
/app
  /api
    /extract-events
      route.ts          # API endpoint for event extraction
  layout.tsx            # Root layout with metadata
  page.tsx              # Main page using EventExtractor component

/components
  event-extractor.tsx   # Main UI component

/src
  /mastra
    /agents
      event-extractor.ts    # Mastra AI agent
    index.ts               # Mastra configuration
```

### Customization

To customize the event extraction behavior, edit the agent instructions in:
`/src/mastra/agents/event-extractor.ts`

You can modify:
- Output format
- Extraction rules
- Event parsing logic
- Additional data fields

## Troubleshooting

### Issue: Events not being extracted
- **Solution**: Ensure the image is clear and contains visible text
- Check that the API key is properly configured
- Verify the image file size is under 10MB

### Issue: API errors
- **Solution**: Check the browser console for detailed error messages
- Ensure the Mastra agent is properly registered
- Verify the development server is running

### Issue: Formatting problems
- **Solution**: The UI parses structured output from the agent
- Ensure the agent returns events in the expected format
- Check the `parseEvents` function in the component

## Future Enhancements

Possible improvements:
- [ ] Add support for multiple image uploads
- [ ] Export events to calendar formats (ICS, Google Calendar)
- [ ] Save extracted events to a database
- [ ] Add event editing capabilities
- [ ] Support for recurring events
- [ ] Integration with calendar applications

## Technologies Used

- **Next.js 16** - React framework
- **Mastra** - AI agent framework
- **Google Gemini** - AI model for image analysis
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TypeScript** - Type safety
