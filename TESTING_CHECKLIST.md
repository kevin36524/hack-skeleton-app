# Testing Checklist for Spaces Debug Changes

## Setup
1. Start the development server: `npm run dev`
2. Log in and navigate to a space
3. Click the "Debug" button (Settings icon) to open the Spaces Debug dialog

## Test Cases

### 1. Generate Allowlisted Phrases
- [ ] Click "Generate Allowlisted Phrases" button
- [ ] Verify loading state appears
- [ ] Verify 8-12 phrases are generated
- [ ] Verify phrases are relevant to the space context
- [ ] Verify success message appears

### 2. Edit Allowlisted Phrases
- [ ] Click "Add" button to add a new phrase
- [ ] Enter a custom phrase
- [ ] Modify an existing phrase
- [ ] Delete a phrase using the X button
- [ ] Verify all changes are reflected in the UI

### 3. Add Blocklisted Phrases
- [ ] Click "Add" button in the Blocklisted Phrases section
- [ ] Enter a custom blocklisted phrase
- [ ] Delete a blocklisted phrase
- [ ] Verify changes are saved

### 4. User Feedback - Add to Allowlist
- [ ] Enter feedback: "add flight cancellation"
- [ ] Click "Add to Allowlist" button
- [ ] Verify new phrases are generated and added to allowlist
- [ ] Verify phrases are related to flight cancellation
- [ ] Verify the feedback input is cleared

### 5. User Feedback - Add to Blocklist
- [ ] Enter feedback: "remove deals"
- [ ] Click "Add to Blocklist" button
- [ ] Verify new phrases are generated and added to blocklist
- [ ] Verify phrases are related to deals/promotions
- [ ] Verify the feedback input is cleared

### 6. Find Similar Emails
- [ ] Click "Find Similar Emails" button
- [ ] Verify loading state appears with status messages
- [ ] Verify embeddings are generated (check console logs: "[FIND-SIMILAR]")
- [ ] Verify matching message count is displayed
- [ ] Verify message IDs are returned
- [ ] Verify "Show semantic messages only" toggle appears

### 7. Find Similar Emails with Blocklist
- [ ] Generate allowlisted phrases
- [ ] Add some blocklisted phrases (manually or via feedback)
- [ ] Click "Find Similar Emails"
- [ ] Verify blocklisted phrases filter out unwanted matches
- [ ] Verify final count is less than or equal to allowlist-only count

### 8. Show Semantic Messages Toggle
- [ ] After finding similar emails, toggle "Show semantic messages only"
- [ ] Verify the toggle state is saved
- [ ] Verify the message IDs are displayed in collapsible section

### 9. Save Changes
- [ ] Make changes to phrases
- [ ] Click "Save Changes" button
- [ ] Verify dialog closes
- [ ] Reopen the dialog
- [ ] Verify all changes persisted

### 10. Cloud Run Compatibility
- [ ] Check that no files are created in `/data/embeddings/` after finding similar emails
- [ ] Verify console logs show embeddings are generated in memory
- [ ] Verify the process completes without file I/O errors

## Expected Console Logs

When clicking "Find Similar Emails", you should see:
```
[FIND-SIMILAR] Provider: openai (or qwen3)
[FIND-SIMILAR] Expected dimension: 1536 (or 896)
[FIND-SIMILAR] Finding similar emails for space: <space name>
[FIND-SIMILAR] Allowlisted phrases: <count>
[FIND-SIMILAR] Blocklisted phrases: <count>
[FIND-SIMILAR] Step 1: Fetching messages...
[FIND-SIMILAR] Fetched <count> messages
[FIND-SIMILAR] Step 2: Preparing texts...
[FIND-SIMILAR] Step 3: Generating embeddings in memory...
[FIND-SIMILAR] Generated <count> embeddings
[FIND-SIMILAR] Model: <model name>
[FIND-SIMILAR] Step 4: Creating Faiss index in memory...
[FIND-SIMILAR] Added <count> vectors to index
[FIND-SIMILAR] Step 5: Generating phrase embeddings...
[FIND-SIMILAR] Generated <count> allowlist phrase embeddings
[FIND-SIMILAR] Step 6: Finding similar messages...
[FIND-SIMILAR] Found <count> allowlisted messages
[FIND-SIMILAR] Step 7: Processing blocklisted phrases...
[FIND-SIMILAR] Generated <count> blocklist phrase embeddings
[FIND-SIMILAR] Found <count> blocklisted messages
[FIND-SIMILAR] After filtering: <count> messages remain
[FIND-SIMILAR] Final result: <count> matching messages
```

## Error Cases to Test

### 1. Find Similar Emails Without Phrases
- [ ] Clear all allowlisted phrases
- [ ] Click "Find Similar Emails"
- [ ] Verify error message: "Please generate allowlisted phrases first"

### 2. Empty Feedback Input
- [ ] Leave feedback input empty
- [ ] Verify "Add to Allowlist" and "Add to Blocklist" buttons are disabled

### 3. API Errors
- [ ] Test with invalid authentication (if possible)
- [ ] Verify error messages are displayed properly
- [ ] Verify loading states reset after errors

## Performance Checks

- [ ] Verify "Find Similar Emails" completes in reasonable time (<30 seconds)
- [ ] Verify phrase generation is fast (<5 seconds)
- [ ] Verify feedback-based phrase generation is fast (<5 seconds)
- [ ] Verify UI remains responsive during operations

## Notes
- All embeddings should be generated in memory (no files created)
- Phrases can be edited manually at any time
- User feedback generates 3-6 phrases per request
- Blocklisted phrases filter out matches from allowlisted results
- Message IDs are stored in `space.extraData.filteredMessageIds`
