---
name: mastra-create-agent
description: Create an AI agent in an existing Mastra setup
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - AskUserQuestion
---

# Skill: Create a Mastra Agent

## Overview

This skill creates an AI agent in Mastra. Agents are AI-powered decision makers that use language models to reason, respond to prompts, and optionally invoke tools to accomplish tasks.

## When to Use

Use this skill when:
- You want to create an AI agent with specific personality or behavior
- You need an agent to interact with users or perform tasks
- You want to attach tools to an agent for extended capabilities
- You're building conversational or task-oriented AI systems

**Prerequisites:**
- Mastra setup complete (use `mastra-setup` skill first)
- An LLM API key configured (Google Gemini or OpenAI)
- Optional: Tools already created (use `mastra-create-tool` skill)

## How It Works

### Step 1: Define Agent Configuration

Key agent properties:
- **id**: Unique identifier for the agent
- **name**: Display name
- **instructions**: System prompt guiding agent behavior
- **model**: LLM to use (defaults to `google/gemini-2.5-flash-lite`)
- **tools**: Optional dictionary of tools agent can use

### Step 2: Create Agent File

Create `src/mastra/agents/{agent-name}.ts`:

```typescript
import { Agent } from "@mastra/core/agent";

export const myAgent = new Agent({
  id: "my-agent",
  name: "My Agent",
  instructions: "You are a helpful assistant...",
  model: "google/gemini-2.5-flash-lite",
  // tools: { myTool }, // optional
});
```

### Step 3: Register Agent

Update `src/mastra/index.ts`:

```typescript
import { myAgent } from "./agents/my-agent";

export const mastra = new Mastra({
  agents: {
    myAgent,
    // Other agents...
  },
});
```

### Step 4: Validate

Run TypeScript check and test retrieval:

```bash
npx tsc --noEmit
```

Test in a file:
```typescript
import { mastra } from "@/src/mastra";
const agent = mastra.getAgent("myAgent");
```

## Code Templates

### Template 1: Basic Agent (No Tools)

```typescript
import { Agent } from "@mastra/core/agent";

export const helpfulAssistant = new Agent({
  id: "helpful-assistant",
  name: "Helpful Assistant",
  instructions: `You are a helpful, friendly assistant.
Respond concisely and clearly.
Ask clarifying questions if needed.`,
  model: "google/gemini-2.5-flash-lite",
});
```

### Template 2: Specialized Agent

```typescript
import { Agent } from "@mastra/core/agent";

export const codingExpert = new Agent({
  id: "coding-expert",
  name: "Coding Expert",
  instructions: `You are an expert software engineer.
Provide detailed code examples and explanations.
Suggest best practices and optimizations.
Ask about requirements before providing solutions.`,
  model: "openai/gpt-4o-mini",
});
```

### Template 3: Agent with Kimi (Moonshot AI)

Mastra natively supports Kimi via the `moonshotai/` provider prefix. Set `MOONSHOT_API_KEY` in your env.

**Simple usage:**
```typescript
import { Agent } from "@mastra/core/agent";

export const kimiAgent = new Agent({
  id: "kimi-agent",
  name: "Kimi Agent",
  instructions: "You are a helpful assistant.",
  model: "moonshotai/kimi-k2-0711-preview",
});
```

**With custom headers** (e.g. for routing through a specific endpoint):
```typescript
import { Agent } from "@mastra/core/agent";

export const kimiAgent = new Agent({
  id: "kimi-agent",
  name: "Kimi Agent",
  instructions: "You are a helpful assistant.",
  model: {
    url: "https://api.moonshot.ai/anthropic/v1",
    id: "moonshotai/kimi-k2-0711-preview",
    apiKey: process.env.MOONSHOT_API_KEY,
    headers: {
      "X-Custom-Header": "value",
    },
  },
});
```

**Env var:** Add `MOONSHOT_API_KEY=your-key-here` to `.env.local`.

### Template 4: Agent with Tools

```typescript
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";
import { locationTool } from "../tools/location-tool";

export const travelAssistant = new Agent({
  id: "travel-assistant",
  name: "Travel Assistant",
  instructions: `You are a helpful travel planning assistant.
Use the weather tool to check conditions at destinations.
Use the location tool to find places of interest.
Provide personalized travel recommendations.`,
  model: "google/gemini-2.5-flash-lite",
  tools: { weatherTool, locationTool },
});
```

### Template 5: Multi-role Agent

```typescript
import { Agent } from "@mastra/core/agent";

export const contentCreator = new Agent({
  id: "content-creator",
  name: "Content Creator",
  instructions: `You are a versatile content creator.

For blog posts:
- Use clear, engaging language
- Include relevant examples
- Structure with headings and subheadings

For social media:
- Keep it concise and punchy
- Use relevant hashtags
- Adapt tone to platform

Always ask what type of content is needed.`,
  model: "google/gemini-2.5-flash-lite",
});
```

### Template 6: Agent with Memory and Tools

```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { getTransactionsTool } from "../tools/get-transactions-tool";

export const financialAgent = new Agent({
  name: "Financial Assistant Agent",
  instructions: `You are a financial assistant that analyzes transaction data.
- Identify spending patterns and answer questions about transactions
- Keep responses concise and format currency appropriately
- Do not provide investment advice or make assumptions beyond the data
- Use the getTransactions tool to fetch transaction data`,
  model: "openai/gpt-4o-mini",
  tools: { getTransactionsTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./memory.db",
    }),
    options: {
      lastMessages: 20,
    },
  }),
});
```

### Template 7: OAuth Agent with Tools + PostgreSQL Memory (Production)

Use this template when tools need an OAuth token (passed per-request) and you want Postgres-backed persistent memory (e.g., Supabase). This is the pattern used by the mail triage agent.

**Agent file** (`src/mastra/agents/my-agent.ts`):
```typescript
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';
import { readDataTool } from '../tools/read-data';
import { writeDataTool } from '../tools/write-data'; // requireApproval: true

const memory = new Memory({
  storage: new PostgresStore({
    id: 'my-agent-memory',
    connectionString: process.env.DATABASE_URL!,
  }),
  options: {
    lastMessages: 40,
  },
});

export const myAgent = new Agent({
  id: 'my-agent',
  name: 'My Agent',
  model: 'google/gemini-2.0-flash',
  memory,
  instructions: `You are a helpful assistant with access to user data.

WORKFLOW:
1. Use readDataTool to fetch information
2. Analyze and summarize results
3. For ANY write/delete action, explain what you're about to do first
   — the system will pause and ask the user to approve before executing

SAFETY:
- Never perform write operations without explaining your reasoning
- For bulk operations, list what will be affected before acting`,
  tools: {
    readDataTool,
    writeDataTool,  // requireApproval: true — agent will pause for user confirmation
  },
});
```

**Mastra index** (`src/mastra/index.ts`):
```typescript
import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';
import { PinoLogger } from '@mastra/loggers';
import { myAgent } from './agents/my-agent';

export const mastra = new Mastra({
  agents: { myAgent },
  storage: new PostgresStore({
    id: 'mastra-storage',
    connectionString: process.env.DATABASE_URL!,
  }),
  logger: new PinoLogger({ name: 'Mastra', level: 'info' }),
});
```

**API route** (`app/api/agent/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '../../../src/mastra';

const myAgent = mastra.getAgent('myAgent');

export async function POST(req: NextRequest) {
  // 1. Extract OAuth token from Authorization header
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'No auth token' }, { status: 401 });
  }

  const body = await req.json();
  const { message, userId, sessionId } = body;

  // 2. Create RequestContext to securely pass the token to tools
  const requestContext = new RequestContext();
  requestContext.set('token', token);

  // 3. Stream the agent with requestContext + memory context
  const stream = await myAgent.stream(message, {
    requestContext,   // ← injected into every tool call automatically
    memory: {
      resource: userId,    // Identifies the user (for memory lookup)
      thread: sessionId,   // Identifies the conversation thread
    },
  });

  // 4. Stream SSE to client
  return streamAgentResponse(stream);
}

function streamAgentResponse(output: any) {
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      const enqueue = (event: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      const reader = output.fullStream.getReader();
      try {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;

          switch (chunk.type) {
            case 'text-delta':
              enqueue({ type: 'text-delta', textDelta: chunk.payload?.text ?? '' });
              break;

            // Agent wants to run a requireApproval tool — pause and ask user
            case 'tool-call-approval':
              enqueue({
                type: 'tool-call-pending',
                runId: chunk.runId,
                toolName: chunk.payload?.toolName,
                input: chunk.payload?.args ?? {},
              });
              break;

            case 'tool-result':
              enqueue({ type: 'tool-result', toolName: chunk.payload?.toolName, result: chunk.payload?.result });
              break;

            case 'finish':
              enqueue({ type: 'finish', finishReason: chunk.payload?.stepResult?.reason ?? 'stop' });
              break;

            case 'error':
              enqueue({ type: 'error', error: String(chunk.payload?.error ?? 'Unknown error') });
              break;
          }
        }
        controller.close();
      } catch (error) {
        enqueue({ type: 'error', error: error instanceof Error ? error.message : 'Stream error' });
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

## requestContext — Passing Per-Request Data to Tools

`requestContext` is how you securely pass per-request data (OAuth tokens, user IDs, account IDs) from an API route into every tool the agent calls. It's injected automatically by Mastra into the `execute` function's `params` object.

**Key distinction:**
- `requestContext` (from `@mastra/core/request-context`) → used with **agents**
- `runtimeContext` (from `@mastra/core/runtime-context`) → used with **workflows**

```typescript
// In your API route:
import { RequestContext } from '@mastra/core/request-context';

const requestContext = new RequestContext();
requestContext.set('token', oauthToken);       // OAuth Bearer token
requestContext.set('accountId', userAccountId); // Optional user context

await agent.stream(message, { requestContext });

/// In your tool's execute function — context is arg 2, inputData is arg 1:
execute: async (inputData, context) => {
  const token     = context.requestContext?.get<string>('token');
  const accountId = context.requestContext?.get<string>('accountId');
  // inputData contains your Zod schema fields
}
```

**Never store OAuth tokens server-side** — pass them per-request via `requestContext` so each request authenticates as the specific user.

## HITL — Human-in-the-Loop Approval Flow

When a tool has `requireApproval: true`, the agent pauses and waits for user confirmation before executing the tool. This is essential for any write/mutate/delete operation.

### Flow

```
Agent calls requireApproval tool
    ↓
Mastra emits 'tool-call-approval' chunk (with runId, toolName, args)
    ↓
API route sends 'tool-call-pending' SSE event to client
    ↓
Client shows: "Approve or Decline: markAsRead on 5 messages?"
    ↓
User approves → POST /api/agent { action: 'approve', runId }
User declines → POST /api/agent { action: 'decline', runId }
    ↓
API route calls agent.approveToolCall({ runId }) or declineToolCall({ runId })
    ↓
Agent resumes (tool executes, or is skipped)
```

### HITL Handling in API Route

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, userId, sessionId, action, runId } = body;

  // Handle HITL approval
  if (action === 'approve' && runId) {
    const resumed = await myAgent.approveToolCall({ runId });
    return streamAgentResponse(resumed);  // Resume streaming after approval
  }

  // Handle HITL decline
  if (action === 'decline' && runId) {
    await myAgent.declineToolCall({ runId });
    return NextResponse.json({ declined: true });
  }

  // Normal agent invocation
  // ... (token extraction, requestContext setup, agent.stream())
}
```

## SSE Streaming — Chunk Types

When using `agent.stream()`, the `output.fullStream` emits these chunk types:

| Chunk type | Frontend event | Description |
|---|---|---|
| `text-delta` | `text-delta` | Streaming text from the model |
| `tool-call-approval` | `tool-call-pending` | requireApproval tool waiting for user |
| `tool-result` | `tool-result` | Tool finished executing |
| `finish` | `finish` | Agent finished |
| `error` | `error` | Error during generation |

Other chunk types (`step-start`, `step-finish`, `tool-call`, `raw`) are informational and can be ignored by the client.

## Common Patterns

### Pattern 1: Minimal Configuration

```typescript
export const simpleAgent = new Agent({
  id: "simple",
  name: "Simple Agent",
  instructions: "Be helpful.",
  model: "google/gemini-2.5-flash-lite",
});
```

### Pattern 2: Detailed Instructions

```typescript
export const detailedAgent = new Agent({
  id: "detailed",
  name: "Detailed Agent",
  instructions: `You are a specialized assistant with the following traits:
- Trait 1: Description
- Trait 2: Description
- Trait 3: Description

Follow these rules:
1. Rule 1
2. Rule 2

When responding:
- Check the tools available to you
- Use appropriate tools when helpful
- Explain your reasoning`,
  model: "google/gemini-2.5-flash-lite",
  tools: { exampleTool },
});
```

### Pattern 3: Multi-Tool Agent

```typescript
export const multiToolAgent = new Agent({
  id: "multi-tool",
  name: "Multi-Tool Agent",
  instructions: "You have access to multiple tools. Use them strategically.",
  model: "openai/gpt-4o-mini",
  tools: {
    tool1,
    tool2,
    tool3,
  },
});
```

### Pattern 4: Agent with Simple Memory

**⚠️ IMPORTANT**: Avoid circular dependencies by NOT importing `mastra` in agent files. Use dedicated storage instead.

```typescript
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const memoryAgent = new Agent({
  id: "memory-agent",
  name: "Memory Agent",
  instructions: "You remember past conversations. Reference them naturally.",
  model: "google/gemini-2.5-flash-lite",
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra-memory.db",
    }),
    options: {
      lastMessages: 10,
    }
  }),
});
```

## Memory Configuration

Memory allows agents to maintain context across conversations through persistent storage of conversation history and context.

### Installation

First, install the required packages:

```bash
npm install @mastra/memory@latest @mastra/libsql@latest
```

### Basic Memory Setup

**Option 1: Dedicated Storage for Agent (Recommended)**

Attach storage directly to an agent's memory. This avoids circular dependencies and provides clear data isolation:

```typescript
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const myAgent = new Agent({
  // ... other config
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra-memory.db",  // Can use same DB for multiple agents
    }),
    options: {
      lastMessages: 20,
    }
  }),
});
```

**Option 2: PostgreSQL Storage (Production with Supabase)**

For production apps with Postgres (e.g., Supabase):

```typescript
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";

export const myAgent = new Agent({
  // ... other config
  memory: new Memory({
    storage: new PostgresStore({
      id: 'my-agent-memory',
      connectionString: process.env.DATABASE_URL!,
      // Format: postgresql://postgres:password@host:5432/postgres
    }),
    options: {
      lastMessages: 40,
    },
  }),
});
```

**Option 3: Use Mastra Instance Storage (Advanced)**

⚠️ **Warning**: This approach can cause TypeScript circular dependency errors if the agent file imports from `../index`. Only use this if you understand the implications.

```typescript
// In src/mastra/index.ts
import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: "file:./mastra-memory.db",
  }),
  agents: {
    // Your agents...
  },
});

// In agent file (⚠️ Circular dependency risk)
import { Memory } from "@mastra/memory";
import { mastra } from "../index";

export const myAgent = new Agent({
  // ... other config
  memory: new Memory({
    storage: mastra.getStorage(),
    options: {
      lastMessages: 20,
    }
  }),
});
```

### Memory Options

**`lastMessages` (Conversation History)**
- Number of recent messages included in each agent call
- Higher values = more context but more tokens used
- Example: `lastMessages: 20`

**Additional Features:**
- **Working Memory**: Maintains recent context for the agent
- **Semantic Recall**: Retrieves past messages based on semantic meaning (requires vector database setup)

### Storage Providers

**LibSQLStore** (Recommended for development/simple production)
```typescript
import { LibSQLStore } from "@mastra/libsql";

storage: new LibSQLStore({
  url: "file:./memory.db",  // Local SQLite file
  // OR
  url: ":memory:",  // In-memory (data lost on restart)
})
```

**PostgresStore** (Recommended for production with Supabase/Postgres)
```typescript
import { PostgresStore } from "@mastra/pg";

storage: new PostgresStore({
  id: 'agent-memory',
  connectionString: process.env.DATABASE_URL,
  // Format: postgresql://user:password@host:5432/dbname
})
```

### Using Memory: Resource and Thread IDs

Memory requires two identifiers for proper context tracking:
- **`resource`**: Identifies the user or entity (e.g., user ID)
- **`thread`**: Identifies the conversation session (e.g., chat session ID)

**Example Usage:**

```typescript
// Store information
const response = await agent.generate(
  "Remember my favorite color is blue.",
  {
    memory: {
      resource: "user-123",
      thread: "conversation-abc",
    },
  },
);

// Recall information (must use same resource and thread IDs)
const response = await agent.generate(
  "What's my favorite color?",
  {
    memory: {
      resource: "user-123",
      thread: "conversation-abc",
    },
  },
);
```

### Dynamic Memory Configuration

Select different memory configurations based on runtime context:

```typescript
export const adaptiveAgent = new Agent({
  // ... other config
  memory: ({ runtimeContext }) => {
    const userTier = runtimeContext.get("user-tier");

    if (userTier === "enterprise") {
      return new Memory({
        storage: mastra.getStorage(),
        options: { lastMessages: 50 },
      });
    }

    return new Memory({
      storage: mastra.getStorage(),
      options: { lastMessages: 10 },
    });
  },
});
```

## Model Options

### Google Gemini (Recommended for cost)
```typescript
model: "google/gemini-2.5-flash-lite"    // Fast, lightweight (DEFAULT)
model: "google/gemini-2.5-flash"         // More capable
model: "google/gemini-2.5-pro"           // Most capable, higher cost
model: "google/gemini-2.0-flash"         // Fast, good for production
```

### OpenAI (Alternative)
```typescript
model: "openai/gpt-4o-mini"              // Fast, low cost
model: "openai/gpt-4o"                   // More capable
model: "openai/gpt-4-turbo"              // Complex tasks
```

## Validation

Check agent is working:

1. **File Created**: `ls src/mastra/agents/{agent-name}.ts`
2. **Registered**: Check `src/mastra/index.ts` includes agent
3. **TypeScript**: `npx tsc --noEmit` (no errors)
4. **Retrievable**: Agent can be accessed via `mastra.getAgent(id)`

### Quick Test

```typescript
// In any TypeScript file
import { mastra } from "@/src/mastra";
const agent = mastra.getAgent("myAgent");
console.log(agent.name); // Should print agent name
```

## Troubleshooting

**Issue: Agent ID not found when retrieving**
- Solution: Verify agent is registered in `src/mastra/index.ts` with correct ID. ID must match.

**Issue: Tool not recognized in agent**
- Solution: Import tool from correct path. Verify tool is exported. Check tool file exists.

**Issue: Model string invalid or not recognized**
- Solution: Use format `{provider}/{model}` (e.g., `google/gemini-2.5-flash-lite`). See Model Options above.

**Issue: API key not working for selected model**
- Solution: Check `.env` has correct key. For Google: `GOOGLE_GENERATIVE_AI_API_KEY`. For OpenAI: `OPENAI_API_KEY`.

**Issue: TypeScript error "Cannot find module '@mastra/core/agent'"**
- Solution: Install dependencies: `npm install @mastra/core@latest`

**Issue: requestContext is undefined in tool**
- Solution: Ensure the API route creates `new RequestContext()`, calls `.set()` on it, and passes it to `agent.stream()` or `agent.generate()`. Mastra auto-injects it into each tool call.

**Issue: OAuth token not available in tool**
- Solution: Check the token is extracted from the `Authorization` header in the API route, and set on the `RequestContext` with `.set('token', token)`. In tools, access via `context.requestContext?.get<string>('token')` where `context` is the **second argument** to `execute`. A common mistake is reading it from `inputData` (first arg), where it does not exist.

**Issue: requireApproval tool executes without asking user**
- Solution: The API route must handle the `tool-call-approval` chunk from `output.fullStream`. If using `agent.generate()` instead of `agent.stream()`, HITL is not supported — use `agent.stream()`.

**Issue: approveToolCall/declineToolCall returns undefined**
- Solution: The `runId` must come from the `tool-call-approval` chunk. Store it on the client and send it back in the approval/decline POST request.

**Issue: SSE stream closes before finish event**
- Solution: Check that the API route returns the correct `Content-Type: text/event-stream` header and `Cache-Control: no-cache`. Ensure the `ReadableStream` controller is not closed prematurely.

**Issue: Agent instructions seem ignored or not used**
- Solution: Instructions affect model behavior but don't guarantee specific responses. Test in Mastra Studio for consistency.

**Issue: Memory not working or agent doesn't remember context**
- Solution: Install memory package: `npm install @mastra/memory@latest`. Ensure storage is configured. Pass consistent `resource` and `thread` IDs in agent calls.

**Issue: "Cannot find module '@mastra/memory'"**
- Solution: Memory is a separate package. Install it: `npm install @mastra/memory@latest`

**Issue: Agent can't recall information from previous messages**
- Solution: Verify you're passing the same `resource` and `thread` IDs across calls. Both identifiers must match for the agent to access the same conversation context.

**Issue: "Cannot find module '@mastra/libsql'"**
- Solution: Install LibSQL storage: `npm install @mastra/libsql`

**Issue: TypeScript error "implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer"**
- Solution: Circular dependency detected. This happens when an agent file imports `mastra` from `../index` and `index` imports the agent. Use dedicated storage in the agent instead of `mastra.getStorage()`. See Option 1 in Memory Configuration above.

## Next Steps

After creating an agent:

1. **Configure Memory** - Add memory for stateful conversations (see Memory Configuration above)
2. **Test in Studio** - Use the `mastra-admin-ui` skill to test agent interactively
3. **Create API Route** - Build Next.js route with requestContext and SSE streaming (see Template 6)
4. **Add Tools** - Use `mastra-create-tool` skill to enhance agent capabilities
5. **Add HITL** - Set `requireApproval: true` on write tools, handle approval in API route

## Complete Example: Mail Triage Agent (OAuth + HITL + Streaming)

This is the actual architecture from a production mail triage agent. It fetches Yahoo Mail using per-request OAuth tokens and requires user approval for all write operations.

**Agent** (`src/mastra/agents/mail-triage.ts`):
```typescript
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { PostgresStore } from '@mastra/pg';
import { getMailbox } from '../tools/get-mailbox';
import { listMessages } from '../tools/list-messages';
import { markAsRead } from '../tools/mark-as-read';  // requireApproval: true
import { deleteMessages } from '../tools/delete-messages';  // requireApproval: true

export const mailTriageAgent = new Agent({
  id: 'mail-triage-agent',
  name: 'Mail Triage Agent',
  model: 'google/gemini-2.0-flash',
  memory: new Memory({
    storage: new PostgresStore({
      id: 'mail-agent-memory',
      connectionString: process.env.SUPABASE_DB_URL!,
    }),
    options: { lastMessages: 40 },
  }),
  instructions: `You are a mail triage assistant.

WORKFLOW:
1. Call getMailbox to get mailboxId
2. Call listMessages to fetch inbox
3. Analyze and categorize: Important, Newsletter, Promotional, Spam
4. For ANY write/delete action, explain what you'll do first
   — the system will pause for user approval before executing

SAFETY:
- Never perform write operations without explaining first
- Prefer moving to Trash over permanent deletion`,
  tools: {
    getMailbox,     // read — no approval needed
    listMessages,   // read — no approval needed
    markAsRead,     // write — requireApproval: true
    deleteMessages, // write — requireApproval: true
  },
});
```

**API Route** (`app/api/agent/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { RequestContext } from '@mastra/core/request-context';
import { mastra } from '../../../src/mastra';

const mailTriageAgent = mastra.getAgent('mailTriageAgent');

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No auth token' }, { status: 401 });

  const { message, userGuid, sessionId, action, runId, accountId } = await req.json();

  // HITL: handle approval/decline for requireApproval tools
  if (action === 'approve' && runId) {
    const resumed = await mailTriageAgent.approveToolCall({ runId });
    return streamAgentResponse(resumed);
  }
  if (action === 'decline' && runId) {
    await mailTriageAgent.declineToolCall({ runId });
    return NextResponse.json({ declined: true });
  }

  // Inject OAuth token into requestContext (tools access via context.requestContext in execute arg 2)
  const requestContext = new RequestContext();
  requestContext.set('token', token);
  if (accountId) requestContext.set('accountId', accountId);

  const stream = await mailTriageAgent.stream(message, {
    requestContext,
    memory: {
      resource: userGuid,   // Yahoo user GUID — scopes memory per user
      thread: sessionId,    // Chat session ID — scopes memory per conversation
    },
  });

  return streamAgentResponse(stream);
}

function streamAgentResponse(output: any) {
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      const enqueue = (e: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      const reader = output.fullStream.getReader();
      try {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          switch (chunk.type) {
            case 'text-delta':
              enqueue({ type: 'text-delta', textDelta: chunk.payload?.text ?? '' });
              break;
            case 'tool-call-approval':  // requireApproval tool paused
              enqueue({ type: 'tool-call-pending', runId: chunk.runId, toolName: chunk.payload?.toolName, input: chunk.payload?.args ?? {} });
              break;
            case 'tool-result':
              enqueue({ type: 'tool-result', toolName: chunk.payload?.toolName, result: chunk.payload?.result });
              break;
            case 'finish':
              enqueue({ type: 'finish', finishReason: chunk.payload?.stepResult?.reason ?? 'stop' });
              break;
            case 'error':
              enqueue({ type: 'error', error: String(chunk.payload?.error ?? 'Unknown error') });
              break;
          }
        }
        controller.close();
      } catch (err) {
        enqueue({ type: 'error', error: err instanceof Error ? err.message : 'Stream error' });
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
  });
  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
```

**Client-side HITL handling:**
```typescript
// When client receives SSE event type: 'tool-call-pending'
async function handleToolCallPending(event: { runId: string; toolName: string; input: any }) {
  const userApproved = await showApprovalDialog(
    `Allow: ${event.toolName}?`,
    event.input
  );

  await fetch('/api/agent', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: userApproved ? 'approve' : 'decline',
      runId: event.runId,
    }),
  });
}
```

## Complete Example: Joke Teller Agent

Here's a full working example of an agent with memory that tells jokes and remembers past conversations:

**Agent File** (`src/mastra/agents/joke-teller.ts`):
```typescript
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const jokeTeller = new Agent({
  id: "joke-teller",
  name: "Joke Teller",
  instructions: `You are a hilarious joke-telling comedian with a great sense of humor.

Your personality:
- You love telling jokes of all kinds: puns, one-liners, knock-knock jokes, dad jokes, and clever wordplay
- You're enthusiastic and friendly, always ready to brighten someone's day
- You remember the types of jokes users enjoy and avoid repeating jokes you've already told them
- You can adapt your humor style based on user preferences

When telling jokes:
- Keep them clean and appropriate for all audiences
- If asked about a specific topic, try to find jokes related to that topic
- You can tell multiple jokes in a row if requested
- Always be ready to explain a joke if someone doesn't get it
- Remember past conversations to avoid repetition and personalize your comedy

Feel free to ask users what kind of jokes they'd like to hear, and always aim to make them smile!`,
  model: "google/gemini-2.5-flash-lite",
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra-memory.db",
    }),
    options: {
      lastMessages: 20,
    }
  }),
});
```

**Register in** `src/mastra/index.ts`:
```typescript
import { jokeTeller } from './agents/joke-teller';

export const mastra = new Mastra({
  agents: { jokeTeller },
  storage: new LibSQLStore({
    url: 'file:./mastra-memory.db',
  }),
  // ... other config
});
```

**Usage Example**:
```typescript
import { mastra } from "@/src/mastra";

const agent = mastra.getAgent("jokeTeller");

// First joke
await agent.generate("Tell me a programming joke", {
  memory: { resource: "user-123", thread: "chat-1" }
});

// Ask for another - agent remembers context
await agent.generate("Tell me another one", {
  memory: { resource: "user-123", thread: "chat-1" }
});

// Test memory - agent recalls first joke
await agent.generate("What was the first joke about?", {
  memory: { resource: "user-123", thread: "chat-1" }
});
```

## Important Notes

- **Instructions Matter**: Clear, specific instructions lead to better agent behavior. Keep them concise to save tokens.
- **Default Model**: Gemini Flash Lite is lightweight and cost-effective (recommended)
- **Tool Documentation**: Help agents by providing detailed tool descriptions
- **Unique IDs**: Each agent needs a unique ID within your Mastra instance
- **Export Naming**: Use camelCase for exported constants (e.g., `export const myAgent`)
- **API Keys**: Agent respects API key permissions and rate limits of the model provider
- **Testing**: Always test agent behavior in Mastra Studio before deploying to production
- **Memory Package**: Install `@mastra/memory@latest` and `@mastra/libsql@latest` separately to use memory features
- **Memory Identifiers**: Pass both `resource` (user/entity ID) and `thread` (conversation ID) for memory to work properly
- **Stateless by Default**: LLMs are stateless - memory persistence requires explicit configuration and identifier management
- **Memory Token Costs**: More messages included via `lastMessages` = higher token usage per request
- **requestContext vs runtimeContext**: Use `RequestContext` from `@mastra/core/request-context` for agents/tools. Workflow steps receive it as `params.requestContext` inside a single destructured object. They are different mechanisms.
- **Tool execute signature**: Tools use `execute: async (inputData, context) => {}` — two separate args. `inputData` = Zod schema fields, `context.requestContext` = OAuth token. Do NOT use `execute: async (params) => { params.requestContext }` — that reads from the input data object where requestContext does not exist.
- **OAuth tokens**: Never store OAuth tokens server-side. Pass them per-request via `requestContext.set('token', token)` in the API route.
- **HITL requires streaming**: `requireApproval: true` only works with `agent.stream()`, not `agent.generate()`. The approval chunks come through `output.fullStream`.
- **Circular Dependencies**: Never import `mastra` from `../index` in agent files. Use dedicated storage instead to avoid TypeScript errors.
