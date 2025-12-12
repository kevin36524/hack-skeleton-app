# Email Digest API Documentation

## Overview

The Email Digest API provides endpoints for generating AI-powered email digests from arrays of email snippets. The API uses the Mastra email digest agent to analyze emails and create structured, actionable summaries.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Generate Email Digest

Generate a comprehensive digest from an array of email snippets.

**Endpoint:** `POST /api/digest`

**Request Body:**

```json
{
  "emails": [
    {
      "from": "sender@example.com",
      "subject": "Email subject line",
      "snippet": "Email content preview or full text...",
      "timestamp": "2024-03-15T09:30:00Z" // optional
    }
  ],
  "userId": "user-123",           // optional, defaults to "anonymous"
  "threadId": "digest-session-1"  // optional, auto-generated if not provided
}
```

**Response:**

```json
{
  "success": true,
  "digest": "**Overview**\nYou received 5 emails...\n\n**Urgent Items**\n- Production server down...",
  "metadata": {
    "emailCount": 5,
    "generatedAt": "2024-03-15T10:00:00Z",
    "userId": "user-123",
    "threadId": "digest-session-1"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/digest \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      {
        "from": "john@company.com",
        "subject": "Urgent: Server Down",
        "snippet": "Production server has been down since 2 PM...",
        "timestamp": "2024-03-15T14:15:00Z"
      },
      {
        "from": "sarah@vendor.com",
        "subject": "Meeting Tomorrow",
        "snippet": "Budget review meeting at 10 AM tomorrow...",
        "timestamp": "2024-03-15T09:30:00Z"
      }
    ],
    "userId": "user-123",
    "threadId": "daily-digest-001"
  }'
```

**Example JavaScript:**

```javascript
const response = await fetch('http://localhost:3000/api/digest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    emails: [
      {
        from: 'john@company.com',
        subject: 'Urgent: Server Down',
        snippet: 'Production server has been down...',
        timestamp: '2024-03-15T14:15:00Z'
      }
    ],
    userId: 'user-123',
    threadId: 'daily-digest-001'
  })
});

const data = await response.json();
console.log(data.digest);
```

### 2. Follow-up Question

Ask follow-up questions about a previously generated digest using the same thread ID.

**Endpoint:** `GET /api/digest`

**Query Parameters:**

- `question` (required): The follow-up question
- `userId` (optional): User identifier, defaults to "anonymous"
- `threadId` (required): Thread ID from the original digest generation

**Response:**

```json
{
  "success": true,
  "answer": "Based on the digest, the following emails require immediate action...",
  "metadata": {
    "question": "Which emails require immediate action?",
    "userId": "user-123",
    "threadId": "digest-session-1",
    "generatedAt": "2024-03-15T10:05:00Z"
  }
}
```

**Example cURL:**

```bash
curl -X GET "http://localhost:3000/api/digest?question=Which%20emails%20require%20immediate%20action&userId=user-123&threadId=digest-session-1"
```

**Example JavaScript:**

```javascript
const params = new URLSearchParams({
  question: 'Which emails require immediate action?',
  userId: 'user-123',
  threadId: 'daily-digest-001'
});

const response = await fetch(`http://localhost:3000/api/digest?${params}`);
const data = await response.json();
console.log(data.answer);
```

## Request Schema

### EmailSnippet Object

| Field       | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| from        | string | Yes      | Sender email address                 |
| subject     | string | Yes      | Email subject line                   |
| snippet     | string | Yes      | Email content preview or full text   |
| timestamp   | string | No       | ISO 8601 timestamp                   |

### DigestRequest Object

| Field       | Type           | Required | Description                                    |
|-------------|----------------|----------|------------------------------------------------|
| emails      | EmailSnippet[] | Yes      | Array of email snippets (min 1)                |
| userId      | string         | No       | User identifier (default: "anonymous")         |
| threadId    | string         | No       | Conversation thread ID (auto-generated)        |

## Response Schema

### Success Response

| Field       | Type   | Description                                |
|-------------|--------|--------------------------------------------|
| success     | boolean| Always true for successful responses       |
| digest      | string | Generated email digest text                |
| metadata    | object | Additional information about the digest    |

### Metadata Object

| Field        | Type   | Description                              |
|--------------|--------|------------------------------------------|
| emailCount   | number | Number of emails processed               |
| generatedAt  | string | ISO 8601 timestamp                       |
| userId       | string | User identifier used                     |
| threadId     | string | Thread identifier for follow-up queries  |

### Error Response

| Field       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| success     | boolean| Always false for error responses     |
| error       | string | Human-readable error message         |
| details     | string | Additional error details (optional)  |

## Error Codes

| Status Code | Error Message                                          | Description                          |
|-------------|-------------------------------------------------------|--------------------------------------|
| 400         | Invalid request: emails array is required...          | Missing or empty emails array        |
| 400         | Invalid email format: from, subject, and snippet...   | Email object missing required fields |
| 400         | Question parameter is required                        | Follow-up without question           |
| 400         | ThreadId parameter is required for follow-up...       | Follow-up without thread ID          |
| 500         | Email digest agent not found                          | Agent not properly configured        |
| 500         | Failed to generate email digest                       | Internal error during generation     |
| 500         | Failed to process follow-up question                  | Internal error during follow-up      |

## Memory and Thread Management

The Email Digest API uses memory to maintain context across requests. This enables follow-up questions and multi-turn conversations.

### Thread IDs

- Each digest generation creates or uses a thread
- Use the same `threadId` for follow-up questions
- Different threads are isolated from each other

### User IDs

- `userId` identifies the user across different threads
- Use consistent user IDs to track user-specific history
- Different users have separate memory contexts

### Example Session Flow

```javascript
// Step 1: Generate initial digest
const digestResponse = await fetch('/api/digest', {
  method: 'POST',
  body: JSON.stringify({
    emails: [...],
    userId: 'user-123',
    threadId: 'morning-digest-2024-03-15'
  })
});

// Step 2: Ask follow-up question using same threadId
const followUpResponse = await fetch(
  '/api/digest?question=Which emails need replies?&userId=user-123&threadId=morning-digest-2024-03-15'
);

// Step 3: Another follow-up in same thread
const followUpResponse2 = await fetch(
  '/api/digest?question=What about urgent items?&userId=user-123&threadId=morning-digest-2024-03-15'
);
```

## Digest Format

The generated digest follows this structure:

1. **Overview**: Brief summary of email volume and themes
2. **Urgent/Priority Items**: Time-sensitive emails needing attention
3. **Action Items**: Tasks or responses required
4. **By Theme/Topic**: Grouped summaries of related emails
5. **FYI/Low Priority**: Informational emails

## Rate Limiting

Currently, there are no rate limits enforced. For production use, implement appropriate rate limiting based on your needs.

## Best Practices

### 1. Batch Size

- Optimal: 5-50 emails per digest
- Too few (<5): May not provide meaningful grouping
- Too many (>100): May exceed token limits or reduce quality

### 2. Thread Management

- Use date-based thread IDs: `digest-2024-03-15`
- Or session-based: `digest-${sessionId}`
- Clean up old threads periodically

### 3. Email Content

- Include full context in snippets for best results
- Preserve sender and subject information
- Include timestamps when available

### 4. Error Handling

```javascript
try {
  const response = await fetch('/api/digest', { /* ... */ });
  const data = await response.json();

  if (!data.success) {
    console.error('Digest generation failed:', data.error);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Network or parsing error:', error);
  // Handle network errors
}
```

## Testing

### Test with Sample Data

```bash
# Test the API with sample data
npx tsx test-email-digest.ts
```

### Test API Endpoint

```bash
# Generate digest
curl -X POST http://localhost:3000/api/digest \
  -H "Content-Type: application/json" \
  -d @sample-emails.json

# Follow-up question
curl "http://localhost:3000/api/digest?question=What%20are%20the%20urgent%20items&threadId=test-123"
```

## Development

### Running the Application

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/digest`

### Environment Variables

Required environment variables:

```bash
# .env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Or for OpenAI:

```bash
OPENAI_API_KEY=your_api_key_here
```

## Support

For issues or questions:
1. Check the agent configuration in `src/mastra/agents/email-digest-agent.ts`
2. Review the agent README in `src/mastra/agents/README.md`
3. Test the agent directly using the example file

## Changelog

### Version 1.0.0
- Initial release
- POST endpoint for digest generation
- GET endpoint for follow-up questions
- Memory support for multi-turn conversations
- Comprehensive error handling
