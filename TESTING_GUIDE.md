# Event Extractor - Testing Guide

## Quick Test Steps

### 1. Verify the Application is Running

The application should already be running in dev mode. You can verify by:

```bash
# Check if Next.js dev server is running
curl http://localhost:3000
```

If not running, start it with:
```bash
npm run dev
```

### 2. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the **Event Extractor** interface with:
- A title "Event Extractor"
- An upload section on the left
- A results section on the right
- Examples at the bottom

### 3. Test with Sample Images

To test the event extraction, you can use images like:

#### Option A: Create a Test Calendar Screenshot
1. Open Google Calendar or any calendar app
2. Add a test event with details (title, date, time, location)
3. Take a screenshot
4. Upload to the Event Extractor

#### Option B: Use an Event Poster
1. Find any event poster online (concert, conference, meetup)
2. Save the image
3. Upload to the Event Extractor

#### Option C: Create a Simple Test Image
Create a simple text image with event information:
```
Team Meeting

Date: January 15, 2024
Time: 2:00 PM - 3:00 PM
Location: Conference Room A
Type: Meeting
Description: Quarterly planning session
```

### 4. Upload and Extract

1. Click the upload area
2. Select your test image
3. Preview should appear
4. Click "Extract Events" button
5. Wait for processing (loading spinner will appear)
6. View extracted event information in formatted cards

### 5. Verify the Output

The extracted events should display with:
- ✅ Event title (if found)
- ✅ Date information (formatted)
- ✅ Time details (if available)
- ✅ Location (if visible in image)
- ✅ Event type (meeting, concert, etc.)
- ✅ Description (additional details)

### 6. Test Error Handling

Try these scenarios to verify error handling:

1. **No Image Selected**: Click "Extract Events" without uploading
   - Button should be disabled

2. **Invalid File Type**: Try uploading a non-image file
   - Browser should filter these out

3. **Large File**: Try uploading a very large image (>10MB)
   - Should still work, but may take longer

## API Testing (Optional)

### Test the API Endpoint Directly

You can test the API using curl:

```bash
# Create a test (replace with your actual image path)
curl -X POST http://localhost:3000/api/extract-events \
  -F "image=@/path/to/your/test-image.png"
```

Expected response:
```json
{
  "success": true,
  "extractedText": "Event 1:\n- Title: ...\n- Date: ...\n...",
  "metadata": {
    "filename": "test-image.png",
    "size": 12345,
    "type": "image/png"
  }
}
```

### Test with Postman or Thunder Client

1. Create a POST request to `http://localhost:3000/api/extract-events`
2. Set body type to `form-data`
3. Add a field named `image` with type `File`
4. Select your test image
5. Send request
6. Verify JSON response

## Troubleshooting Tests

### Issue: "Cannot find module '@/src/mastra'"
**Solution**:
- Verify `tsconfig.json` has proper path mappings
- Check that `/src/mastra/index.ts` exists
- Restart the dev server

### Issue: "Agent not found"
**Solution**:
- Verify the agent is registered in `/src/mastra/index.ts`
- Check that `eventExtractor` is exported from the agent file
- Restart dev server to pick up changes

### Issue: API returns 500 error
**Solution**:
- Check `.env` file has `GOOGLE_GENERATIVE_AI_API_KEY`
- Verify API key is valid and has quota remaining
- Check console logs for detailed error messages
- Ensure the image is a valid format

### Issue: No events extracted from clear image
**Solution**:
- The AI might not recognize the format
- Try a different image with clearer text
- Check that the image contains actual event information
- Review the raw extracted text in the console

### Issue: Events not parsing correctly
**Solution**:
- The agent might be returning a different format
- Check the `extractedText` in the response
- Adjust the `parseEvents` function in `event-extractor.tsx`
- Or update the agent instructions to output a specific format

## Expected Behavior

### ✅ Successful Flow
1. User uploads image → Preview shows
2. User clicks "Extract Events" → Loading spinner appears
3. API processes image → Agent analyzes with AI
4. Response returns → Events display in cards
5. Beautiful formatted output → User can read easily

### ✅ Edge Cases to Test
- Image with no events (should return "No events found")
- Image with multiple events (should parse all)
- Image with partial information (should extract what's available)
- Low quality image (should handle gracefully)
- Image with mixed content (should focus on events)

## Performance Expectations

- **Image Upload**: Instant (client-side preview)
- **API Processing**: 2-10 seconds (depends on image size and complexity)
- **UI Response**: Immediate update after API returns
- **Large Images**: May take up to 15-20 seconds

## Success Criteria

Your implementation is working correctly if:

1. ✅ UI loads without errors
2. ✅ Image upload and preview works
3. ✅ API endpoint responds (check Network tab)
4. ✅ Agent successfully analyzes images
5. ✅ Events are extracted and displayed
6. ✅ Error handling works for edge cases
7. ✅ UI is responsive on mobile and desktop

## Next Steps After Testing

Once testing is successful:

1. **Production Deployment**: Deploy to Vercel or your hosting platform
2. **Add Features**: Implement export to calendar, save events, etc.
3. **Improve Parsing**: Enhance the event parsing algorithm
4. **Add Analytics**: Track usage and success rates
5. **User Feedback**: Add a feedback mechanism for accuracy

---

**Note**: Since the application is already running in dev mode, it should automatically hot-reload when you make changes. Any edits to components or API routes will be reflected immediately without needing to restart the server.
