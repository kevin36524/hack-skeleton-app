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

### Template 3: Agent with Tools

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

### Template 4: Multi-role Agent

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

### Template 5: Agent with Memory and Tools

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

**Option 2: Use Mastra Instance Storage (Advanced)**

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

**LibSQLStore** (Recommended for most use cases)
```typescript
import { LibSQLStore } from "@mastra/libsql";

storage: new LibSQLStore({
  url: "file:./memory.db",  // Local SQLite file
  // OR
  url: ":memory:",  // In-memory (data lost on restart)
})
```

For other storage providers (PgStore, etc.), refer to Mastra's Storage documentation.

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
- Solution: Install dependencies: `npm install @mastra/core@beta`

**Issue: Agent instructions seem ignored or not used**
- Solution: Instructions affect model behavior but don't guarantee specific responses. Test in Mastra Studio for consistency.

**Issue: Tool parameters don't match what agent sends**
- Solution: Verify tool input schema matches what agent receives. Use detailed Zod validation error messages.

**Issue: Memory not working or agent doesn't remember context**
- Solution: Install memory package: `npm install @mastra/memory@latest`. Ensure storage is configured (Mastra instance or agent-specific). Pass consistent `resource` and `thread` IDs in agent calls using the `memory` parameter.

**Issue: "Cannot find module '@mastra/memory'"**
- Solution: Memory is a separate package. Install it: `npm install @mastra/memory@latest`

**Issue: Agent can't recall information from previous messages**
- Solution: Verify you're passing the same `resource` and `thread` IDs across calls. Both identifiers must match for the agent to access the same conversation context.

**Issue: Semantic recall not finding relevant messages**
- Solution: Semantic recall requires vector database setup. Refer to Mastra's Storage documentation for vector database configuration.

**Issue: "Cannot find module '@mastra/libsql'"**
- Solution: Install LibSQL storage: `npm install @mastra/libsql`

**Issue: TypeScript error "implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer"**
- Solution: Circular dependency detected. This happens when an agent file imports `mastra` from `../index` and `index` imports the agent. Use dedicated storage in the agent instead of `mastra.getStorage()`. See Option 1 in Memory Configuration above.

## Next Steps

After creating an agent:

1. **Configure Memory** - Add memory for stateful conversations (see Memory Configuration above)
2. **Test in Studio** - Use the `mastra-admin-ui` skill to test agent interactively
3. **Create API Route** - Build Next.js route: `await agent.generate(message, { memory: { resource: "user-id", thread: "thread-id" } })`
4. **Add Tools** - Use `mastra-create-tool` skill to enhance agent capabilities
5. **Monitor Responses** - Check response quality and adjust instructions if needed

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
- **When to Use Memory**: Best for multi-turn conversations, user preference tracking, or building context over time. Omit for single-turn, independent interactions.
- **Circular Dependencies**: Never import `mastra` from `../index` in agent files. Use dedicated storage instead to avoid TypeScript errors.
