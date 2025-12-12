# Email Digest Workflow - Quick Start Guide

## 🚀 Quick Usage

### Option 1: Direct Workflow Execution

```typescript
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Setup
const workflow = mastra.getWorkflow('emailDigestWorkflow');
const runtimeContext = new RuntimeContext();
runtimeContext.set('oauthToken', 'your-oauth-token');

// Execute
const run = await workflow.createRunAsync();
const result = await run.start({
  inputData: {
    mailboxId: 'mailbox-id',
    accountId: 'account-id',
    inboxFolderId: 'inbox-id',
    duration: 1, // days
  },
  runtimeContext,
});

// Get digest
console.log(result.result.digest);
```

### Option 2: Using Helper Function

```typescript
import { generateEmailDigestWorkflow } from '@/src/mastra/workflows/email-digest-workflow-example';

const result = await generateEmailDigestWorkflow(
  'mailbox-id',
  'account-id',
  'inbox-id',
  'oauth-token',
  1, // duration in days
  'user-id' // optional
);

console.log(result.digest);
```

## 📋 Required Inputs

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mailboxId` | string | ✅ Yes | - | The mailbox ID |
| `accountId` | string | ✅ Yes | - | The account ID |
| `inboxFolderId` | string | ✅ Yes | - | The inbox folder ID |
| `duration` | number | ❌ No | 1 | Days to look back |
| `oauthToken` | string (runtime) | ✅ Yes | - | OAuth token |
| `userId` | string (runtime) | ❌ No | - | User ID for memory |

## 📤 Output Format

```typescript
{
  digest: string,        // The formatted digest text
  status: string,        // "success" or "empty"
  generatedAt: string    // ISO timestamp
}
```

## 🌐 API Endpoint

Create: `app/api/workflows/email-digest/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mailboxId, accountId, inboxFolderId, duration = 1 } = body;

  const authHeader = request.headers.get('authorization');
  const oauthToken = authHeader?.replace('Bearer ', '');

  const runtimeContext = new RuntimeContext();
  runtimeContext.set('oauthToken', oauthToken);

  const workflow = mastra.getWorkflow('emailDigestWorkflow');
  const run = await workflow.createRunAsync();
  const result = await run.start({
    inputData: { mailboxId, accountId, inboxFolderId, duration },
    runtimeContext,
  });

  return NextResponse.json({ success: true, data: result.result });
}
```

## 🧪 Test with cURL

```bash
curl -X POST http://localhost:3000/api/workflows/email-digest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mailboxId": "mailbox-123",
    "accountId": "account-456",
    "inboxFolderId": "inbox-789",
    "duration": 1
  }'
```

## 🔍 What Happens Behind the Scenes

1. **Step 1 - Fetch Messages**
   - Calls: `GET /api/proxy/mailboxes/@.id=={mailboxId}/messages/@.select==q?q={query}`
   - Query: `folderId:{id}+-sort:date+date:[{startTime} TO *]+count:200`
   - Filters by date range (last N days using Unix timestamps)
   - Returns message IDs and snippets

2. **Step 2 - Extract Snippets**
   - Processes message array
   - Filters out empty snippets
   - Returns clean snippet array

3. **Step 3 - Generate Digest**
   - Calls `emailDigestAgent`
   - Analyzes all snippets
   - Returns formatted digest with:
     - Overview
     - Categorized emails (High/Medium/Low priority)
     - Action items
     - Markdown formatting

## ⚡ Common Use Cases

### Daily Digest
```typescript
await generateEmailDigestWorkflow(
  mailboxId, accountId, inboxFolderId,
  token, 1 // Last 24 hours
);
```

### Weekly Summary
```typescript
await generateEmailDigestWorkflow(
  mailboxId, accountId, inboxFolderId,
  token, 7 // Last 7 days
);
```

### Monthly Overview
```typescript
await generateEmailDigestWorkflow(
  mailboxId, accountId, inboxFolderId,
  token, 30 // Last 30 days
);
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Workflow not found" | Check registration in `/src/mastra/index.ts` |
| "OAuth token not found" | Set token: `runtimeContext.set('oauthToken', token)` |
| "Agent not found" | Ensure `emailDigestAgent` is registered |
| "No emails found" | Check mailboxId, folderId, and duration |
| 401 API error | Verify OAuth token is valid |

## 📚 More Information

- Full documentation: `./README.md`
- Agent documentation: `../agents/README.md`
- API examples: `./api-route-example.ts`
- Helper functions: `./email-digest-workflow-example.ts`

## ✅ Verification Checklist

- [ ] Workflow registered in `/src/mastra/index.ts`
- [ ] Agent `emailDigestAgent` registered
- [ ] OAuth token available
- [ ] API endpoint `/api/proxy` accessible at localhost:3000
- [ ] Valid mailboxId, accountId, and inboxFolderId
- [ ] Dev server running

## 🎯 Quick Test

```typescript
// Test if workflow is registered
import { mastra } from '@/src/mastra';
const workflow = mastra.getWorkflow('emailDigestWorkflow');
console.log('Workflow found:', !!workflow);

// Test if agent is registered
const agent = mastra.getAgent('emailDigestAgent');
console.log('Agent found:', !!agent);
```

---

**Ready to go!** 🚀 Your workflow is now set up and ready to generate email digests.
