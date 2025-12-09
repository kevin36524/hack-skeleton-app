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
- Has a unique ID
- Executes a function with access to runtime context
- Can access trigger data and previous step results
- Returns data for subsequent steps

### Step 2: Create Workflow File

Create `src/mastra/workflows/{workflow-name}.ts`:

```typescript
import { Step, Workflow } from '@mastra/core/workflow';

const step1 = new Step({
  id: 'step-1',
  execute: async ({ context }) => {
    // Access trigger data
    const input = context.triggerData;
    // Process and return data
    return { result: 'data' };
  },
});

export const myWorkflow = new Workflow({
  name: 'my-workflow',
  triggerSchema: {
    type: 'object',
    properties: {
      // Define input schema
    },
  },
})
  .step(step1)
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

## Runtime Context API

The runtime context is the core feature that allows data flow between workflow steps.

### Context Properties

**`context.triggerData`** - Initial workflow input data
```typescript
const step = new Step({
  id: 'my-step',
  execute: async ({ context }) => {
    const input = context.triggerData;
    // Use initial workflow input
  },
});
```

**`context.stepResults`** - Results from previous steps
```typescript
const step = new Step({
  id: 'my-step',
  execute: async ({ context }) => {
    // Access specific step result
    const previousData = context.stepResults['previous-step-id'];

    // Use data from previous step
    const value = previousData?.someField;
  },
});
```

**`context.runId`** - Unique identifier for this workflow execution
```typescript
const step = new Step({
  id: 'my-step',
  execute: async ({ context }) => {
    console.log(`Execution ID: ${context.runId}`);
  },
});
```

**`context.workflowId`** - Identifier for the workflow definition
```typescript
const step = new Step({
  id: 'my-step',
  execute: async ({ context }) => {
    console.log(`Workflow: ${context.workflowId}`);
  },
});
```

**`context.mastra`** - Access to Mastra instance
```typescript
const step = new Step({
  id: 'my-step',
  execute: async ({ context, mastra }) => {
    // Both are available
    const agent = mastra.getAgent('my-agent');
  },
});
```

### Data Flow Pattern

```typescript
// Step 1: Fetch data
const fetchStep = new Step({
  id: 'fetch',
  execute: async ({ context }) => {
    const { userId } = context.triggerData;
    const data = await fetchUserData(userId);
    return { userData: data }; // Available to next steps
  },
});

// Step 2: Process data
const processStep = new Step({
  id: 'process',
  execute: async ({ context }) => {
    // Access data from previous step
    const { userData } = context.stepResults['fetch'];
    const processed = processData(userData);
    return { processedData: processed };
  },
});

// Step 3: Save results
const saveStep = new Step({
  id: 'save',
  execute: async ({ context }) => {
    // Access data from any previous step
    const { processedData } = context.stepResults['process'];
    const { userData } = context.stepResults['fetch'];

    await saveData(processedData);
    return { saved: true };
  },
});
```

## Code Templates

### Template 1: Basic Linear Workflow

```typescript
import { Step, Workflow } from '@mastra/core/workflow';

const step1 = new Step({
  id: 'step-1',
  description: 'First step',
  execute: async ({ context }) => {
    const input = context.triggerData;
    console.log('Step 1 executing with:', input);
    return { step1Result: 'data from step 1' };
  },
});

const step2 = new Step({
  id: 'step-2',
  description: 'Second step',
  execute: async ({ context }) => {
    const step1Data = context.stepResults['step-1'];
    console.log('Step 2 using:', step1Data);
    return { step2Result: 'data from step 2' };
  },
});

export const basicWorkflow = new Workflow({
  name: 'basic-workflow',
  triggerSchema: {
    type: 'object',
    properties: {
      input: { type: 'string' },
    },
    required: ['input'],
  },
})
  .step(step1)
  .step(step2)
  .commit();
```

### Template 2: Data Processing Pipeline

```typescript
import { Step, Workflow } from '@mastra/core/workflow';

interface PipelineInput {
  dataSource: string;
  filters?: Record<string, any>;
}

// Step 1: Extract data
const extractStep = new Step({
  id: 'extract',
  description: 'Extract data from source',
  execute: async ({ context }) => {
    const { dataSource, filters } = context.triggerData as PipelineInput;

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
const transformStep = new Step({
  id: 'transform',
  description: 'Transform and clean data',
  execute: async ({ context }) => {
    const extractResult = context.stepResults['extract'];
    const { rawData } = extractResult;

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
const loadStep = new Step({
  id: 'load',
  description: 'Load data to destination',
  execute: async ({ context }) => {
    const transformResult = context.stepResults['transform'];
    const { transformedData } = transformResult;

    console.log(`Loading ${transformedData.length} records`);
    await saveToDestination(transformedData);

    return {
      loaded: true,
      loadedAt: new Date().toISOString(),
      recordsLoaded: transformedData.length,
    };
  },
});

export const dataPipeline = new Workflow({
  name: 'data-pipeline',
  triggerSchema: {
    type: 'object',
    properties: {
      dataSource: { type: 'string' },
      filters: { type: 'object' },
    },
    required: ['dataSource'],
  },
})
  .step(extractStep)
  .step(transformStep)
  .step(loadStep)
  .commit();
```

### Template 3: Email Processing Workflow

```typescript
import { Step, Workflow } from '@mastra/core/workflow';

interface EmailInput {
  emailId: string;
  userId: string;
  priority?: 'low' | 'medium' | 'high';
}

// Step 1: Fetch email
const fetchEmailStep = new Step({
  id: 'fetch-email',
  description: 'Fetch email details',
  execute: async ({ context }) => {
    const { emailId, userId } = context.triggerData as EmailInput;

    const email = await fetchEmail(emailId);
    return {
      email,
      fetchedAt: new Date().toISOString(),
    };
  },
});

// Step 2: Analyze with AI
const analyzeStep = new Step({
  id: 'analyze',
  description: 'Analyze email content',
  execute: async ({ context, mastra }) => {
    const { email } = context.stepResults['fetch-email'];
    const { priority } = context.triggerData as EmailInput;

    const agent = mastra.getAgent('email-analyzer');
    const analysis = await agent.generate(
      `Analyze this email: ${email.subject}\n\n${email.body}`
    );

    return {
      analysis: analysis.text,
      sentiment: 'neutral',
      urgency: priority === 'high' ? 9 : 5,
    };
  },
});

// Step 3: Generate response
const respondStep = new Step({
  id: 'respond',
  description: 'Generate appropriate response',
  execute: async ({ context }) => {
    const { email } = context.stepResults['fetch-email'];
    const { analysis, urgency } = context.stepResults['analyze'];

    let response = '';
    if (urgency > 7) {
      response = 'High priority - requires immediate attention';
    } else {
      response = 'Standard processing';
    }

    return {
      response,
      summary: {
        subject: email.subject,
        urgency,
        analysis,
      },
    };
  },
});

export const emailProcessor = new Workflow({
  name: 'email-processor',
  triggerSchema: {
    type: 'object',
    properties: {
      emailId: { type: 'string' },
      userId: { type: 'string' },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
    },
    required: ['emailId', 'userId'],
  },
})
  .step(fetchEmailStep)
  .step(analyzeStep)
  .step(respondStep)
  .commit();
```

### Template 4: Workflow with Agent Integration

```typescript
import { Step, Workflow } from '@mastra/core/workflow';

const analyzeWithAgentStep = new Step({
  id: 'analyze-with-agent',
  description: 'Use AI agent for analysis',
  execute: async ({ context, mastra }) => {
    const input = context.triggerData;

    // Get agent from Mastra instance
    const agent = mastra.getAgent('analyzer-agent');

    // Use agent to process data
    const result = await agent.generate(
      `Analyze this data: ${JSON.stringify(input)}`,
      {
        memory: {
          resource: context.runId,
          thread: context.workflowId,
        },
      }
    );

    return {
      analysis: result.text,
      analyzedAt: new Date().toISOString(),
    };
  },
});

export const agentWorkflow = new Workflow({
  name: 'agent-workflow',
  triggerSchema: {
    type: 'object',
    properties: {
      data: { type: 'string' },
    },
  },
})
  .step(analyzeWithAgentStep)
  .commit();
```

### Template 5: Multi-Branch Workflow

```typescript
import { Step, Workflow } from '@mastra/core/workflow';

// Step 1: Classify input
const classifyStep = new Step({
  id: 'classify',
  description: 'Classify input type',
  execute: async ({ context }) => {
    const { type } = context.triggerData;
    return { classification: type };
  },
});

// Step 2A: Handle type A
const handleTypeA = new Step({
  id: 'handle-type-a',
  description: 'Handle type A processing',
  execute: async ({ context }) => {
    const { classification } = context.stepResults['classify'];
    if (classification !== 'A') return { skipped: true };

    // Process type A
    return { result: 'Processed as type A' };
  },
});

// Step 2B: Handle type B
const handleTypeB = new Step({
  id: 'handle-type-b',
  description: 'Handle type B processing',
  execute: async ({ context }) => {
    const { classification } = context.stepResults['classify'];
    if (classification !== 'B') return { skipped: true };

    // Process type B
    return { result: 'Processed as type B' };
  },
});

// Step 3: Merge results
const mergeStep = new Step({
  id: 'merge',
  description: 'Merge processing results',
  execute: async ({ context }) => {
    const resultA = context.stepResults['handle-type-a'];
    const resultB = context.stepResults['handle-type-b'];

    const finalResult = resultA?.result || resultB?.result || 'No result';
    return { finalResult };
  },
});

export const multiBranchWorkflow = new Workflow({
  name: 'multi-branch',
  triggerSchema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['A', 'B'] },
    },
  },
})
  .step(classifyStep)
  .step(handleTypeA)
  .step(handleTypeB)
  .step(mergeStep)
  .commit();
```

## Common Patterns

### Pattern 1: Accessing Trigger Data

```typescript
const step = new Step({
  id: 'use-trigger-data',
  execute: async ({ context }) => {
    // All initial workflow input is in triggerData
    const input = context.triggerData;
    console.log('Workflow started with:', input);
    return { processed: true };
  },
});
```

### Pattern 2: Passing Data Between Steps

```typescript
const step1 = new Step({
  id: 'step-1',
  execute: async ({ context }) => {
    // Return data for next steps
    return {
      userId: '123',
      timestamp: new Date().toISOString(),
    };
  },
});

const step2 = new Step({
  id: 'step-2',
  execute: async ({ context }) => {
    // Access previous step's data
    const step1Data = context.stepResults['step-1'];
    console.log('Using data:', step1Data?.userId);
    return { done: true };
  },
});
```

### Pattern 3: Logging Execution Info

```typescript
const step = new Step({
  id: 'log-execution',
  execute: async ({ context }) => {
    console.log(`Workflow: ${context.workflowId}`);
    console.log(`Run: ${context.runId}`);
    console.log(`Trigger:`, context.triggerData);
    console.log(`Previous steps:`, Object.keys(context.stepResults));
    return { logged: true };
  },
});
```

### Pattern 4: Using Mastra Instance

```typescript
const step = new Step({
  id: 'use-mastra',
  execute: async ({ context, mastra }) => {
    // Access agents
    const agent = mastra.getAgent('my-agent');

    // Access tools
    const tool = mastra.getTool('my-tool');

    // Use storage
    const storage = mastra.getStorage();

    return { completed: true };
  },
});
```

### Pattern 5: Error Handling

```typescript
const step = new Step({
  id: 'safe-step',
  execute: async ({ context }) => {
    try {
      const result = await riskyOperation();
      return { success: true, result };
    } catch (error) {
      console.error('Step failed:', error);
      return {
        success: false,
        error: error.message,
        recoverable: true,
      };
    }
  },
});
```

## Executing Workflows

### From Code

```typescript
import { mastra } from '@/src/mastra';

// Get workflow
const workflow = mastra.getWorkflow('my-workflow');

// Execute with trigger data
const result = await workflow.execute({
  input: 'data',
  userId: '123',
});

console.log('Workflow result:', result);
```

### From API Route

```typescript
// app/api/workflow/route.ts
import { mastra } from '@/src/mastra';

export async function POST(request: Request) {
  const body = await request.json();

  const workflow = mastra.getWorkflow('my-workflow');
  const result = await workflow.execute(body);

  return Response.json(result);
}
```

## Validation

Check workflow is working:

1. **File Created**: `ls src/mastra/workflows/{workflow-name}.ts`
2. **Registered**: Check `src/mastra/index.ts` includes workflow
3. **TypeScript**: `npx tsc --noEmit` (no errors)
4. **Retrievable**: Workflow can be accessed via `mastra.getWorkflow(name)`

### Quick Test

```typescript
import { mastra } from '@/src/mastra';

const workflow = mastra.getWorkflow('my-workflow');
const result = await workflow.execute({ test: 'data' });
console.log(result);
```

## Troubleshooting

**Issue: Workflow name not found when retrieving**
- Solution: Verify workflow is registered in `src/mastra/index.ts` with correct name. Name must match.

**Issue: Cannot access stepResults from previous step**
- Solution: Use the exact step ID from the step definition. Check spelling and case sensitivity.

**Issue: triggerData is undefined**
- Solution: Ensure you're passing data when calling `workflow.execute()`. triggerData is the input to execute().

**Issue: Step executes but data isn't passed to next step**
- Solution: Verify you're returning an object from the step's execute function. Returned data becomes available in stepResults.

**Issue: TypeScript error "Cannot find module '@mastra/core/workflow'"**
- Solution: Install dependencies: `npm install @mastra/core@latest`

**Issue: Agent not found in workflow step**
- Solution: Verify agent is registered in Mastra instance. Use `mastra.getAgent(id)` with correct agent ID.

**Issue: Workflow hangs or doesn't complete**
- Solution: Check all steps return a value. Ensure no infinite loops. Add console.logs to track execution.

**Issue: Context properties are undefined**
- Solution: Access context properties correctly: `context.triggerData`, `context.stepResults`, `context.runId`, `context.workflowId`.

## Next Steps

After creating a workflow:

1. **Test Execution** - Run workflow with sample data and verify each step executes correctly
2. **Add Error Handling** - Wrap risky operations in try-catch blocks
3. **Create API Route** - Build Next.js API route to trigger workflow from frontend
4. **Monitor Logs** - Add console.logs to track data flow between steps
5. **Integrate Agents** - Use Mastra agents in workflow steps for AI-powered processing

## Complete Example: User Onboarding Workflow

Here's a full working example of a workflow that handles user onboarding with multiple steps:

**Workflow File** (`src/mastra/workflows/user-onboarding.ts`):
```typescript
import { Step, Workflow } from '@mastra/core/workflow';

interface OnboardingInput {
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

// Step 1: Create user account
const createAccountStep = new Step({
  id: 'create-account',
  description: 'Create user account in database',
  execute: async ({ context }) => {
    const { email, name, plan } = context.triggerData as OnboardingInput;

    console.log(`Creating account for ${email}`);

    // Simulate account creation
    const userId = `user_${Date.now()}`;
    const account = {
      userId,
      email,
      name,
      plan,
      createdAt: new Date().toISOString(),
    };

    return { account };
  },
});

// Step 2: Send welcome email
const sendWelcomeStep = new Step({
  id: 'send-welcome',
  description: 'Send welcome email to user',
  execute: async ({ context, mastra }) => {
    const { account } = context.stepResults['create-account'];
    const { plan } = context.triggerData as OnboardingInput;

    console.log(`Sending welcome email to ${account.email}`);

    // Use AI agent to generate personalized welcome message
    const agent = mastra.getAgent('email-writer');
    const welcomeMessage = await agent.generate(
      `Write a warm welcome email for a new ${plan} plan user named ${account.name}`
    );

    return {
      emailSent: true,
      message: welcomeMessage.text,
      sentAt: new Date().toISOString(),
    };
  },
});

// Step 3: Setup user workspace
const setupWorkspaceStep = new Step({
  id: 'setup-workspace',
  description: 'Setup initial workspace and resources',
  execute: async ({ context }) => {
    const { account } = context.stepResults['create-account'];
    const { plan } = context.triggerData as OnboardingInput;

    console.log(`Setting up workspace for ${account.userId}`);

    // Configure based on plan
    const resources = {
      free: { storage: '5GB', projects: 3 },
      pro: { storage: '50GB', projects: 10 },
      enterprise: { storage: '500GB', projects: 100 },
    };

    const workspace = {
      workspaceId: `ws_${Date.now()}`,
      userId: account.userId,
      resources: resources[plan],
      setupAt: new Date().toISOString(),
    };

    return { workspace };
  },
});

// Step 4: Log completion
const logCompletionStep = new Step({
  id: 'log-completion',
  description: 'Log onboarding completion',
  execute: async ({ context }) => {
    const { account } = context.stepResults['create-account'];
    const { workspace } = context.stepResults['setup-workspace'];
    const { emailSent } = context.stepResults['send-welcome'];

    const summary = {
      userId: account.userId,
      email: account.email,
      plan: account.plan,
      workspaceId: workspace.workspaceId,
      emailSent,
      completedAt: new Date().toISOString(),
      runId: context.runId,
    };

    console.log('Onboarding complete:', summary);

    return { summary, success: true };
  },
});

export const userOnboardingWorkflow = new Workflow({
  name: 'user-onboarding',
  triggerSchema: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      plan: {
        type: 'string',
        enum: ['free', 'pro', 'enterprise'],
      },
    },
    required: ['email', 'name', 'plan'],
  },
})
  .step(createAccountStep)
  .step(sendWelcomeStep)
  .step(setupWorkspaceStep)
  .step(logCompletionStep)
  .commit();
```

**Register in** `src/mastra/index.ts`:
```typescript
import { userOnboardingWorkflow } from './workflows/user-onboarding';

export const mastra = new Mastra({
  workflows: { userOnboardingWorkflow },
  // ... other config
});
```

**Usage Example**:
```typescript
import { mastra } from '@/src/mastra';

const workflow = mastra.getWorkflow('userOnboardingWorkflow');

const result = await workflow.execute({
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'pro',
});

console.log('Onboarding result:', result);
```

## Important Notes

- **Runtime Context**: All data sharing between steps happens through the context object
- **Step Order**: Steps execute in the order they're added with `.step()`
- **Data Access**: Each step can access `triggerData` and all previous `stepResults`
- **Immutability**: Context is read-only; steps communicate through return values
- **Execution Tracking**: `runId` uniquely identifies each workflow execution
- **Mastra Access**: The `mastra` parameter provides access to agents, tools, and storage
- **Type Safety**: Define TypeScript interfaces for triggerData and step outputs for better type checking
- **Error Recovery**: Implement try-catch in steps and return error state for downstream steps to handle
- **Testing**: Test workflows with various inputs to ensure proper data flow between all steps
