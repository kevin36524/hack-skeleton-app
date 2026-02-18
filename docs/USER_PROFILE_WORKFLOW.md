# User Profile Builder Workflow

## Overview

A Mastra workflow that analyzes a user's Gmail emails to generate a comprehensive personal profile. The workflow fetches emails across categories (starred, read, sent, important, primary), deduplicates them, fetches metadata, classifies importance using an AI agent, and generates a detailed profile using another AI agent. The profile is output as a **free-form markdown document**, giving the LLM full freedom to organize and emphasize information naturally.

## Architecture

```
POST /api/gmail/user-profile (streaming)
  Authorization: Bearer <access_token>
        |
  Step 1: fetchAllCategories      -- parallel Gmail API calls for 5 categories
        |
  Step 2: deduplicateAndAnnotate  -- merge IDs, annotate with category tags
        |
  Step 3: fetchAllMetadata        -- batched messages.get(format=metadata)
        |
  Step 4: classifyImportance      -- AI agent classifies emails in batches of 100
        |
  Step 5: generateProfile         -- AI agent builds free-form markdown profile
        |
  Response: streaming WorkflowStreamEvents
```

## Configuration

- **Model**: `google/gemini-2.5-flash-lite`
- **Default emails per category**: 200 (~1000 total before dedup)
- **API pattern**: Streaming via Mastra's `run.stream()` → `streamOutput.fullStream`
- **Profile output**: Free-form markdown string

## Files

| File | Description |
|------|-------------|
| `src/mastra/agents/email-classifier-agent.ts` | Classifies emails as `important`/`skip` for profile building |
| `src/mastra/agents/profile-generator-agent.ts` | Generates a free-form markdown profile from email data |
| `src/mastra/workflows/build-user-profile.ts` | 5-step workflow orchestrating the full pipeline |
| `src/mastra/index.ts` | Registers agents and workflow with the Mastra instance |
| `app/api/gmail/user-profile/route.ts` | Streaming `POST` endpoint |

## Usage

```bash
curl -N -X POST http://localhost:3000/api/gmail/user-profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"maxResultsPerCategory": 50}'
```

The response is a `text/event-stream` of `WorkflowStreamEvent` objects. The final `workflow-finish` event contains the complete output.

### Output Shape

```ts
{
  profile: string;          // free-form markdown document
  emailAddress: string;     // authenticated user's email
  generatedAt: string;      // ISO timestamp
  stats: {
    totalEmailsFetched: number;
    uniqueEmails: number;
    importantEmails: number;
    categoryCounts: Record<string, number>;
    topSenders: { email: string; name?: string; count: number }[];
  };
}
```

## Workflow Steps

### Step 1: `fetch-all-categories`

Fetches message IDs from 5 categories in parallel using `Promise.allSettled`. Failed categories are silently skipped so a single API error doesn't abort the entire run.

**Categories fetched:** `STARRED`, `READ` (`is:read`), `SENT`, `IMPORTANT`, `CATEGORY_PRIMARY`

**Input:** `{ accessToken, maxResultsPerCategory }`
**Output:** `{ results: CategoryFetchResult[], totalFetched }`

### Step 2: `deduplicate-and-annotate`

Pure in-memory transformation — no API calls. Merges all message IDs across categories into a single deduplicated list. Each message is annotated with every category it appeared in (e.g., a starred sent email gets `["STARRED", "SENT"]`).

**Input:** Step 1 output
**Output:** `{ annotatedMessages, categoryCounts, totalUnique }`

### Step 3: `fetch-all-metadata`

Fetches `From`, `To`, `Subject`, `Date` headers for every unique message using `messages.get(format=metadata)`. Processed in batches of 50 with a 100 ms delay between batches for rate limiting. Uses `getInitData()` to retrieve the original `accessToken` from the workflow input.

**Input:** Step 2 output
**Output:** `{ emailsWithMetadata, categoryCounts, fetchErrors }`

### Step 4: `classify-importance`

Calls `emailClassifierAgent` in batches of 100 emails. The agent returns a JSON classification (`important` / `skip`) for each email. If a batch response fails to parse, all emails in that batch are kept as important (safe fallback).

**Input:** Step 3 output
**Output:** `{ importantEmails, skippedCount, categoryCounts, totalProcessed }`

### Step 5: `generate-profile`

Computes top-20 sender frequency stats, then calls `profileGeneratorAgent` with up to 300 important emails and the computed statistics. Returns the raw markdown profile string along with the stats object.

**Input:** Step 4 output
**Output:** `{ profile, emailAddress, generatedAt, stats }`

## Agents

### `emailClassifierAgent`

Classifies email metadata as `important` or `skip` for profile-building purposes.

**Keep:** personal correspondence, financial documents, travel bookings, legal/property/vehicle/government/healthcare documents, job search, education, event registrations.

**Skip:** marketing, newsletters, automated social notifications, spam, bulk promotional offers, generic system notifications.

Returns structured JSON only — no markdown wrapping.

### `profileGeneratorAgent`

Writes a rich, free-form markdown profile document from the classified email data. Sections include identity, interests, financial relationships, vehicles, business info, real estate, social profiles, family members, upcoming events, active life events, and communication patterns. Only sections with relevant data are included.

## Implementation Notes

- **Streaming property**: `run.stream()` returns a `WorkflowRunOutput` object. The readable stream is at `streamOutput.fullStream` (not `.stream` — that property does not exist on the type).
- **`getInitData()`**: Steps 3 and 5 use `getInitData<T>()` to read the original workflow input (`accessToken`, `emailAddress`) since those values are not passed through intermediate step outputs.
- **Error isolation**: Both `Promise.allSettled` usages (Steps 1 and 3) and the classifier fallback (Step 4) ensure partial failures don't abort the workflow.

## Rate Limiting & Performance

- Gmail API quota: ~250 units/second per user; `messages.list` = 5 units, `messages.get` = 5 units
- Step 1: 5 parallel list calls (~25 units, negligible)
- Step 3: 50 concurrent gets per batch with 100 ms delay; ~500 unique messages = 10 batches ≈ 1–2 s
- Step 4: ~5 agent calls for 500 emails at 100/batch
- Estimated total: 30–90 seconds depending on email volume and agent latency
- Note: OAuth access tokens expire after 1 hour — very large inboxes may hit expiry mid-run; token refresh between steps is a potential future improvement
