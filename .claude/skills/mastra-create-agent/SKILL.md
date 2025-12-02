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

## Next Steps

After creating an agent:

1. **Test in Studio** - Use the `mastra-admin-ui` skill to test agent interactively
2. **Create API Route** - Build Next.js route calling: `await agent.generate(message)`
3. **Add Tools** - Use `mastra-create-tool` skill to enhance agent capabilities
4. **Monitor Responses** - Check response quality and adjust instructions if needed
5. **Add Memory** - Configure conversation memory for multi-turn interactions (optional)

## Important Notes

- **Instructions Matter**: Clear, specific instructions lead to better agent behavior
- **Default Model**: Gemini Flash Lite is lightweight and cost-effective (recommended)
- **Tool Documentation**: Help agents by providing detailed tool descriptions
- **Unique IDs**: Each agent needs a unique ID within your Mastra instance
- **Export Naming**: Use camelCase for exported constants (e.g., `export const myAgent`)
- **API Keys**: Agent respects API key permissions and rate limits of the model provider
- **Testing**: Always test agent behavior in Mastra Studio before deploying to production
