# Email Digest Workflow

## Overview

The Email Digest Workflow is a comprehensive Mastra workflow that automates the process of fetching emails from a mailbox, extracting snippets, and generating an AI-powered daily digest summary.

## Workflow Steps

The workflow consists of three main steps:

### 1. **Fetch Messages** (`fetch-messages`)
- Fetches all messages from the specified mailbox within a time range
- Uses the `/api/proxy` endpoint with OAuth authentication
- Filters messages by mailbox ID, folder ID, and date range
- Returns array of messages with IDs and snippets

### 2. **Extract Snippets** (`extract-snippets`)
- Processes the fetched messages
- Extracts and cleans email snippets
- Filters out empty snippets
- Returns array of clean snippet strings

### 3. **Generate Digest** (`generate-digest`)
- Uses the `emailDigestAgent` to analyze snippets
- Generates a well-formatted daily digest
- Includes categorization, prioritization, and action items
- Returns the digest string with metadata

## Workflow Configuration

- **ID**: `email-digest-workflow`
- **Input Schema**:
  - `mailboxId` (string, required): The mailbox ID
  - `accountId` (string, required): The account ID
  - `inboxFolderId` (string, required): The inbox folder ID
  - `duration` (number, optional, default: 1): Days to look back for emails

- **Output Schema**:
  - `digest` (string): The generated digest summary
  - `status` (string): Status of generation (success/empty)
  - `generatedAt` (string): ISO timestamp of generation

- **Runtime Context**:
  - `oauthToken` (required): OAuth token for API authentication
  - `userId` (optional): User ID for memory context

## Usage

### Basic Usage

```typescript
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Get the workflow
const workflow = mastra.getWorkflow('emailDigestWorkflow');

// Create runtime context with OAuth token
const runtimeContext = new RuntimeContext();
runtimeContext.set('oauthToken', 'your-oauth-token-here');
runtimeContext.set('userId', 'user-123'); // Optional

// Create and execute workflow
const run = await workflow.createRunAsync();
const result = await run.start({
  inputData: {
    mailboxId: 'mailbox-123',
    accountId: 'account-456',
    inboxFolderId: 'inbox-789',
    duration: 1, // Last 1 day
  },
  runtimeContext,
});

console.log('Digest:', result.result.digest);
```

### Using the Helper Function

```typescript
import { generateEmailDigestWorkflow } from '@/src/mastra/workflows/email-digest-workflow-example';

const result = await generateEmailDigestWorkflow(
  'mailbox-123',    // mailboxId
  'account-456',    // accountId
  'inbox-789',      // inboxFolderId
  'oauth-token',    // oauthToken
  7,                // duration (last 7 days)
  'user-123'        // userId (optional)
);

console.log('Digest:', result.digest);
console.log('Status:', result.status);
console.log('Generated at:', result.generatedAt);
```

## API Integration

### Creating an API Route

Create a file at `app/api/workflows/email-digest/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mailboxId, accountId, inboxFolderId, duration = 1 } = body;

    // Validate inputs
    if (!mailboxId || !accountId || !inboxFolderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get OAuth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const oauthToken = authHeader.replace('Bearer ', '');

    // Create runtime context
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', oauthToken);

    // Execute workflow
    const workflow = mastra.getWorkflow('emailDigestWorkflow');
    const run = await workflow.createRunAsync();
    const result = await run.start({
      inputData: { mailboxId, accountId, inboxFolderId, duration },
      runtimeContext,
    });

    if (result.status !== 'success') {
      throw new Error(`Workflow failed: ${result.status}`);
    }

    return NextResponse.json({
      success: true,
      data: result.result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

### API Request Example

```bash
curl -X POST http://localhost:3000/api/workflows/email-digest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OAUTH_TOKEN" \
  -d '{
    "mailboxId": "mailbox-123",
    "accountId": "account-456",
    "inboxFolderId": "inbox-789",
    "duration": 1
  }'
```

### API Response Example

```json
{
  "success": true,
  "data": {
    "digest": "# Daily Email Digest - 5 Emails\n\n## Overview\nYou received 5 emails today covering project updates, customer inquiries, and team communications.\n\n---\n\n## 🔴 High Priority\n\n### Customer Issue - API Integration\n**Summary**: Production issue affecting 500 users...\n**Action**: Respond urgently\n\n---\n\n## Summary of Action Items\n1. 🔴 **URGENT**: Respond to customer API issue\n2. 🟡 Review project proposal by Friday\n3. 🟢 Process invoice payment",
    "status": "success",
    "generatedAt": "2024-12-12T18:30:00.000Z"
  }
}
```

## Data Flow

```
Input (mailboxId, accountId, inboxFolderId, duration)
  ↓
Step 1: Fetch Messages
  → Calls: GET http://localhost:3000/api/proxy/mailboxes/@.id=={mailboxId}/messages/@.select==q?q={query}
  → Query: folderId:{id}+-sort:date+date:[{startTime} TO *]+count:200
  → Uses: oauthToken from runtimeContext
  → Returns: { messages: [...], messageCount: N, fetchedAt: "..." }
  ↓
Step 2: Extract Snippets
  → Processes: messages array
  → Filters: empty snippets
  → Returns: { snippets: [...], snippetCount: N, processedAt: "..." }
  ↓
Step 3: Generate Digest
  → Calls: emailDigestAgent.generate()
  → Uses: snippets array
  → Returns: { digest: "...", status: "success", generatedAt: "..." }
  ↓
Output (digest, status, generatedAt)
```

## Runtime Context

The workflow requires the following runtime context values:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `oauthToken` | string | Yes | OAuth token for API authentication |
| `userId` | string | No | User ID for agent memory context |

```typescript
const runtimeContext = new RuntimeContext();
runtimeContext.set('oauthToken', token);
runtimeContext.set('userId', userId); // Optional
```

## Error Handling

The workflow includes comprehensive error handling:

### Step 1 Errors
- **Missing OAuth token**: Throws error if token not in runtime context
- **API request failure**: Throws error with status code and message
- **Invalid response**: Handles missing or malformed data

### Step 2 Errors
- **No snippets**: Returns empty array if no valid snippets found
- **Processing errors**: Logs and continues with available data

### Step 3 Errors
- **No emails**: Returns friendly message when no emails found
- **Agent not found**: Throws error if emailDigestAgent not registered
- **Generation failure**: Catches and reports agent errors

## Configuration

### Customizing Duration

```typescript
// Fetch last 7 days of emails
const result = await run.start({
  inputData: {
    mailboxId: 'mailbox-123',
    accountId: 'account-456',
    inboxFolderId: 'inbox-789',
    duration: 7, // 7 days
  },
  runtimeContext,
});
```

### Customizing API Endpoint

The workflow uses `http://localhost:3000/api/proxy` by default. To change this, edit the `fetchMessagesStep` in `email-digest-workflow.ts`:

```typescript
const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/proxy/mailboxes/...`;
```

## Testing

### Test with Sample Data

```typescript
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

async function testWorkflow() {
  const workflow = mastra.getWorkflow('emailDigestWorkflow');
  const runtimeContext = new RuntimeContext();
  runtimeContext.set('oauthToken', 'test-token');

  const run = await workflow.createRunAsync();
  const result = await run.start({
    inputData: {
      mailboxId: 'test-mailbox',
      accountId: 'test-account',
      inboxFolderId: 'test-inbox',
      duration: 1,
    },
    runtimeContext,
  });

  console.log('Result:', result);
}

testWorkflow();
```

## Integration with Email Digest Agent

The workflow uses the `emailDigestAgent` created earlier. The agent:
- Analyzes email snippets
- Groups related emails by topic
- Assigns priority levels (High/Medium/Low)
- Extracts action items
- Generates formatted markdown output

The workflow automatically passes:
- `resource`: User ID from runtime context (or 'default-user')
- `thread`: Daily thread ID (`digest-YYYY-MM-DD`)

This enables the agent to maintain context across multiple digest generations.

## Files

- `email-digest-workflow.ts`: Main workflow definition
- `email-digest-workflow-example.ts`: Helper function and usage examples
- `api-route-example.ts`: Next.js API route example
- `README.md`: This documentation

## Troubleshooting

### Workflow not found
**Error**: `Email digest workflow not found`
**Solution**: Ensure workflow is registered in `/src/mastra/index.ts`

### OAuth token missing
**Error**: `OAuth token not found in runtime context`
**Solution**: Set token before execution:
```typescript
runtimeContext.set('oauthToken', token);
```

### Agent not found
**Error**: `emailDigestAgent not found`
**Solution**: Ensure agent is registered in `/src/mastra/index.ts`

### API request fails
**Error**: `Failed to fetch messages: 401`
**Solution**: Verify OAuth token is valid and has correct permissions

### No emails returned
**Result**: `{ digest: "No emails found...", status: "empty" }`
**Solution**: Check mailbox ID, folder ID, and date range parameters

### Workflow status not "success"
**Error**: `Workflow execution failed with status: error`
**Solution**: Check console logs for detailed error messages from individual steps

## Performance Considerations

- **API Rate Limits**: Be aware of rate limits on the `/api/proxy` endpoint
- **Duration**: Larger duration values fetch more emails and take longer
- **Snippet Processing**: Very large email volumes may require pagination
- **Agent Calls**: Each digest generation uses AI tokens (cost consideration)

## Best Practices

1. **Cache Results**: Consider caching digests for the same day
2. **Batch Processing**: For multiple users, process sequentially to avoid rate limits
3. **Error Recovery**: Implement retry logic for transient API failures
4. **Monitoring**: Log workflow execution times and success rates
5. **Token Management**: Refresh OAuth tokens before they expire

## Next Steps

1. **Test the Workflow**: Use the example code with real mailbox data
2. **Create API Route**: Implement the API endpoint for frontend access
3. **Add Scheduling**: Set up cron jobs for automatic daily digests
4. **Monitor Performance**: Track execution times and success rates
5. **Customize Output**: Adjust agent instructions for different digest formats

## Example Output

When the workflow completes successfully, the digest will look like:

```markdown
# Daily Email Digest - 4 Emails

## Overview
You received 4 emails today covering project updates, customer inquiries, and team communications.

---

## 🔴 High Priority

### Customer Inquiry - API Integration Issue
**From**: customer@client.com
**Summary**: Production issue affecting 500 users requires immediate attention.
**Action**: Respond urgently and provide technical support.

---

## 🟡 Medium Priority

### Project Update - Q4 Project
**From**: john@example.com
**Summary**: Q4 project is 80% complete. Final phase approval needed by Friday.
**Action**: Review and approve final phase by end of week.

---

## Summary of Action Items
1. 🔴 **URGENT**: Respond to customer API integration issue
2. 🟡 Approve Q4 project final phase by Friday
3. 🟡 Review meeting agenda for tomorrow
4. 🟢 Process invoice payment within 5 days
```
