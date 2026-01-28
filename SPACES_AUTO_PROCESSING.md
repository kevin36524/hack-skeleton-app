# Spaces Auto-Processing Feature

## Overview

The spaces API now automatically processes accepted spaces to generate allowlisted phrases using Gemini and find semantically relevant messages using embeddings. This happens transparently when fetching spaces, ensuring that spaces always have up-to-date message filters.

## How It Works

When you call `GET /api/spaces` with `mailboxId` and `guid` parameters, the API will:

1. **Fetch spaces** from Yahoo Mail Autopilot API
2. **Check accepted spaces** for updates:
   - If `filteredMessageIds` are missing, the space needs processing
   - If `filteredMessageIds` are older than 7 days, the space needs processing
3. **For each space that needs processing**:
   - Generate allowlisted phrases using Gemini (via `/api/embeddings/generate-phrases`)
   - Find semantically similar emails using embeddings (via `/api/embeddings/find-similar`)
   - Update the space with new phrases and message IDs (via `/api/spaces/edit`)
   - Store a timestamp (`filteredMessageIdsUpdatedAt`) to track when the update occurred
4. **Return the updated spaces** to the caller

## API Changes

### GET /api/spaces

**New Query Parameters:**
- `mailboxId` (optional): The mailbox identifier - required for auto-processing
- `guid` (optional): The user GUID - required for auto-processing

**Example:**
```bash
# Without auto-processing (backwards compatible)
GET /api/spaces?acctId=180001

# With auto-processing
GET /api/spaces?acctId=180001&mailboxId=2020478677&guid=6GRTRLKAUVA6VNOIGKVZBH54EA
```

### Space ExtraData Type

**New Field:**
- `filteredMessageIdsUpdatedAt?: string` - ISO timestamp of when filteredMessageIds were last updated

## Service Changes

### SpacesService

The `getSpaces` and `getSpacesDefault` methods now accept optional `mailboxId` and `guid` parameters:

```typescript
// Without auto-processing
const spaces = await spacesService.getSpaces(accountId);

// With auto-processing
const spaces = await spacesService.getSpaces(accountId, 0, true, mailboxId, guid);

// Or using the convenience method
const spaces = await spacesService.getSpacesDefault(accountId, mailboxId, guid);
```

## UI Integration

The `SpacesSection` component has been updated to automatically pass `mailboxId` and `guid` when loading spaces. This means:

- When users view their spaces, accepted spaces will be automatically processed if needed
- No manual action is required from the user
- The processing happens in the background and is transparent to the user

## Benefits

1. **Always Up-to-Date**: Spaces are automatically refreshed every 7 days
2. **Transparent**: No user action required
3. **Efficient**: Only processes spaces that need updating
4. **Backwards Compatible**: Works without mailboxId/guid (just skips auto-processing)
5. **Error Resilient**: If processing fails for a space, it keeps the original data

## Implementation Details

### Architecture

To avoid network issues on Cloud Run and improve performance, the auto-processing feature uses **direct function calls** instead of HTTP requests between internal API routes.

**Key Components:**

1. **`lib/services/spaces-processing.ts`**: Contains the core processing logic
   - `generateAllowlistedPhrases()` - Generates phrases using Mastra AI
   - `findSimilarEmails()` - Finds similar emails using embeddings

2. **`app/api/spaces/route.ts`**: GET endpoint that orchestrates the processing
   - Calls the processing functions directly
   - Only makes external HTTP calls to Yahoo Mail API

3. **API Routes**: Thin wrappers around the processing functions
   - `/api/embeddings/generate-phrases` - Wraps `generateAllowlistedPhrases()`
   - `/api/embeddings/find-similar` - Wraps `findSimilarEmails()`

### Benefits of Direct Function Calls

✅ **No Network Overhead**: Functions are called directly in the same process
✅ **Works on Cloud Run**: Avoids issues with services calling themselves via HTTP
✅ **Better Performance**: No serialization/deserialization of HTTP requests
✅ **Better Error Handling**: Stack traces are preserved across function calls
✅ **Simpler Debugging**: Can step through the entire flow in one process

## Technical Details

### needsUpdate() Function

```typescript
function needsUpdate(space: Space): boolean {
  const mids = space.extraData?.filteredMessageIds;
  const updatedAt = space.extraData?.filteredMessageIdsUpdatedAt;

  // If no mids exist, needs update
  if (!mids || mids.length === 0) {
    return true;
  }

  // If no timestamp, needs update
  if (!updatedAt) {
    return true;
  }

  // Check if older than 7 days
  const lastUpdate = new Date(updatedAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return lastUpdate < sevenDaysAgo;
}
```

### Processing Flow

For each accepted space that needs updating:

```
1. Generate Phrases
   ↓
   POST /api/embeddings/generate-phrases
   - Uses Mastra AI agent with Gemini
   - Generates search phrases based on space context
   ↓
2. Find Similar Emails
   ↓
   POST /api/embeddings/find-similar
   - Fetches messages matching space criteria
   - Generates embeddings in-memory
   - Uses cosine similarity to find top matches
   ↓
3. Update Space
   ↓
   POST /api/spaces/edit
   - Saves allowlistedPhrases
   - Saves filteredMessageIds
   - Saves filteredMessageIdsUpdatedAt timestamp
```

### Error Handling

- If any step fails for a space, the original space data is preserved
- Errors are logged but don't prevent other spaces from being processed
- The API always returns a valid response, even if some spaces fail to process

## Configuration

No additional configuration is required. The feature uses existing environment variables:

- Embedding provider configuration (OpenAI or Qwen3)
- Mastra AI agent configuration (for phrase generation)

## Performance Considerations

- Processing happens server-side to avoid CORS issues
- Each space is processed sequentially to avoid overwhelming the APIs
- The 7-day cache ensures spaces aren't unnecessarily reprocessed
- If auto-processing is slow, consider calling without mailboxId/guid and processing spaces manually using the existing embedding APIs

## Monitoring

Look for these log messages to monitor auto-processing:

```
[SPACES API] Auto-processing accepted spaces...
[SPACES API] Processing space: <space-name> (<space-id>)
[SPACES API] Step 1: Generating allowlisted phrases...
[SPACES API] Generated <count> phrases
[SPACES API] Step 2: Finding similar emails...
[SPACES API] Found <count> similar emails
[SPACES API] Step 3: Updating space...
[SPACES API] Successfully updated space: <space-name>
[SPACES API] Space <space-name> is up to date (mids age < 7 days)
[SPACES API] Auto-processing complete
```

## Migration

No migration is needed. Existing spaces will be automatically processed the next time they are fetched with mailboxId and guid parameters.
