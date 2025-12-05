# Calendar Event Extractor

An AI-powered application that extracts calendar event details from images using Mastra and Google Gemini.

## Features

- 📸 **Image Upload**: Upload screenshots, photos, flyers, or invitations containing event information
- 🤖 **AI-Powered Extraction**: Uses Google Gemini 2.5 Flash Lite for vision and text extraction
- 📅 **Structured Data**: Extracts event details in a standardized JSON format
- 💾 **Export Capability**: Download extracted data as JSON
- 🎨 **Modern UI**: Clean, responsive interface with dark mode support

## Architecture

### Backend (Mastra Agent)

**Location**: `src/mastra/agents/calendar-event-extractor.ts`

The Mastra agent is configured to:
- Analyze images containing calendar information
- Extract structured event data including:
  - Title, Date, Time (start/end)
  - Location, Description
  - Attendees, Recurrence patterns
  - Additional notes
- Return data in standardized JSON format

### API Route

**Location**: `app/api/extract-calendar-event/route.ts`

The API endpoint:
- Accepts image uploads via POST request
- Converts images to base64 format
- Invokes the Mastra calendar extractor agent
- Returns extracted event data as JSON

### Frontend Component

**Location**: `app/components/CalendarEventExtractor.tsx`

The React component provides:
- Image upload interface
- Image preview
- Loading states
- Extracted data display with formatted fields
- JSON export functionality
- Error handling

## How to Use

1. **Start the Application** (already running in dev mode)
   ```bash
   npm run dev
   ```

2. **Access the Application**
   Open your browser to `http://localhost:3000`

3. **Upload an Image**
   - Click "Upload Image" and select an image file
   - Supported formats: JPG, PNG, GIF, WebP, etc.
   - Images can be screenshots, photos of calendars, event flyers, invitations, etc.

4. **Extract Event Details**
   - Click "Extract Event Details" button
   - Wait for the AI to process the image (typically 2-5 seconds)
   - View the extracted information

5. **Export Data** (optional)
   - Click "Download as JSON" to save the extracted data

## Example Use Cases

- 📧 **Email Screenshots**: Extract events from email invitations
- 📱 **Calendar Apps**: Extract from screenshots of other calendar apps
- 🎫 **Event Flyers**: Pull event details from promotional images
- 📋 **Meeting Notes**: Extract from photos of whiteboards or notes
- 🎟️ **Tickets**: Get event info from ticket images

## API Usage

### Request

```bash
curl -X POST http://localhost:3000/api/extract-calendar-event \
  -F "image=@/path/to/event-image.jpg"
```

### Response

```json
{
  "success": true,
  "data": {
    "title": "Team Meeting",
    "date": "2024-12-15",
    "startTime": "14:00",
    "endTime": "15:00",
    "location": "Conference Room A",
    "description": "Quarterly planning session",
    "attendees": ["John Doe", "Jane Smith"],
    "isRecurring": false,
    "recurrencePattern": null,
    "additionalNotes": null
  },
  "rawResponse": "..."
}
```

## Technical Details

### Models Used
- **Vision Model**: Google Gemini 2.5 Flash Lite
- **Purpose**: Image analysis and text extraction
- **Advantages**: Fast, cost-effective, excellent vision capabilities

### Environment Variables Required

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### File Structure

```
├── src/mastra/
│   ├── agents/
│   │   └── calendar-event-extractor.ts    # Mastra agent definition
│   └── index.ts                           # Mastra configuration
├── app/
│   ├── api/
│   │   └── extract-calendar-event/
│   │       └── route.ts                   # API endpoint
│   ├── components/
│   │   └── CalendarEventExtractor.tsx     # Frontend component
│   └── page.tsx                           # Main page
```

## Extending the Application

### Add More Fields
Edit `src/mastra/agents/calendar-event-extractor.ts` to include additional fields in the extraction instructions.

### Customize UI
Modify `app/components/CalendarEventExtractor.tsx` to change styling or add features.

### Process Multiple Events
The agent supports extracting multiple events from a single image. Modify the response handling to display an array of events.

### Add Calendar Integration
Extend the application to directly create events in Google Calendar, Outlook, or other calendar services.

## Troubleshooting

### Image Not Processing
- Check that GOOGLE_GENERATIVE_AI_API_KEY is set in .env
- Ensure image file size is reasonable (< 10MB recommended)
- Verify image format is supported

### Extraction Accuracy
- Use clear, high-resolution images
- Ensure text is readable
- Try different image formats if results are poor

### API Errors
- Check console logs for detailed error messages
- Verify Mastra agent is properly registered
- Ensure API route is accessible

## Performance

- **Average extraction time**: 2-5 seconds
- **Max image size**: 10MB (recommended)
- **Concurrent requests**: Handled by Next.js API routes
- **Cost**: Minimal (Gemini Flash Lite is cost-effective)

## Future Enhancements

- [ ] Batch processing multiple images
- [ ] Calendar export formats (.ics, .csv)
- [ ] Direct calendar integration (Google, Outlook)
- [ ] Image preprocessing for better accuracy
- [ ] Multi-language support
- [ ] Historical event tracking
- [ ] OCR quality indicators

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set
3. Ensure the development server is running
4. Review the Mastra agent configuration

## License

This application is part of your Mastra project.
