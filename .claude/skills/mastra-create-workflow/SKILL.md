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

This skill creates workflows in Mastra. Workflows are orchestrated sequences of steps that execute in order, passing data between steps through runtime context. Workflows are ideal for multi-step processes, data pipelines, and complex automation tasks.

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
- Executes a function that receives input data from the previous step
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
    // inputData is the workflow input or previous step's output
    const { input } = inputData;
    // Process and return data
    return { result: `processed: ${input}` };
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

Run TypeScript check:

```bash
npx tsc --noEmit
```

## Data Flow & Context API

Mastra workflows use **automatic data flow** between steps. Each step's output becomes the next step's input.

### Automatic Data Flow

```typescript
// Step 1: Returns data
const step1 = createStep({
  id: 'fetch',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ userData: z.object({}) }),
  execute: async ({ inputData }) => {
    const { userId } = inputData;
    const data = await fetchUserData(userId);
    return { userData: data }; // Automatically flows to next step
  },
});

// Step 2: Receives step1's output as inputData
const step2 = createStep({
  id: 'process',
  inputSchema: z.object({ userData: z.object({}) }),
  outputSchema: z.object({ processedData: z.object({}) }),
  execute: async ({ inputData }) => {
    const { userData } = inputData; // This is step1's output
    const processed = processData(userData);
    return { processedData: processed };
  },
});
```

### Runtime Context for External Data

Runtime context is separate from the data flow and used for passing external values (like OAuth tokens):

```typescript
const step = createStep({
  id: 'api-call',
  inputSchema: z.object({ messageId: z.string() }),
  outputSchema: z.object({ data: z.object({}) }),
  execute: async ({ inputData, runtimeContext }) => {
    const { messageId } = inputData;

    // Get external data from runtime context
    const token = runtimeContext.get('oauthToken');

    const response = await fetch(`/api/messages/${messageId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return { data: await response.json() };
  },
});
```

### Accessing Mastra Instance

Use the `mastra` parameter to access agents, tools, and storage:

```typescript
const step = createStep({
  id: 'use-agent',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const { text } = inputData;

    // Get an agent
    const agent = mastra.getAgent('summarizer');
    const result = await agent.generate(`Summarize: ${text}`);

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
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    step1Result: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log('Step 1 executing with:', inputData);
    return { step1Result: 'data from step 1' };
  },
});

const step2 = createStep({
  id: 'step-2',
  description: 'Second step',
  inputSchema: z.object({
    step1Result: z.string(),
  }),
  outputSchema: z.object({
    step2Result: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log('Step 2 using:', inputData.step1Result);
    return { step2Result: 'data from step 2' };
  },
});

export const basicWorkflow = createWorkflow({
  id: 'basic-workflow',
  description: 'A basic linear workflow',
  inputSchema: z.object({
    input: z.string(),
  }),
  outputSchema: z.object({
    step2Result: z.string(),
  }),
})
  .then(step1)
  .then(step2)
  .commit();
```

### Template 2: Data Processing Pipeline (ETL)

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Extract data
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
    const { dataSource, filters } = inputData;

    console.log(`Extracting from ${dataSource}`);
    const rawData = await fetchData(dataSource, filters);

    return {
      rawData,
      extractedAt: new Date().toISOString(),
      recordCount: rawData.length,
    };
  },
});

// Step 2: Transform data
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
    const { rawData } = inputData;

    console.log(`Transforming ${rawData.length} records`);
    const transformedData = rawData.map(record => ({
      ...record,
      processed: true,
      processedAt: new Date().toISOString(),
    }));

    return {
      transformedData,
      transformedCount: transformedData.length,
    };
  },
});

// Step 3: Load data
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
    const { transformedData } = inputData;

    console.log(`Loading ${transformedData.length} records`);
    await saveToDestination(transformedData);

    return {
      loaded: true,
      loadedAt: new Date().toISOString(),
      recordsLoaded: transformedData.length,
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

### Template 3: Email Summarization Workflow (Real-World Example)

This is a real working example from a production mail application that fetches, processes, and summarizes emails using AI:

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Fetch full message body from Yahoo Mail API
const fetchMessageStep = createStep({
  id: 'fetch-message',
  description: 'Fetch full message body from Yahoo Mail API',
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
  execute: async ({ runtimeContext, inputData }) => {
    const { mailboxId, messageId } = inputData;

    // Get OAuth token from runtime context
    const token = runtimeContext.get('oauthToken');
    if (!token) {
      throw new Error('OAuth token not found in runtime context');
    }

    // Fetch the message
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/proxy/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch message: ${response.status}`);
    }

    const data = await response.json();
    return {
      messageBody: data.result.simpleBody,
      fetchedAt: new Date().toISOString(),
    };
  },
});

// Step 2: Convert HTML to plain text
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

    // If text is available, use it directly
    if (messageBody.text && messageBody.text.trim()) {
      return {
        plainText: messageBody.text,
        conversionMethod: 'direct',
      };
    }

    // Otherwise, convert HTML to text
    if (messageBody.html) {
      // Simple HTML to text conversion
      let text = messageBody.html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/<br\s*\/?>/gi, '\n');
      text = text.replace(/<[^>]+>/g, '');
      text = text.trim();

      return {
        plainText: text,
        conversionMethod: 'html-strip',
      };
    }

    return {
      plainText: '',
      conversionMethod: 'none',
    };
  },
});

// Step 3: Summarize email using AI agent
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
    const { plainText } = inputData;

    if (!plainText || plainText.trim().length === 0) {
      return {
        summary: 'No content available to summarize.',
        status: 'empty',
      };
    }

    // Get the email summarizer agent
    const agent = mastra.getAgent('emailSummarizer');
    if (!agent) {
      throw new Error('emailSummarizer agent not found');
    }

    // Generate summary
    const result = await agent.generate(
      `Please summarize the following email:\n\n${plainText}`
    );

    return {
      summary: result.text,
      status: 'success',
    };
  },
});

export const emailSummarizationWorkflow = createWorkflow({
  id: 'email-summarization',
  description: 'Fetch and summarize email messages using AI',
  inputSchema: z.object({
    mailboxId: z.string().describe('The Yahoo Mail mailbox ID'),
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
// Data flows automatically from one step to the next
const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({ input: z.string() }),
  outputSchema: z.object({
    userId: z.string(),
    timestamp: z.string(),
  }),
  execute: async ({ inputData }) => {
    // Return data for next step
    return {
      userId: '123',
      timestamp: new Date().toISOString(),
    };
  },
});

const step2 = createStep({
  id: 'step-2',
  inputSchema: z.object({
    userId: z.string(),
    timestamp: z.string(),
  }),
  outputSchema: z.object({ done: z.boolean() }),
  execute: async ({ inputData }) => {
    // Automatically receives step1's output
    console.log('Using data:', inputData.userId);
    return { done: true };
  },
});
```

### Pattern 2: Using Runtime Context for External Data

```typescript
const step = createStep({
  id: 'authenticated-api-call',
  inputSchema: z.object({ apiEndpoint: z.string() }),
  outputSchema: z.object({ data: z.any() }),
  execute: async ({ inputData, runtimeContext }) => {
    // Get external data like OAuth tokens
    const token = runtimeContext.get('oauthToken');
    const apiKey = runtimeContext.get('apiKey');

    const response = await fetch(inputData.apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': apiKey,
      },
    });

    return { data: await response.json() };
  },
});
```

### Pattern 3: Using Mastra Agents in Workflows

```typescript
const step = createStep({
  id: 'ai-processing',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({
    analysis: z.string(),
    summary: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    // Access registered agents
    const agent = mastra.getAgent('analyzer');

    const result = await agent.generate(
      `Analyze this text: ${inputData.text}`
    );

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
      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error('Step failed:', error);
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
  inputSchema: z.object({
    type: z.enum(['A', 'B']),
    data: z.any(),
  }),
  outputSchema: z.object({
    result: z.string(),
    skipped: z.boolean().optional(),
  }),
  execute: async ({ inputData }) => {
    if (inputData.type === 'A') {
      // Process type A
      return { result: 'Processed as type A', skipped: false };
    } else if (inputData.type === 'B') {
      // Process type B
      return { result: 'Processed as type B', skipped: false };
    } else {
      // Skip processing
      return { result: '', skipped: true };
    }
  },
});
```

## Executing Workflows

### From Code (with Runtime Context)

```typescript
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

// Get workflow
const workflow = mastra.getWorkflow('myWorkflow');

// Create runtime context for external data (like OAuth tokens)
const runtimeContext = new RuntimeContext();
runtimeContext.set('oauthToken', userToken);
runtimeContext.set('apiKey', apiKey);

// Create a run
const run = await workflow.createRunAsync();

// Execute with input data and runtime context
const result = await run.start({
  inputData: {
    input: 'data',
    userId: '123',
  },
  runtimeContext,
});

console.log('Workflow result:', result);
```

### From API Route (Real-World Example)

```typescript
// app/api/workflows/summarize-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mailboxId, messageId } = body;

    // Get OAuth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create runtime context and set OAuth token
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('oauthToken', token);

    // Get and execute the workflow
    const workflow = mastra.getWorkflow('emailSummarizationWorkflow');
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 500 }
      );
    }

    const run = await workflow.createRunAsync();
    const workflowResult = await run.start({
      inputData: { mailboxId, messageId },
      runtimeContext,
    });

    if (workflowResult.status !== 'success') {
      throw new Error(`Workflow failed: ${workflowResult.status}`);
    }

    return NextResponse.json({
      success: true,
      data: workflowResult.result,
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

## Validation

Check workflow is working:

1. **File Created**: `ls src/mastra/workflows/{workflow-name}.ts`
2. **Registered**: Check `src/mastra/index.ts` includes workflow
3. **TypeScript**: `npx tsc --noEmit` (no errors)
4. **Retrievable**: Workflow can be accessed via `mastra.getWorkflow('workflowName')`

### Quick Test

```typescript
import { mastra } from '@/src/mastra';
import { RuntimeContext } from '@mastra/core/runtime-context';

const workflow = mastra.getWorkflow('myWorkflow');
const run = await workflow.createRunAsync();

const result = await run.start({
  inputData: { test: 'data' },
  runtimeContext: new RuntimeContext(),
});

console.log('Status:', result.status);
console.log('Result:', result.result);
```

## Troubleshooting

**Issue: Workflow not found when retrieving**
- Solution: Verify workflow is registered in `src/mastra/index.ts` with correct name. Use the workflow variable name (e.g., `emailSummarizationWorkflow`), not the `id`.

**Issue: Input/output schema validation errors**
- Solution: Ensure the output of each step matches the inputSchema of the next step. Check Zod schema definitions.

**Issue: inputData is undefined in step**
- Solution: Make sure the previous step returns data that matches this step's inputSchema. For the first step, inputData comes from the workflow's initial input.

**Issue: Step executes but data isn't passed to next step**
- Solution: Verify you're returning an object from the step's execute function that matches the outputSchema.

**Issue: TypeScript error "Cannot find module '@mastra/core/workflows'"**
- Solution: Install dependencies: `npm install @mastra/core@latest`

**Issue: Agent not found in workflow step**
- Solution: Verify agent is registered in Mastra instance at `src/mastra/index.ts`. Use `mastra.getAgent('agentId')` with the correct agent ID.

**Issue: Runtime context value is undefined**
- Solution: Ensure you create a RuntimeContext and set values before passing it to `run.start()`. Example: `runtimeContext.set('key', value)`.

**Issue: Workflow fails with "status: error"**
- Solution: Check console logs for error messages. Ensure all async operations are properly awaited. Add try-catch blocks in steps.

## Next Steps

After creating a workflow:

1. **Test Execution** - Run workflow with sample data and verify each step executes correctly
2. **Add Error Handling** - Wrap risky operations in try-catch blocks
3. **Create API Route** - Build Next.js API route to trigger workflow from frontend
4. **Monitor Logs** - Add console.logs to track data flow between steps
5. **Integrate Agents** - Use Mastra agents in workflow steps for AI-powered processing

## Important Notes

- **Automatic Data Flow**: Each step's output automatically becomes the next step's input. Design your schemas accordingly.
- **Step Order**: Steps execute in the order they're chained with `.then()`
- **Runtime Context**: Use `runtimeContext` for external data like OAuth tokens, not for step-to-step data flow
- **Schema Validation**: Zod schemas validate input/output at each step, ensuring type safety
- **Workflow Execution**: Use `workflow.createRunAsync()` then `run.start()` to execute workflows
- **Mastra Access**: The `mastra` parameter in steps provides access to registered agents, tools, and storage
- **Type Safety**: Define proper Zod schemas for compile-time and runtime type checking
- **Error Handling**: Implement try-catch blocks in steps and return error states in outputSchema
- **Testing**: Test workflows with various inputs to ensure proper data flow and error handling
- **API Integration**: See Template 3 for a real-world example of workflow execution from a Next.js API route
