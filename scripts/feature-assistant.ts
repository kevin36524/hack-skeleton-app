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
  sessionId?: string;
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


async function createFeatureImplementationAgent(
  request: FeatureRequest,
  config: AgentConfig
): Promise<void> {

  const prompt = request.sessionId
    ? request.description
    : `${request.description}.

  Please note that the application is already running in dev mode and will be restarted when the changes are made.
  Please don't attempt to launch the application.
  Also use the skills whenever possible.
  `;

  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), config.timeout);

    const queryOptions: any = {
      cwd: process.cwd(),
      abortController,
      settingSources: ['project', 'local'],
      maxTurns: config.maxIterations,
      allowedTools: [
        'Read',
        'Write',
        'Edit',
        'MultiEdit',
        'Bash',
        'Glob',
        'Grep',
        'NotebookEdit',
        'Skill',
        'SlashCommand',
        'Task'
      ]
    };

    if (request.sessionId) {
      queryOptions.resume = request.sessionId;
    }

    for await (const message of query({
      prompt,
      options: queryOptions
    })) {
      // Handle different message types
      switch (message.type) {
        case 'user':
          // User messages have a 'message' property with content array
          console.log('[User Message]:');
          message.message.content.forEach(block => {
            if (block.type === 'text') {
              console.log('  Text:', block.text);
            } else if (block.type === 'image') {
              console.log('  Image:', block.source.type);
            } else if (block.type === 'document') {
              console.log('  Document:', block.source.media_type);
            }
          });
          break;
    
        case 'assistant':
          // Assistant messages have a 'message' property with content array
          console.log('[Claude]:');
          message.message.content.forEach(block => {
            if (block.type === 'text') {
              console.log('  ', block.text);
            } else if (block.type === 'tool_use') {
              console.log(`  [Tool Use]: ${block.name}`);
              console.log('  [Input]:', JSON.stringify(block.input, null, 2));
            }
          });
          break;
    
        case 'result':
          // Result messages contain tool outputs
          console.log('__TOOL_RESULT__', JSON.stringify({ 
            type: 'tool_result', 
            result: message.result 
          }));
          break;
    
        case 'system':
          if (message.subtype === 'init') {
            console.log('[System]: Session started:', message.session_id);
          } else if (message.subtype === 'compact_boundary') {
            console.log('[System]: Conversation compacted');
          }
          break;
    
        case 'partial_assistant':
          // Only available when includePartialMessages is true
          console.log('[Streaming...]');
          break;
    
        default:
          console.log('[Unknown Message Type]:', message.type);
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
  let sessionId: string | undefined;

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
    } else if (arg === "--session-id" && args[i + 1]) {
      sessionId = args[++i];
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
    sessionId,
    config,
  };
}

function printHelp(): void {
  console.log(`
Feature Implementation Assistant
==================================

This script helps you implement features in your Next.js TypeScript application using Claude AI.

USAGE:
  npx tsx scripts/feature-assistant.ts "<description>" [options]

EXAMPLES:
  # Basic feature request
  npx tsx scripts/feature-assistant.ts "Add a dark mode toggle to the app"

  # With context and scope
  npx tsx scripts/feature-assistant.ts "Add user authentication" \\
    --context "Use NextAuth.js for JWT sessions" \\
    --scope large

  # Specify target files and model
  npx tsx scripts/feature-assistant.ts "Create a dashboard component" \\
    --files "app/components/Dashboard.tsx,app/page.tsx" \\
    --model claude-sonnet-4-20250514

  # Resume a previous session
  npx tsx scripts/feature-assistant.ts "continue with the implementation" \\
    --session-id 8547ea0a-9ba8-4b0e-a68f-e98c513485a6

OPTIONS:
  --description <text>      Feature description (can also be first positional argument)
  --context <text>          Additional context or requirements
  --scope <small|medium|large>
                            Estimated scope of the feature (default: medium)
  --files <path1,path2>     Comma-separated list of target files/areas
  --model <model>           AI model to use (default: claude-sonnet-4-20250514)
                            Options: claude-haiku-4-5-20251001, claude-sonnet-4-20250514, claude-opus-4-1
  --max-iterations <num>    Maximum iterations for the agent (default: 10)
  --session-id <id>         Resume a previous session with the given session ID
  --help, -h                Show this help message

ENVIRONMENT VARIABLES:
  ANTHROPIC_API_KEY         Required for Claude API access

EXAMPLES:

  # Simple feature
  npx tsx scripts/feature-assistant.ts "Add a hero section to the home page"

  # Complex feature with requirements
  npx tsx scripts/feature-assistant.ts "Build a real-time chat feature" \\
    --scope large \\
    --context "Use WebSockets for real-time updates, store in Postgres" \\
    --files "app/components/Chat.tsx,app/api/chat/route.ts"

  # Use faster model for simple tasks
  npx tsx scripts/feature-assistant.ts "Fix typo in navigation" \\
    --model claude-haiku-4-5-20251001

  # Resume a previous session with a new prompt
  npx tsx scripts/feature-assistant.ts "Now add unit tests for the chat feature" \\
    --session-id <session-id-from-previous-run>

For more information, visit: https://github.com/anthropics/claude-code
`);
}

// Main execution
async function main(): Promise<void> {
  const { description, context, scope, targetFiles, sessionId, config: userConfig } = parseCliArguments();

  const finalConfig: AgentConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };

  const featureRequest: FeatureRequest = {
    description,
    context,
    scope,
    targetFiles,
    sessionId,
  };

  await createFeatureImplementationAgent(featureRequest, finalConfig);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
