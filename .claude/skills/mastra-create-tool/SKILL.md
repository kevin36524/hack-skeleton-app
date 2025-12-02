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
    // Define input parameters
  }),
  outputSchema: z.object({
    // Define output structure
  }),
  execute: async (inputData) => {
    // Implementation
  }
});
```

### Step 3: Register Tool

Update `src/mastra/tools/index.ts`:

```typescript
export { myTool } from "./my-tool";
export { existingTool } from "./existing-tool";
// Add your new tool export here
```

### Step 4: Validate

Run TypeScript check:
```bash
npx tsc --noEmit
```

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
  execute: async (inputData) => {
    const sum = inputData.a + inputData.b;
    return { result: sum };
  }
});
```

### Template 2: External API Integration

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
  execute: async (inputData) => {
    const response = await fetch(
      `https://wttr.in/${inputData.location}?format=j1`
    );
    const data = await response.json();
    return {
      weather: data.current_condition[0].description,
      temperature: data.current_condition[0].temp_C,
    };
  }
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
  execute: async (inputData) => {
    const words = inputData.text.trim().split(/\s+/).length;
    const chars = inputData.text.length;
    const sentences = (inputData.text.match(/[.!?]+/g) || []).length;

    return {
      wordCount: words,
      charCount: chars,
      sentences: sentences,
    };
  }
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
  execute: async (inputData) => {
    try {
      const response = await fetch(`https://api.example.com/search?q=${inputData.query}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return { data: JSON.stringify(data) };
    } catch (error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }
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
  execute: async (inputData) => {
    const result = inputData.optional
      ? `${inputData.required} + ${inputData.optional}`
      : inputData.required;
    return { result };
  }
});
```

### Pattern 3: Tool with Arrays

```typescript
export const listProcessor = createTool({
  id: "list-processor",
  description: "Process a list of items",
  inputSchema: z.object({
    items: z.array(z.string()),
  }),
  outputSchema: z.object({
    count: z.number(),
    processed: z.array(z.string()),
  }),
  execute: async (inputData) => {
    const processed = inputData.items.map(item => item.toUpperCase());
    return {
      count: processed.length,
      processed,
    };
  }
});
```

## Validation

Check your tool is working:

1. **File Created**: `ls src/mastra/tools/{tool-name}.ts`
2. **Exported**: Verify export in `src/mastra/tools/index.ts`
3. **TypeScript**: `npx tsc --noEmit` (no errors)
4. **Imports**: Can import tool in other files without errors

## Troubleshooting

**Issue: Zod validation errors in inputSchema/outputSchema**
- Solution: Ensure all Zod types match TypeScript types. Use `.describe()` for clarity.

**Issue: Tool file has syntax errors**
- Solution: Check async/await syntax, ensure `execute` returns an object matching `outputSchema`.

**Issue: Tool not found when creating agent**
- Solution: Ensure tool is exported from `src/mastra/tools/index.ts`.

**Issue: inputData doesn't have expected properties**
- Solution: Verify property names in `inputSchema` match how you access them in `execute`.

**Issue: Network timeout in external API calls**
- Solution: Add timeout handling with try-catch, or use timeout-aware fetch wrapper.

**Issue: Can't access environment variables in execute function**
- Solution: Access via `process.env.VARIABLE_NAME` at the top level of the function.

## Next Steps

After creating a tool:

1. **Use in an Agent** - Use the `mastra-create-agent` skill to create an agent that uses your tool
2. **Test in Studio** - Use the `mastra-admin-ui` skill to test the tool interactively
3. **Create More Tools** - Build additional tools and compose them with agents
4. **Add to Agents** - Reference your tool when creating new agents

## Important Notes

- **Naming**: Use kebab-case for file names (e.g., `my-tool.ts`), camelCase for exports (e.g., `export const myTool`)
- **Descriptions**: Write clear descriptions - agents use them to decide when to call your tool
- **Zod Schemas**: Always define both input and output schemas for type safety
- **Error Handling**: Wrap external calls in try-catch to provide helpful error messages
- **Async Required**: `execute` function must be async (can be synchronous internally)
- **Return Structure**: Must match `outputSchema` exactly or validation will fail
