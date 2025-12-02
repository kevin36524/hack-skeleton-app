#!/usr/bin/env node

import { query } from "@anthropic-ai/claude-agent-sdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY must be set");
  process.exit(1);
} else {
  console.log("ANTHROPIC_API_KEY is set");
}

interface FeatureRequest {
  description: string;
  context?: string;
  scope?: "small" | "medium" | "large";
  targetFiles?: string[];
}

interface AgentConfig {
  model: "claude-opus-4-1" | "claude-sonnet-4-20250514" | "claude-haiku-4-5-20251001";
  maxIterations: number;
  timeout: number;
}

const DEFAULT_CONFIG: AgentConfig = {
  model: "claude-haiku-4-5-20251001",
  maxIterations: 30,
  timeout: 300000, // 5 minutes
};

async function readProjectStructure(): Promise<string> {
  const projectRoot = process.cwd();
  const structure = [
    "app/",
    "lib/",
    "scripts/",
    "components/",
    "package.json",
    "tsconfig.json",
  ];

  let output = "Project Structure:\n";
  for (const item of structure) {
    const fullPath = path.join(projectRoot, item);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      output += `- ${item}${stat.isDirectory() ? "/" : ""}\n`;
    }
  }

  return output;
}

async function createFeatureImplementationAgent(
  request: FeatureRequest,
  config: AgentConfig
): Promise<void> {
  const projectStructure = await readProjectStructure();

  const systemPrompt = `You are a helpful AI assistant for implementing features in a Next.js TypeScript application.

Your role is to help the user implement new features by:
1. Understanding the feature requirements
2. Analyzing the existing codebase structure
3. Providing implementation guidance and code
4. Using tools to read/write/edit files as needed
5. Running tests and builds to validate changes

Current Project Info:
${projectStructure}

Guidelines:
- Always read files before making changes
- Use TypeScript and follow the existing code style
- Maintain type safety throughout
- Implement one feature at a time
- Ask for clarification if requirements are unclear
- Test changes when possible
- Provide clear explanations of what you're doing`;

  const prompt = `I need help implementing the following feature:

**Feature Description:** ${request.description}

${request.context ? `**Additional Context:** ${request.context}` : ""}

${request.scope ? `**Scope:** ${request.scope}` : ""}

${request.targetFiles ? `**Target Files/Areas:** ${request.targetFiles.join(", ")}` : ""}

Please analyze the current codebase, understand what needs to be implemented, and help me build this feature step by step. Use your available tools to read files, make changes, and verify the implementation works correctly.`;

  console.log("🚀 Starting Feature Implementation Assistant...\n");
  console.log(`📋 Feature: ${request.description}\n`);
  console.log("🤖 Agent Configuration:");
  console.log(`   Model: ${config.model}`);
  console.log(`   Max Iterations: ${config.maxIterations}`);
  console.log(`   Timeout: ${config.timeout}ms\n`);

  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), config.timeout);

    const messages: Record<string, unknown>[] = [];

    for await (const message of query({
      prompt,
      systemPrompt,
      abortController,
      options: {
        maxTurns: config.maxIterations,
        allowedTools: [
          'Read',
          'Write',
          'Edit',
          'MultiEdit',
          'Bash',
          'LS',
          'Glob',
          'Grep'
        ]
      }
    })) {
      messages.push(message);

      // Log progress
      if (message.type === 'text') {
        console.log('[Claude]:', (message.text || '').substring(0, 80) + '...');
      } else if (message.type === 'tool_use') {
        console.log('[Tool]:', message.name, message.input?.file_path || '');
      } else if (message.type === 'result') {
        console.log('__TOOL_RESULT__', JSON.stringify({ 
          type: 'tool_result', 
          result: message.result 
        }));
      } else if (message.content && message.content[0] && message.content[0].type === 'text') {
        console.log('[Text]:', message.content[0].text);
      } 
      else {
        console.log('[Unknown]:', message.type);
      }
    }

    clearTimeout(timeoutId);
    console.log("\n✅ Feature Implementation Complete!\n");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error during feature implementation:", error.message);
      if (error.message.includes("timeout") || error.name === "AbortError") {
        console.error("The operation timed out. Try breaking down the feature into smaller parts.");
      }
    } else {
      console.error("❌ Unknown error:", error);
    }
    process.exit(1);
  }
}

function parseCliArguments(): FeatureRequest & { config?: Partial<AgentConfig> } {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // If first argument is a string without --, treat it as the description
  let description = "";
  const config: Partial<AgentConfig> = {};
  const targetFiles: string[] = [];
  let scope: "small" | "medium" | "large" = "medium";
  let context = "";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--description" && args[i + 1]) {
      description = args[++i];
    } else if (arg === "--context" && args[i + 1]) {
      context = args[++i];
    } else if (arg === "--scope" && args[i + 1]) {
      const scopeVal = args[++i];
      if (["small", "medium", "large"].includes(scopeVal)) {
        scope = scopeVal as "small" | "medium" | "large";
      }
    } else if (arg === "--model" && args[i + 1]) {
      const modelVal = args[++i];
      if (
        ["claude-opus-4-1", "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"].includes(
          modelVal
        )
      ) {
        config.model = modelVal as AgentConfig["model"];
      }
    } else if (arg === "--files" && args[i + 1]) {
      targetFiles.push(...args[++i].split(",").map((f) => f.trim()));
    } else if (arg === "--max-iterations" && args[i + 1]) {
      config.maxIterations = parseInt(args[++i], 10);
    } else if (!arg.startsWith("--") && !description) {
      description = arg;
    }
  }

  if (!description) {
    console.error("❌ Error: Feature description is required");
    printHelp();
    process.exit(1);
  }

  return {
    description,
    context,
    scope,
    targetFiles: targetFiles.length > 0 ? targetFiles : undefined,
    config,
  };
}

function printHelp(): void {
  console.log(`
Feature Implementation Assistant
==================================

This script helps you implement features in your Next.js TypeScript application using Claude AI.

USAGE:
  node scripts/feature-assistant.ts <description> [options]
  npm run feature -- <description> [options]

EXAMPLES:
  # Basic feature request
  npm run feature -- "Add a dark mode toggle to the app"

  # With context and scope
  npm run feature -- "Add user authentication" \\
    --context "Use NextAuth.js for JWT sessions" \\
    --scope large

  # Specify target files and model
  npm run feature -- "Create a dashboard component" \\
    --files "app/components/Dashboard.tsx,app/page.tsx" \\
    --model claude-sonnet-4-20250514

OPTIONS:
  --description <text>      Feature description (can also be first positional argument)
  --context <text>          Additional context or requirements
  --scope <small|medium|large>
                            Estimated scope of the feature (default: medium)
  --files <path1,path2>     Comma-separated list of target files/areas
  --model <model>           AI model to use (default: claude-sonnet-4-20250514)
                            Options: claude-haiku-4-5-20251001, claude-sonnet-4-20250514, claude-opus-4-1
  --max-iterations <num>    Maximum iterations for the agent (default: 10)
  --help, -h                Show this help message

ENVIRONMENT VARIABLES:
  ANTHROPIC_API_KEY         Required for Claude API access

EXAMPLES:

  # Simple feature
  npm run feature -- "Add a hero section to the home page"

  # Complex feature with requirements
  npm run feature -- "Build a real-time chat feature" \\
    --scope large \\
    --context "Use WebSockets for real-time updates, store in Postgres" \\
    --files "app/components/Chat.tsx,app/api/chat/route.ts"

  # Use faster model for simple tasks
  npm run feature -- "Fix typo in navigation" --model claude-haiku-4-5-20251001

For more information, visit: https://github.com/anthropics/claude-code
`);
}

// Main execution
async function main(): Promise<void> {
  const { description, context, scope, targetFiles, config: userConfig } = parseCliArguments();

  const finalConfig: AgentConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };

  const featureRequest: FeatureRequest = {
    description,
    context,
    scope,
    targetFiles,
  };

  await createFeatureImplementationAgent(featureRequest, finalConfig);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
