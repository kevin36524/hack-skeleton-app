# Intelligent Gmail Search

This feature allows users to search emails using natural language queries. The system uses a Mastra AI agent to convert natural language into Gmail API query strings.

## How It Works

1. **User Input**: User types a natural language query like "show me emails with birthday from niti in my primary inbox"
2. **AI Processing**: The Gmail Search Agent analyzes the query and converts it to Gmail API syntax
3. **Query Execution**: The generated query is executed against the Gmail API
4. **Results**: Matching emails are returned with metadata about the search

## API Reference

### Gmail Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `from:` | Sender email/name | `from:niti` |
| `to:` | Recipient | `to:john@example.com` |
| `subject:` | Subject line content | `subject:project` |
| `in:` | Folder/label | `in:inbox`, `in:sent` |
| `is:` | Message status | `is:unread`, `is:starred` |
| `has:` | Has specific content | `has:attachment` |
| `filename:` | Attachment type | `filename:pdf` |
| `after:` | After date | `after:2024/01/01` |
| `before:` | Before date | `before:2024/12/31` |
| `newer_than:` | Recent emails | `newer_than:7d` |
| `older_than:` | Older emails | `older_than:30d` |

## Usage Examples

### Using the Client Library

```typescript
import { gmail, setAccessToken } from '@/lib/services/gmail-client';

// Set the access token first
setAccessToken(accessToken);

// Search using natural language
const result = await gmail.users.messages.intelligentSearch({
  query: "show me emails with birthday from niti in my primary inbox",
  maxResults: 30,
  useAgent: true, // Use AI agent (default), set to false for rule-based parsing
});

console.log('Generated query:', result.query);
// Output: "from:niti birthday in:inbox"

console.log('Explanation:', result.explanation);
// Output: "Search for emails from niti containing 'birthday' in the inbox folder"

console.log('Detected params:', result.detectedParams);
// Output: { from: "niti", folder: "inbox", keywords: ["birthday"] }

console.log('Messages:', result.messages);
// Array of matching email messages
```

### Using the API Directly

**POST /api/gmail/intelligent-search**

```bash
curl -X POST http://localhost:3000/api/gmail/intelligent-search \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "unread emails from john with attachments",
    "maxResults": 20,
    "useAgent": true
  }'
```

**GET /api/gmail/intelligent-search?q={query}**

```bash
curl "http://localhost:3000/api/gmail/intelligent-search?q=emails%20about%20project%20from%20last%20week" \
  -H "Authorization: Bearer {access_token}"
```

## Example Queries

| Natural Language | Generated Query |
|-----------------|-----------------|
| "emails from niti in my primary inbox" | `from:niti in:inbox` |
| "unread emails from john with attachments" | `from:john is:unread has:attachment` |
| "starred emails about project" | `subject:project is:starred` |
| "emails from last week in important" | `newer_than:7d in:important` |
| "emails with pdf from boss" | `from:boss filename:pdf has:attachment` |
| "unread starred emails" | `is:unread is:starred` |

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User Query     │────▶│  Gmail Search    │────▶│  Gmail API      │
│  (Natural Lang) │     │  Agent (Mastra)  │     │  Query String   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Query Parser    │
                        │  + Generator     │
                        └──────────────────┘
```

### Components

1. **Gmail Search Agent** (`src/mastra/agents/gmail-search-agent.ts`)
   - Mastra AI agent with instructions for Gmail query syntax
   - Uses Gemini Flash Lite model for fast, cost-effective processing
   - Has memory for context across conversations

2. **Search Query Tool** (`src/mastra/tools/gmail-search-query-tool.ts`)
   - Tool definition for the agent
   - Includes `parseNaturalLanguageQuery()` helper for rule-based parsing
   - Documents all Gmail query operators

3. **Intelligent Search Service** (`lib/services/intelligent-search-service.ts`)
   - Orchestrates the search flow
   - Calls the agent to generate queries
   - Executes searches via Gmail client
   - Handles response parsing and error recovery

4. **API Route** (`app/api/gmail/intelligent-search/route.ts`)
   - REST endpoint for intelligent search
   - Supports both POST and GET methods
   - Returns query metadata + search results

## Configuration

The agent requires a Google Gemini API key:

```bash
# .env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Two Modes of Operation

### 1. AI Agent Mode (Default, `useAgent: true`)
- Uses the Mastra AI agent to analyze and generate queries
- Better handling of complex, ambiguous queries
- Can understand context and intent
- Slightly slower due to LLM call

### 2. Rule-Based Mode (`useAgent: false`)
- Uses regex patterns to extract query components
- Faster execution (no LLM call)
- Good for simple, straightforward queries
- Falls back to this if AI mode fails

## Error Handling

The service includes fallback mechanisms:

1. If AI agent fails to return valid JSON, it attempts to extract the query from the text
2. If the search execution fails, the error is propagated with details
3. Invalid queries return 400 Bad Request with explanation

## Future Enhancements

- [ ] Support for complex boolean queries (AND, OR, NOT)
- [ ] Date range parsing ("between Jan 1 and Feb 1")
- [ ] Contact name resolution (lookup email from name)
- [ ] Saved searches / search history
- [ ] Query suggestions based on user's email patterns
