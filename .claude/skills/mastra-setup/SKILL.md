---
name: mastra-setup
description: Initialize Mastra framework in an existing Next.js application
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Skill: Setup Mastra in Next.js

## Overview

This skill initializes the Mastra AI framework in an existing Next.js application. Mastra provides a unified framework for building AI agents, tools, and workflows with support for multiple LLM providers (Google Gemini, OpenAI, etc.).

## When to Use

Use this skill when:
- You have a Next.js application and want to add Mastra support
- You need to set up the basic Mastra directory structure (`src/mastra/`)
- You're preparing to create agents or tools
- You want to enable Mastra Studio (interactive UI) in your development workflow

**Prerequisites:**
- Next.js 13+ project with `next.config.ts` (not `.js`)
- TypeScript configured in the project
- At least one LLM API key (Google Generative AI or OpenAI)
- Node.js 18+ and npm/pnpm installed

## How It Works

### Step 1: Initialize Mastra

The initialization command creates the base structure:

```bash
npx --force mastra@beta init
```

This generates:
- `src/mastra/index.ts` - Main Mastra instance
- `src/mastra/agents/` - Directory for agent definitions
- `src/mastra/tools/` - Directory for tool definitions
- Example weather agent and tool (can be deleted)

### Step 2: Update Next.js Configuration

The Mastra packages need to be external to Next.js. Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
```

**Why**: Prevents bundling issues and ensures Mastra modules load correctly in server environments.

### Step 3: Verify API Keys

Check `.env` or `.env.local` has the required API key:

```bash
# For Google Gemini (recommended)
GOOGLE_GENERATIVE_AI_API_KEY=your-key-here

# OR for OpenAI
OPENAI_API_KEY=your-key-here
```

At least one key must be present. Both can coexist for flexibility.

### Step 4: Validate Setup

Verify TypeScript compilation and imports work:

```bash
npx tsc --noEmit
```

Test basic import in a file:
```typescript
import { mastra } from "@/src/mastra";
// Should compile without errors
```

## Code Templates

### Mastra Instance Template (src/mastra/index.ts)

After initialization, your `src/mastra/index.ts` should look similar to:

```typescript
import { Mastra } from "@mastra/core";

// Import agents and tools here as you create them
// import { weatherAgent } from "./agents/weather-agent";
// import { weatherTool } from "./tools/weather-tool";

export const mastra = new Mastra({
  agents: {
    // Register agents here
    // weatherAgent,
  },
  // Optional: Add storage, memory, logger configuration
});
```

### Updated next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
```

## Common Patterns

### Pattern 1: Basic Setup Complete
After running init and making updates, you have a working Mastra instance that can load agents.

### Pattern 2: Adding to Existing Configuration
If your `next.config.ts` already has configuration, merge `serverExternalPackages`:

```typescript
const nextConfig: NextConfig = {
  // Existing config...
  serverExternalPackages: ["@mastra/*"],
};
```

### Pattern 3: Accessing Mastra in API Routes
Use in Next.js API routes:

```typescript
// app/api/agent/route.ts
import { mastra } from "@/src/mastra";

export async function POST(req: Request) {
  const agent = mastra.getAgent("agentName");
  const response = await agent.generate("user message");
  return Response.json({ response: response.text });
}
```

## Validation

Run these checks to confirm successful setup:

1. **Directory Structure**:
```bash
ls -la src/mastra/
# Should show: index.ts, agents/, tools/
```

2. **Configuration Updated**:
```bash
grep -q "serverExternalPackages" next.config.ts && echo "✓ Config updated"
```

3. **Environment Variables**:
```bash
grep -E "GOOGLE_GENERATIVE_AI_API_KEY|OPENAI_API_KEY" .env && echo "✓ API keys present"
```

4. **TypeScript Compilation**:
```bash
npx tsc --noEmit
# Should output nothing (no errors)
```

## Troubleshooting

**Issue: Command not found - npx mastra**
- Solution: Ensure `@mastra/core` is installed: `npm install @mastra/core@beta`

**Issue: EACCES permission denied during init**
- Solution: Run with `--force` flag: `npx --force mastra@beta init`

**Issue: next.config.ts already exists but not TypeScript**
- Solution: Create `next.config.ts` instead of `.js` and add the configuration

**Issue: TypeScript compilation errors after init**
- Solution: Run `npm install` to ensure all dependencies are installed, then try `npx tsc --noEmit` again

**Issue: Port 4111 already in use (when running mastra dev later)**
- Solution: Use `npx mastra dev --port 4200` to specify an alternative port

**Issue: API key not recognized**
- Solution: Verify the key is in `.env` (not `.env.local` if using production). Restart dev server to reload env vars.

**Issue: Module not found "@mastra/core"**
- Solution: Install dependencies: `npm install @mastra/core@beta zod@^4`

## Next Steps

After successful setup:

1. **Create a Tool** - Use the `mastra-create-tool` skill to build reusable functions
2. **Create an Agent** - Use the `mastra-create-agent` skill to create AI agents
3. **Access Studio** - Use the `mastra-admin-ui` skill to open the interactive testing UI
4. **Build API Routes** - Create Next.js API routes that call your agents
5. **Add Memory** - Configure conversation memory for stateful interactions (optional)

## Important Notes

- **Example Code**: The init command creates example weather agent/tool. You can delete these if not needed.
- **src/ Convention**: Mastra follows the `src/` directory convention. Update commands reference `src/` folder.
- **Environment Variables**: Changes to `.env` require restarting the dev server (`next dev`).
- **TypeScript Required**: Mastra expects TypeScript. Ensure `tsconfig.json` exists and is properly configured.
- **Zod for Validation**: Tool schemas use Zod. It's installed automatically with `@mastra/core`.
