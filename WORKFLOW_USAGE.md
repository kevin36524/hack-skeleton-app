# Email Summarization Workflow Usage Guide

## Overview

The email summarization workflow fetches email messages from Yahoo Mail and generates AI-powered summaries using Google Gemini Flash Lite.

## Prerequisites

1. **Next.js server must be running** - The workflow makes API calls to your Next.js proxy
2. **Google AI API key** - Set in `.env` as `GOOGLE_GENERATIVE_AI_API_KEY`
3. **Valid OAuth token** - Yahoo Mail OAuth token for authentication

## Setup

### 1. Environment Variables

Ensure you have the following in your `.env` file:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000  # Optional, defaults to localhost:3000
```

### 2. Start Both Servers

```bash
# Terminal 1 - Start Next.js server (required for workflow)
npm run dev

# Terminal 2 - Start Mastra dev console (for testing)
npm run mastraDev
```

## Usage Methods

### Method 1: Via API Route (Recommended)

Use the provided API route at `/api/workflows/summarize-email`:

```typescript
// Frontend example
const response = await fetch('/api/workflows/summarize-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${oauthToken}`,
  },
  body: JSON.stringify({
    mailboxId: 'your-mailbox-id',
    messageId: 'message-id-to-summarize',
  }),
});

const result = await response.json();
console.log('Summary:', result.data.summary);
```

### Method 2: Direct Workflow Execution

```typescript
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Create runtime context with OAuth token
const runtimeContext = new RuntimeContext();
runtimeContext.set('oauthToken', yourOAuthToken);

// Get workflow
const workflow = mastra.getWorkflow('emailSummarizationWorkflow');

// Execute
const result = await workflow.execute(
  {
    mailboxId: 'your-mailbox-id',
    messageId: 'message-id-to-summarize',
  },
  {
    runtimeContext,
  }
);

console.log('Summary:', result.summary);
```

### Method 3: Mastra Dev Console

**Important**: When testing in Mastra dev console, ensure:
1. Next.js server is running at localhost:3000
2. You pass the OAuth token in runtime context

**Testing Steps:**

1. Start Next.js server:
   ```bash
   npm run dev
   ```

2. In another terminal, start Mastra dev:
   ```bash
   npm run mastraDev
   ```

3. In the Mastra dev console:
   - Navigate to Workflows
   - Select "email-summarization"
   - In the "Runtime Context" section, add:
     ```json
     {
       "oauthToken": "your-yahoo-oauth-token-here"
     }
     ```
   - In the "Input" section, add:
     ```json
     {
       "mailboxId": "your-mailbox-id",
       "messageId": "message-id-to-summarize"
     }
     ```
   - Click "Execute"

## Workflow Steps

The workflow consists of 3 steps:

1. **Fetch Message** - Retrieves full message body from Yahoo Mail API
2. **Convert HTML to Text** - Converts HTML email to plain text
3. **Summarize Email** - Generates AI summary using Google Gemini

## Output Format

```typescript
{
  summary: string;           // The AI-generated summary
  status: string;           // 'success' or 'empty'
  conversionMethod: string; // 'direct', 'html-strip', or 'none'
  textLength?: number;      // Length of original text
  summarizedAt?: string;    // ISO timestamp
}
```

## Troubleshooting

### Error: "Client connection prematurely closed"

**Cause**: Next.js server is not running or OAuth token is invalid.

**Solution**:
1. Ensure Next.js server is running: `npm run dev`
2. Verify OAuth token is valid
3. Check console logs for more details

### Error: "OAuth token not found in runtime context"

**Cause**: Runtime context not properly configured.

**Solution**:
```typescript
const runtimeContext = new RuntimeContext();
runtimeContext.set('oauthToken', yourToken);
```

### Error: "Failed to fetch message"

**Cause**: API call to Yahoo Mail failed.

**Solution**:
1. Check if mailboxId and messageId are valid
2. Verify OAuth token has correct permissions
3. Check Next.js server logs for API errors

### Agent works in isolation but fails in workflow

**Cause**: Usually means the workflow steps before the agent call are failing.

**Solution**:
1. Check console logs for errors in Step 1 (fetch) or Step 2 (convert)
2. Ensure Next.js server is running
3. Verify OAuth token is passed correctly

## Example: Full Integration

```typescript
// In a Next.js API route or server component
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function summarizeEmail(
  mailboxId: string,
  messageId: string,
  oauthToken: string
) {
  try {
    // Setup runtime context
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', oauthToken);

    // Execute workflow
    const workflow = mastra.getWorkflow('emailSummarizationWorkflow');
    const result = await workflow.execute(
      { mailboxId, messageId },
      { runtimeContext }
    );

    return {
      success: true,
      summary: result.summary,
      status: result.status,
    };
  } catch (error) {
    console.error('Failed to summarize email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

## Notes

- The workflow uses Google Gemini Flash Lite for cost-effective summarization
- HTML emails are automatically converted to plain text
- Empty messages return status 'empty' with a default message
- All steps include comprehensive error handling and logging
