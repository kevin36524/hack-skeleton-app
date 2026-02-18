---
name: mastra-create-tool
description: Create a reusable tool in an existing Mastra setup
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - AskUserQuestion
---

# Skill: Create a Mastra Tool

## Overview

This skill helps you create a new tool in Mastra. Tools are reusable functions that agents can invoke to perform specific tasks like fetching data, transforming information, or calling external APIs.

## When to Use

Use this skill when:
- You want to create a reusable function for agents to use
- You need to integrate with external APIs or services
- You're building data transformation or computation utilities
- You want type-safe function definitions with validation

**Prerequisites:**
- Mastra setup complete (use `mastra-setup` skill first)
- Basic understanding of what your tool should do
- TypeScript and Zod knowledge (optional - templates handle most cases)

## How It Works

### Step 1: Understand Tool Requirements

Tools need:
- **ID**: Unique identifier (e.g., "get-weather")
- **Description**: What the tool does (helps agent decide when to use it)
- **Input Schema**: Zod schema defining parameters
- **Output Schema**: Zod schema defining return value
- **Execute Function**: The actual implementation

### Step 2: Create Tool File

Create `src/mastra/tools/{tool-name}.ts` with:

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const myTool = createTool({
  id: "tool-id",
  description: "What this tool does",
  inputSchema: z.object({
    param1: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async (inputData, context) => {
    // inputData — your Zod inputSchema fields (e.g. inputData.param1)
    // context   — framework context: context.requestContext, context.mastra, context.abortSignal
    return { result: inputData.param1 };
  },
});
```

### Step 3: Register Tool

Update `src/mastra/tools/index.ts`:

```typescript
export { myTool } from "./my-tool";
export { existingTool } from "./existing-tool";
```

### Step 4: Validate

```bash
npx tsc --noEmit
```

## The Execute Function Signature

**Tools use two separate positional arguments** (verified from Mastra 1.x source):

```typescript
execute: async (inputData, context) => {
  // arg 1 — inputData: your Zod inputSchema type
  const { myField, optionalField } = inputData;

  // arg 2 — context: ToolExecutionContext
  const token   = context.requestContext?.get<string>('token');
  const mastra  = context.mastra;
  const signal  = context.abortSignal;
}
```

> **This is different from workflow steps**, which receive a single destructured object
> `({ inputData, requestContext })`. Do not confuse the two.

`context` properties:

| Property | Type | Description |
|---|---|---|
| `context.requestContext` | `RequestContext` | Per-request data set by the API route (OAuth tokens, etc.) |
| `context.mastra` | `Mastra` | Access to registered agents, tools, storage |
| `context.abortSignal` | `AbortSignal` | Cancellation signal |
| `context.agent` | `AgentToolExecutionContext` | Present when called from an agent |
| `context.workflow` | `WorkflowToolExecutionContext` | Present when called from a workflow |

## Code Templates

### Template 1: Simple Data Transformation

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const sumNumbers = createTool({
  id: "sum-numbers",
  description: "Adds two numbers together",
  inputSchema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  outputSchema: z.object({
    result: z.number().describe("The sum of a and b"),
  }),
  execute: async (inputData, _context) => {
    return { result: inputData.a + inputData.b };
  },
});
```

### Template 2: External API Integration (Public API)

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const fetchWeather = createTool({
  id: "fetch-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    weather: z.string(),
    temperature: z.number(),
  }),
  execute: async (inputData, _context) => {
    const response = await fetch(
      `https://wttr.in/${inputData.location}?format=j1`
    );
    const data = await response.json();
    return {
      weather: data.current_condition[0].description,
      temperature: data.current_condition[0].temp_C,
    };
  },
});
```

### Template 3: String Processing

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const textAnalysis = createTool({
  id: "text-analysis",
  description: "Analyze text and extract statistics",
  inputSchema: z.object({
    text: z.string(),
  }),
  outputSchema: z.object({
    wordCount: z.number(),
    charCount: z.number(),
    sentences: z.number(),
  }),
  execute: async (inputData, _context) => {
    return {
      wordCount: inputData.text.trim().split(/\s+/).length,
      charCount: inputData.text.length,
      sentences: (inputData.text.match(/[.!?]+/g) || []).length,
    };
  },
});
```

### Template 4: OAuth API Tool with requestContext

Use this when a tool needs to call an authenticated API using a per-request OAuth token. The token is set on `RequestContext` in the API route before calling the agent, and Mastra injects it into every tool's `context` argument.

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getUserProfile = createTool({
  id: "get-user-profile",
  description: "Fetch the authenticated user's profile",
  inputSchema: z.object({
    userId: z.string().describe("The user ID to fetch"),
  }),
  outputSchema: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  execute: async (inputData, context) => {
    // Get OAuth token from requestContext (set by the API route)
    const token = context.requestContext?.get<string>("token");
    if (!token) {
      throw new Error(
        "No OAuth token in requestContext. " +
        "Set it in the API route: requestContext.set('token', bearerToken)"
      );
    }

    const response = await fetch(
      `https://api.example.com/users/${inputData.userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { id: data.id, name: data.name, email: data.email };
  },
});
```

**How the token gets into `requestContext`** — in your API route:

```typescript
import { RequestContext } from "@mastra/core/request-context";

const requestContext = new RequestContext();
requestContext.set("token", oauthToken);       // ← set here
requestContext.set("accountId", accountId);    // ← other per-request values

await agent.stream(message, { requestContext });
// Mastra automatically injects requestContext into context arg of every tool call
```

### Template 5: HITL Write Tool (requireApproval)

Set `requireApproval: true` on any tool that mutates data (write, update, delete, send). The agent pauses and emits a `tool-call-approval` SSE chunk. The API route handles approval/decline via `agent.approveToolCall()` / `agent.declineToolCall()`. See the mastra-create-agent skill for the full flow.

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const deleteItem = createTool({
  id: "delete-item",
  description: "Permanently delete an item. Requires user approval.",
  inputSchema: z.object({
    itemId: z.string().describe("ID of the item to delete"),
    reason: z.string().describe("Why this item should be deleted"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deletedId: z.string(),
  }),
  requireApproval: true, // ← agent pauses; user must approve/decline
  execute: async (inputData, context) => {
    const token = context.requestContext?.get<string>("token");
    if (!token) throw new Error("No auth token in requestContext");

    const response = await fetch(
      `https://api.example.com/items/${inputData.itemId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.status}`);
    }

    return { success: true, deletedId: inputData.itemId };
  },
});
```

## Token Helper Pattern

For apps with many OAuth tools, extract token retrieval into a shared helper. Because `requestContext` lives in `context` (arg 2), the helper receives `context`, not the full params:

**`src/mastra/helpers/get-token.ts`:**
```typescript
import type { ToolExecutionContext } from "@mastra/core/tools";

/**
 * Extract OAuth token from tool context.
 * Production: from context.requestContext (set by the API route).
 * Dev/test:   from TEST_OAUTH_TOKEN env variable as fallback.
 */
export function getToken(context: ToolExecutionContext): string {
  const token = context.requestContext?.get<string>("token");
  if (token) return token;

  // Dev/test fallback — set TEST_OAUTH_TOKEN in .env
  const envToken = process.env.TEST_OAUTH_TOKEN;
  if (envToken) return envToken;

  throw new Error(
    "No auth token available. " +
    "In production, set via requestContext.set('token', ...) in the API route. " +
    "In dev/test, set TEST_OAUTH_TOKEN in .env"
  );
}
```

**Usage in a tool:**
```typescript
import { getToken } from "../helpers/get-token";

execute: async (inputData, context) => {
  const token = getToken(context);   // ← pass context (arg 2), not inputData
  const { mailboxId, folderId } = inputData;
  // ...
}
```

## Real-World Example: Mail Agent Tools (OAuth + HITL)

These are the patterns from a production mail triage agent (corrected to use the proper 1.x execute signature):

**Read Tool** (`src/mastra/tools/list-messages.ts`):
```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getToken } from "../helpers/get-token";

export const listMessages = createTool({
  id: "list-messages",
  description: "List messages in a folder with pagination support",
  inputSchema: z.object({
    mailboxId: z.string().describe("The mailbox ID from getMailbox"),
    folderId:  z.string().describe("The folder ID to list messages from"),
    count:     z.number().optional().default(30),
    offset:    z.number().optional().default(0),
  }),
  outputSchema: z.array(
    z.object({
      id: z.string(), subject: z.string(), from: z.string(),
      date: z.string(), snippet: z.string(), isRead: z.boolean(),
    })
  ),
  execute: async (inputData, context) => {
    const token = getToken(context);  // ← context is arg 2
    const { mailboxId, folderId, count = 30, offset = 0 } = inputData;

    const query = `folderId:${folderId}+offset:${offset}+count:${count}`;
    const response = await fetch(
      `https://apis.mail.example.com/mailboxes/@.id==${mailboxId}/messages?q=${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return data.messages.map((msg: any) => ({
      id: msg.id, subject: msg.subject, from: msg.from,
      date: msg.date, snippet: msg.snippet, isRead: Boolean(msg.flags?.read),
    }));
  },
});
```

**Write Tool with HITL** (`src/mastra/tools/mark-as-read.ts`):
```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getToken } from "../helpers/get-token";

export const markAsRead = createTool({
  id: "mark-as-read",
  description: "Mark one or more messages as read or unread. Requires user approval.",
  inputSchema: z.object({
    mailboxId:  z.string(),
    messageIds: z.array(z.string()),
    read:       z.boolean(),
  }),
  outputSchema: z.object({ success: z.boolean(), count: z.number() }),
  requireApproval: true,
  execute: async (inputData, context) => {
    const token = getToken(context);  // ← context is arg 2
    const { mailboxId, messageIds, read } = inputData;

    await fetch("https://apis.mail.example.com/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        batch: messageIds.map((id, i) => ({
          id: `mark-${i}`, method: "PUT",
          uri: `/mailboxes/@.id==${mailboxId}/messages/@.id==${id}`,
          entity: { message: { id, flags: { read: read ? 1 : 0 } } },
        })),
      }),
    });

    return { success: true, count: messageIds.length };
  },
});
```

## Common Patterns

### Pattern 1: API Tool with Error Handling

```typescript
export const apiTool = createTool({
  id: "api-call",
  description: "Call an API",
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ data: z.string() }),
  execute: async (inputData, _context) => {
    try {
      const response = await fetch(
        `https://api.example.com/search?q=${inputData.query}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return { data: JSON.stringify(await response.json()) };
    } catch (error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  },
});
```

### Pattern 2: Tool with Optional Parameters

```typescript
export const customTool = createTool({
  id: "custom-tool",
  description: "Tool with optional params",
  inputSchema: z.object({
    required: z.string(),
    optional: z.string().optional(),
  }),
  outputSchema: z.object({ result: z.string() }),
  execute: async (inputData, _context) => {
    const result = inputData.optional
      ? `${inputData.required} + ${inputData.optional}`
      : inputData.required;
    return { result };
  },
});
```

### Pattern 3: Tool with Arrays

```typescript
export const listProcessor = createTool({
  id: "list-processor",
  description: "Process a list of items",
  inputSchema: z.object({ items: z.array(z.string()) }),
  outputSchema: z.object({ count: z.number(), processed: z.array(z.string()) }),
  execute: async (inputData, _context) => {
    const processed = inputData.items.map(item => item.toUpperCase());
    return { count: processed.length, processed };
  },
});
```

### Pattern 4: OAuth + requestContext

```typescript
export const authenticatedTool = createTool({
  id: "authenticated-call",
  description: "Call an authenticated API endpoint",
  inputSchema: z.object({ resourceId: z.string() }),
  outputSchema: z.object({ data: z.any() }),
  execute: async (inputData, context) => {
    // requestContext is on the context arg (arg 2), not on inputData
    const token     = context.requestContext?.get<string>("token");
    const accountId = context.requestContext?.get<string>("accountId");
    if (!token) throw new Error("Auth token required in requestContext");

    const response = await fetch(
      `https://api.example.com/resource/${inputData.resourceId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { data: await response.json() };
  },
});
```

### Pattern 5: HITL (Human-in-the-Loop) Write Tool

```typescript
export const sendMessage = createTool({
  id: "send-message",
  description: "Send an email. Requires user approval before sending.",
  inputSchema: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
  outputSchema: z.object({ sent: z.boolean(), messageId: z.string() }),
  requireApproval: true, // agent pauses; user must approve/decline in the UI
  execute: async (inputData, context) => {
    const token = context.requestContext?.get<string>("token");
    if (!token) throw new Error("No auth token");
    // ... send the message using inputData.to, inputData.subject, inputData.body
    return { sent: true, messageId: "msg-123" };
  },
});
```

## Validation

1. **File Created**: `ls src/mastra/tools/{tool-name}.ts`
2. **Exported**: Verify export in `src/mastra/tools/index.ts`
3. **TypeScript**: `npx tsc --noEmit` (no errors)

## Troubleshooting

**Issue: `inputData.myField` is undefined**
- Solution: `inputData` (arg 1) contains the schema fields. Check spellings match `inputSchema`.

**Issue: `context.requestContext` is undefined in execute**
- Solution: The API route must create `new RequestContext()`, call `.set()` on it, and pass it to `agent.stream()` or `agent.generate()`. Mastra auto-injects it into the `context` arg (arg 2) of every tool.

**Issue: Token is always undefined (production)**
- Solution: Verify you're accessing `context.requestContext?.get<string>('token')` from **arg 2** (`context`), not from `inputData` (arg 1). A common mistake is writing `execute: async (params) => { params.requestContext }` — this reads `requestContext` from arg 1 (the schema data), where it does not exist.

**Issue: `requireApproval` tool executes without pausing**
- Solution: HITL only works with `agent.stream()`. The API route must handle the `tool-call-approval` chunk from `output.fullStream`. See the mastra-create-agent skill for the SSE pattern.

**Issue: Zod validation errors**
- Solution: Ensure the `execute` return value matches `outputSchema` exactly.

**Issue: Network timeout in external API calls**
- Solution: Wrap in try-catch. Check `context.abortSignal` for cancellation.

## Next Steps

1. **Use in an Agent** — Use the `mastra-create-agent` skill to attach the tool
2. **Test in Studio** — Use Mastra Studio to test the tool interactively
3. **Add HITL** — Set `requireApproval: true` and handle approval in the API route

## Important Notes

- **Execute has two args**: `(inputData, context)` — NOT `(params)`. Never merge them.
- **inputData** (arg 1) = your Zod schema fields only.
- **context** (arg 2) = `{ requestContext, mastra, abortSignal, agent, ... }`.
- **requestContext vs runtimeContext**: Tools use `context.requestContext` (from `@mastra/core/request-context`). Workflow steps use `runtimeContext` (from the `ExecuteFunctionParams`). They are different.
- **Token helper**: Pass `context` (not `inputData`) to any token-extraction helper.
- **requireApproval**: Requires `agent.stream()` — does not work with `agent.generate()`.
- **Naming**: kebab-case file names (`my-tool.ts`), camelCase exports (`export const myTool`).
- **Descriptions**: Write clear descriptions — agents use them to decide when to call the tool.
