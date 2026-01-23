# Spaces Debug Changes - Summary

## Overview
Refactored the spaces debug functionality to support a new workflow that generates embeddings in memory (Cloud Run compatible) and provides user feedback-based phrase generation with allowlist and blocklist support.

## New Workflow

### Previous Flow:
1. Generate embeddings and save to files
2. Generate allowlisted phrases and find similar emails (requires embeddings to exist)

### New Flow:
1. **Generate Allowlisted Phrases** - AI generates phrases based on space context
2. **Edit Phrases** - User can manually add/remove/modify allowlisted phrases
3. **Add Blocklisted Phrases** - User can add phrases to exclude certain emails
4. **User Feedback** - User provides feedback (e.g., "remove deals" or "add flight cancellation") and AI generates relevant phrases
5. **Find Similar Emails** - Generates embeddings in memory, performs similarity search, returns matching message IDs

## Key Features

### 1. In-Memory Embeddings
- Embeddings are generated on-demand when "Find Similar Emails" is clicked
- No files are created or saved (Cloud Run compatible)
- Embeddings and Faiss index are created in memory only

### 2. Blocklist Support
- Users can create blocklisted phrases to exclude certain types of emails
- Blocklisted phrases are used to filter out unwanted matches
- Works alongside allowlisted phrases

### 3. User Feedback-Based Phrase Generation
- Users can describe what to include or exclude
- AI generates relevant phrases based on feedback
- Examples:
  - "remove deals" → generates deal-related phrases for blocklist
  - "add flight cancellation" → generates cancellation phrases for allowlist

### 4. Editable Phrases
- Both allowlisted and blocklisted phrases can be manually edited
- Add, remove, or modify phrases directly in the UI
- No need to regenerate from scratch

## File Changes

### New Files Created:
1. **src/mastra/agents/feedback-phrase-generator.ts**
   - New Mastra agent for generating phrases based on user feedback
   - Takes user feedback and generates 3-6 relevant phrases
   - Supports both allowlist and blocklist generation

2. **app/api/embeddings/generate-feedback-phrases/route.ts**
   - API endpoint for user feedback-based phrase generation
   - Accepts: space context, user feedback, phrase type (allowlist/blocklist)
   - Returns: generated phrases

3. **app/api/embeddings/find-similar/route.ts**
   - API endpoint for finding similar emails with in-memory embeddings
   - Fetches messages from Yahoo Mail API
   - Generates embeddings in memory (not saved)
   - Creates Faiss index in memory
   - Performs similarity search using allowlisted phrases
   - Filters out blocklisted matches
   - Returns: filtered message IDs

### Modified Files:

1. **lib/types/embedding.ts**
   - Added `GenerateFeedbackPhrasesRequest` interface
   - Added `GenerateFeedbackPhrasesResponse` interface
   - Added `FindSimilarEmailsRequest` interface
   - Added `FindSimilarEmailsResponse` interface

2. **lib/types/api.ts**
   - Added `blocklistedPhrases?: string[]` to `ExtraData` interface

3. **src/mastra/index.ts**
   - Added `feedbackPhraseGenerator` agent to Mastra configuration

4. **lib/services/embedding-service.ts**
   - Added `generateFeedbackPhrases()` method
   - Added `findSimilarEmails()` method

5. **app/api/embeddings/generate-phrases/route.ts**
   - Simplified to only generate phrases (no similarity search)
   - No longer requires embeddings to exist
   - No longer loads Faiss index from files

6. **components/space-data-dialog.tsx**
   - Completely refactored UI
   - Removed embedding generation section
   - Moved phrase generation to the top
   - Added editable allowlisted phrases section
   - Added blocklisted phrases section
   - Added user feedback input section
   - Added "Find Similar Emails" button
   - Updated state management for new flow

## API Endpoints

### New Endpoints:
- `POST /api/embeddings/generate-feedback-phrases` - Generate phrases from user feedback
- `POST /api/embeddings/find-similar` - Find similar emails (in-memory)

### Modified Endpoints:
- `POST /api/embeddings/generate-phrases` - Now only generates phrases (no search)

### Unchanged Endpoints:
- `GET /api/embeddings/check` - Check if embeddings exist (may be deprecated)
- `POST /api/embeddings/generate` - Generate and save embeddings (may be deprecated)

## UI Components

### Spaces Debug Dialog Sections (in order):

1. **Basic Configuration**
   - Space Name, Short Name
   - Message Count
   - Keywords (with include toggle)
   - Email Senders
   - Justification
   - Relevance Score

2. **Allowlisted Phrases** (new position)
   - Generate button (AI-generated phrases)
   - Editable list of phrases
   - Add/remove phrases manually

3. **Blocklisted Phrases** (new section)
   - Editable list of phrases
   - Add/remove phrases manually

4. **User Feedback** (new section)
   - Textarea for user input
   - "Add to Allowlist" button
   - "Add to Blocklist" button

5. **Find Similar Emails** (new section)
   - Button to trigger in-memory search
   - Shows matching message count
   - Toggle to show only semantic messages
   - Collapsible list of message IDs

## Cloud Run Compatibility

All changes are designed to work in Cloud Run environment:
- ✅ No file creation (no `.faiss` or `.json` files)
- ✅ In-memory embeddings generation
- ✅ In-memory Faiss index creation
- ✅ Session-based storage only
- ✅ No persistent storage required

## Example Usage Flow

1. Open Spaces Debug dialog
2. Click "Generate Allowlisted Phrases" → AI generates 8-12 phrases
3. Edit phrases as needed (add/remove/modify)
4. Enter feedback: "remove deals"
5. Click "Add to Blocklist" → AI generates deal-related phrases
6. Enter feedback: "add flight cancellation"
7. Click "Add to Allowlist" → AI generates cancellation phrases
8. Click "Find Similar Emails" → Generates embeddings in memory, finds matches
9. View matching message IDs
10. Toggle "Show semantic messages only" to filter the space

## Notes

- Embeddings are generated fresh each time "Find Similar Emails" is clicked
- No caching of embeddings (trade-off for Cloud Run compatibility)
- Message IDs are stored in `space.extraData.filteredMessageIds`
- Phrases are stored in `space.extraData.allowlistedPhrases` and `space.extraData.blocklistedPhrases`
- All data is saved to the space object when user clicks "Save Changes"
