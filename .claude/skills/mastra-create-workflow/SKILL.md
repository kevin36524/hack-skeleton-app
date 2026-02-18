---
name: mastra-create-workflow
description: Create a workflow in an existing Mastra setup
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - AskUserQuestion
---

# Skill: Create a Mastra Workflow

## Overview

This skill creates workflows in Mastra. Workflows are orchestrated sequences of steps that execute in order, passing data between steps automatically. Workflows are ideal for multi-step processes, data pipelines, and complex automation tasks.

## When to Use

Use this skill when:
- You need to orchestrate multiple steps in a specific order
- You want to pass data between different processing stages
- You're building data pipelines or ETL processes
- You need to coordinate multiple operations with dependencies
- You want to track execution state across multiple steps

**Prerequisites:**
- Mastra setup complete (use `mastra-setup` skill first)
- Understanding of the business logic you want to automate

## How It Works

### Step 1: Define Workflow Steps

Each step is a unit of work that:
- Has a unique ID and description
- Defines input and output schemas using Zod
- Executes a function receiving a single destructured params object
- Returns data that automatically flows to the next step

### Step 2: Create Workflow File

Create `src/mastra/workflows/{workflow-name}.ts`:

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const step1 = createStep({
  id: 'step-1',
  description: 'First step that processes input',
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData }) => {
    // inputData holds the workflow input or previous step's output
    return { result: `processed: ${inputData.input}` };
  },
});

export const myWorkflow = createWorkflow({
  id: 'my-workflow',
  description: 'Description of what this workflow does',
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
})
  .then(step1)
  .commit();
```

### Step 3: Register Workflow

Update `src/mastra/index.ts`:

```typescript
import { myWorkflow } from './workflows/my-workflow';

export const mastra = new Mastra({
  workflows: {
    myWorkflow,
  },
});
```

### Step 4: Validate

```bash
npx tsc --noEmit
```

## The Step Execute Function Signature

Workflow step `execute` receives a **single destructured params object** (different from tool `execute`, which takes two positional args):

```typescript
execute: async ({ inputData, requestContext, mastra, runId, retryCount }) => {
  // inputData      — your Zod inputSchema fields from the previous step (or workflow input)
  // requestContext — per-request data set at run.start() (OAuth tokens, user IDs, etc.)
  // mastra         — access to registered agents, tools, storage
  // runId          — current run ID
  // retryCount     — how many times this step has been retried
}
```

| Property | Description |
|---|---|
| `inputData` | Output from the previous step (or initial workflow input for first step) |
| `requestContext` | `RequestContext` — set by caller via `run.start({ requestContext })` |
| `mastra` | `Mastra` instance — access agents, tools, storage |
| `runId` | Current workflow run ID |
| `retryCount` | Number of retries so far |
| `suspend(payload)` | Suspend the workflow (human-in-the-loop) |
| `bail(result)` | Exit the workflow early with a result |

## Data Flow & Context API

### Automatic Data Flow

Each step's output automatically becomes the next step's input via `inputData`:

```typescript
// Step 1: Returns data
const step1 = createStep({
  id: 'fetch',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ userData: z.object({}) }),
  execute: async ({ inputData }) => {
    const data = await fetchUserData(inputData.userId);
    return { userData: data }; // flows to step2.inputData
  },
});

// Step 2: Receives step1's output as inputData
const step2 = createStep({
  id: 'process',
  inputSchema: z.object({ userData: z.object({}) }),
  outputSchema: z.object({ processedData: z.object({}) }),
  execute: async ({ inputData }) => {
    return { processedData: processData(inputData.userData) };
  },
});
```

### requestContext for External Data

`requestContext` is separate from the data flow and carries per-request values like OAuth tokens. It's the same `RequestContext` class used by tools and agents.

```typescript
import { RequestContext } from '@mastra/core/request-context';

const step = createStep({
  id: 'api-call',
  inputSchema: z.object({ messageId: z.string() }),
  outputSchema: z.object({ data: z.object({}) }),
  execute: async ({ inputData, requestContext }) => {
    // Get OAuth token set by the caller
    const token = requestContext.get<string>('token');
    if (!token) throw new Error('No OAuth token in requestContext');

    const response = await fetch(`/api/messages/${inputData.messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return { data: await response.json() };
  },
});
```

**Setting requestContext when calling the workflow:**
```typescript
import { RequestContext } from '@mastra/core/request-context';

const requestContext = new RequestContext();
requestContext.set('token', oauthToken);

const run = await workflow.createRun();
const result = await run.start({ inputData: { ... }, requestContext });
```

### Accessing Mastra Instance

```typescript
const step = createStep({
  id: 'use-agent',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('summarizer');
    const result = await agent.generate(`Summarize: ${inputData.text}`);
    return { summary: result.text };
  },
});
```

## Code Templates

### Template 1: Basic Linear Workflow

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const step1 = createStep({
  id: 'step-1',
  description: 'First step',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ step1Result: z.string() }),
  execute: async ({ inputData }) => {
    return { step1Result: `processed: ${inputData.input}` };
  },
});

const step2 = createStep({
  id: 'step-2',
  description: 'Second step',
  inputSchema: z.object({ step1Result: z.string() }),
  outputSchema: z.object({ step2Result: z.string() }),
  execute: async ({ inputData }) => {
    return { step2Result: `final: ${inputData.step1Result}` };
  },
});

export const basicWorkflow = createWorkflow({
  id: 'basic-workflow',
  description: 'A basic linear workflow',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ step2Result: z.string() }),
})
  .then(step1)
  .then(step2)
  .commit();
```

### Template 2: Data Processing Pipeline (ETL)

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const extractStep = createStep({
  id: 'extract',
  description: 'Extract data from source',
  inputSchema: z.object({
    dataSource: z.string(),
    filters: z.record(z.any()).optional(),
  }),
  outputSchema: z.object({
    rawData: z.array(z.any()),
    extractedAt: z.string(),
    recordCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const rawData = await fetchData(inputData.dataSource, inputData.filters);
    return {
      rawData,
      extractedAt: new Date().toISOString(),
      recordCount: rawData.length,
    };
  },
});

const transformStep = createStep({
  id: 'transform',
  description: 'Transform and clean data',
  inputSchema: z.object({
    rawData: z.array(z.any()),
    extractedAt: z.string(),
    recordCount: z.number(),
  }),
  outputSchema: z.object({
    transformedData: z.array(z.any()),
    transformedCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const transformedData = inputData.rawData.map(record => ({
      ...record,
      processed: true,
      processedAt: new Date().toISOString(),
    }));
    return { transformedData, transformedCount: transformedData.length };
  },
});

const loadStep = createStep({
  id: 'load',
  description: 'Load data to destination',
  inputSchema: z.object({
    transformedData: z.array(z.any()),
    transformedCount: z.number(),
  }),
  outputSchema: z.object({
    loaded: z.boolean(),
    loadedAt: z.string(),
    recordsLoaded: z.number(),
  }),
  execute: async ({ inputData }) => {
    await saveToDestination(inputData.transformedData);
    return {
      loaded: true,
      loadedAt: new Date().toISOString(),
      recordsLoaded: inputData.transformedData.length,
    };
  },
});

export const dataPipeline = createWorkflow({
  id: 'data-pipeline',
  description: 'ETL pipeline for data processing',
  inputSchema: z.object({
    dataSource: z.string(),
    filters: z.record(z.any()).optional(),
  }),
  outputSchema: z.object({
    loaded: z.boolean(),
    loadedAt: z.string(),
    recordsLoaded: z.number(),
  }),
})
  .then(extractStep)
  .then(transformStep)
  .then(loadStep)
  .commit();
```

### Template 3: Email Summarization Workflow (OAuth + AI)

A real-world example that fetches an email with an OAuth token, converts HTML to text, and summarizes it with an AI agent:

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch email body using OAuth token from requestContext
const fetchMessageStep = createStep({
  id: 'fetch-message',
  description: 'Fetch full message body from the mail API',
  inputSchema: z.object({
    mailboxId: z.string(),
    messageId: z.string(),
  }),
  outputSchema: z.object({
    messageBody: z.object({
      text: z.string().optional(),
      html: z.string().optional(),
    }),
    fetchedAt: z.string(),
  }),
  execute: async ({ inputData, requestContext }) => {
    // OAuth token is passed via requestContext.set('token', ...) at run.start()
    const token = requestContext.get<string>('token');
    if (!token) throw new Error('OAuth token not found in requestContext');

    const { mailboxId, messageId } = inputData;
    const response = await fetch(
      `/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`,
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch message: ${response.status}`);

    const data = await response.json();
    return { messageBody: data.result.simpleBody, fetchedAt: new Date().toISOString() };
  },
});

// Step 2: Convert HTML to plain text (no external calls needed)
const convertHtmlToTextStep = createStep({
  id: 'convert-html-to-text',
  description: 'Convert HTML email body to plain text',
  inputSchema: z.object({
    messageBody: z.object({
      text: z.string().optional(),
      html: z.string().optional(),
    }),
    fetchedAt: z.string(),
  }),
  outputSchema: z.object({
    plainText: z.string(),
    conversionMethod: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { messageBody } = inputData;

    if (messageBody.text?.trim()) {
      return { plainText: messageBody.text, conversionMethod: 'direct' };
    }

    if (messageBody.html) {
      let text = messageBody.html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      return { plainText: text, conversionMethod: 'html-strip' };
    }

    return { plainText: '', conversionMethod: 'none' };
  },
});

// Step 3: Summarize using a registered Mastra agent
const summarizeEmailStep = createStep({
  id: 'summarize-email',
  description: 'Generate AI summary of email content',
  inputSchema: z.object({
    plainText: z.string(),
    conversionMethod: z.string(),
  }),
  outputSchema: z.object({
    summary: z.string(),
    status: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData.plainText.trim()) {
      return { summary: 'No content to summarize.', status: 'empty' };
    }

    const agent = mastra.getAgent('emailSummarizer');
    if (!agent) throw new Error('emailSummarizer agent not found');

    const result = await agent.generate(
      `Please summarize the following email:\n\n${inputData.plainText}`
    );
    return { summary: result.text, status: 'success' };
  },
});

export const emailSummarizationWorkflow = createWorkflow({
  id: 'email-summarization',
  description: 'Fetch and summarize an email message using AI',
  inputSchema: z.object({
    mailboxId: z.string().describe('The mailbox ID'),
    messageId: z.string().describe('The message ID to summarize'),
  }),
  outputSchema: z.object({
    summary: z.string(),
    status: z.string(),
  }),
})
  .then(fetchMessageStep)
  .then(convertHtmlToTextStep)
  .then(summarizeEmailStep)
  .commit();
```

## Common Patterns

### Pattern 1: Automatic Data Flow

```typescript
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({ userId: z.string(), timestamp: z.string() }),
  execute: async ({ inputData }) => ({
    userId: '123',
    timestamp: new Date().toISOString(),
  }),
});

const step2 = createStep({
  id: 'step-2',
  inputSchema: z.object({ userId: z.string(), timestamp: z.string() }),
  outputSchema: z.object({ done: z.boolean() }),
  execute: async ({ inputData }) => {
    console.log('Using userId:', inputData.userId);
    return { done: true };
  },
});
```

### Pattern 2: requestContext for OAuth Tokens

```typescript
const step = createStep({
  id: 'authenticated-api-call',
  inputSchema: z.object({ apiEndpoint: z.string() }),
  outputSchema: z.object({ data: z.any() }),
  execute: async ({ inputData, requestContext }) => {
    const token  = requestContext.get<string>('token');
    const apiKey = requestContext.get<string>('apiKey');

    const response = await fetch(inputData.apiEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-API-Key': apiKey,
      },
    });
    return { data: await response.json() };
  },
});
```

### Pattern 3: Using Mastra Agents in Workflow Steps

```typescript
const step = createStep({
  id: 'ai-processing',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ analysis: z.string(), summary: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('analyzer');
    const result = await agent.generate(`Analyze this text: ${inputData.text}`);
    return {
      analysis: result.text,
      summary: result.text.slice(0, 100),
    };
  },
});
```

### Pattern 4: Error Handling

```typescript
const step = createStep({
  id: 'safe-step',
  inputSchema: z.object({ data: z.any() }),
  outputSchema: z.object({
    success: z.boolean(),
    result: z.any().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    try {
      const result = await riskyOperation(inputData.data);
      return { success: true, result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
```

### Pattern 5: Conditional Processing

```typescript
const step = createStep({
  id: 'conditional-step',
  inputSchema: z.object({ type: z.enum(['A', 'B']), data: z.any() }),
  outputSchema: z.object({ result: z.string(), skipped: z.boolean().optional() }),
  execute: async ({ inputData }) => {
    if (inputData.type === 'A') return { result: 'Processed as type A', skipped: false };
    if (inputData.type === 'B') return { result: 'Processed as type B', skipped: false };
    return { result: '', skipped: true };
  },
});
```

## Executing Workflows

### From Code (with requestContext)

```typescript
import { mastra } from '@/src/mastra';
import { RequestContext } from '@mastra/core/request-context';

// Get workflow
const workflow = mastra.getWorkflow('myWorkflow');

// Set per-request data like OAuth tokens
const requestContext = new RequestContext();
requestContext.set('token', userOAuthToken);
requestContext.set('apiKey', apiKey);

// Create a run, then start it with inputData + requestContext
const run = await workflow.createRun();
const result = await run.start({
  inputData: { input: 'data', userId: '123' },
  requestContext,
});

console.log('Status:', result.status);   // 'success' | 'failed' | 'suspended'
console.log('Result:', result.result);
```

### From API Route (Next.js)

```typescript
// app/api/workflows/summarize-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RequestContext } from '@mastra/core/request-context';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mailboxId, messageId } = body;

    // Extract OAuth token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Set token in requestContext — steps access it via requestContext.get('token')
    const requestContext = new RequestContext();
    requestContext.set('token', token);

    const workflow = mastra.getWorkflow('emailSummarizationWorkflow');
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 500 });
    }

    const run = await workflow.createRun();
    const workflowResult = await run.start({
      inputData: { mailboxId, messageId },
      requestContext,
    });

    if (workflowResult.status !== 'success') {
      throw new Error(`Workflow failed with status: ${workflowResult.status}`);
    }

    return NextResponse.json({ success: true, data: workflowResult.result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Fire-and-Forget (background execution)

```typescript
const run = await workflow.createRun();
const { runId } = await run.startAsync({
  inputData: { ... },
  requestContext,
});
// Returns immediately; workflow runs in background
console.log('Started run:', runId);
```

## Validation

1. **File Created**: `ls src/mastra/workflows/{workflow-name}.ts`
2. **Registered**: Check `src/mastra/index.ts` includes workflow
3. **TypeScript**: `npx tsc --noEmit` (no errors)
4. **Retrievable**: `mastra.getWorkflow('workflowName')` returns the workflow

### Quick Test

```typescript
import { mastra } from '@/src/mastra';
import { RequestContext } from '@mastra/core/request-context';

const workflow = mastra.getWorkflow('myWorkflow');
const run = await workflow.createRun();

const result = await run.start({
  inputData: { test: 'data' },
  requestContext: new RequestContext(),
});

console.log('Status:', result.status);
console.log('Result:', result.result);
```

## Troubleshooting

**Issue: Workflow not found when retrieving**
- Solution: Verify workflow is registered in `src/mastra/index.ts` with the **variable name** (e.g., `emailSummarizationWorkflow`), not the string `id`.

**Issue: Input/output schema validation errors**
- Solution: Ensure the output of each step matches the `inputSchema` of the next step.

**Issue: `inputData` is undefined in a step**
- Solution: The previous step must return an object matching this step's `inputSchema`. For the first step, `inputData` comes from `run.start({ inputData: ... })`.

**Issue: `requestContext` value is undefined in step**
- Solution: Ensure you create `new RequestContext()`, call `.set('key', value)` on it, and pass it to `run.start({ requestContext })`. Do not confuse with the old `RuntimeContext` (beta API — removed in 1.x).

**Issue: "Cannot find module '@mastra/core/runtime-context'"**
- Solution: `RuntimeContext` was removed in Mastra 1.x. Use `RequestContext` from `@mastra/core/request-context` instead. Rename all occurrences: `runtimeContext` → `requestContext`.

**Issue: `workflow.createRunAsync is not a function`**
- Solution: In Mastra 1.x the method is `createRun()` (no `Async` suffix). Use `const run = await workflow.createRun()` then `run.start()`.

**Issue: Agent not found in workflow step**
- Solution: Verify agent is registered in the Mastra instance. Use `mastra.getAgent('agentId')` with the correct agent ID.

**Issue: Workflow fails with `status: 'failed'`**
- Solution: Check console logs. Ensure async operations are awaited. Add try-catch blocks in steps and return error states in `outputSchema`.

## Next Steps

1. **Test Execution** — Run workflow with sample data and verify each step
2. **Add Error Handling** — Wrap risky operations in try-catch blocks
3. **Create API Route** — Build Next.js API route to trigger from frontend
4. **Integrate Agents** — Use Mastra agents in workflow steps for AI-powered processing

## Important Notes

- **Step execute signature**: Single destructured object `{ inputData, requestContext, mastra, ... }` — not two positional args like tool `execute`.
- **Automatic Data Flow**: Each step's output automatically becomes the next step's `inputData`. Design schemas accordingly.
- **requestContext** (not runtimeContext): Pass per-request data (OAuth tokens, user IDs) via `RequestContext` from `@mastra/core/request-context`. `RuntimeContext` was a beta API removed in Mastra 1.x.
- **createRun()**: Use `workflow.createRun()` (not `createRunAsync()`). Then call `run.start({ inputData, requestContext })`.
- **run.start() result**: Returns `{ status: 'success' | 'failed' | 'suspended', result: ... }`.
- **run.startAsync()**: Fire-and-forget version — returns `{ runId }` immediately and runs in background.
- **Step Order**: Steps execute in the order they're chained with `.then()`.
- **Schema Validation**: Zod schemas validate input/output at each step.
- **Mastra Access**: The `mastra` property in steps gives access to registered agents, tools, and storage.
- **requestContext vs tool context**: In workflows, use `{ requestContext }` from the destructured params. In tools, use `context.requestContext` from the second positional arg. Same `RequestContext` class, different access pattern.
