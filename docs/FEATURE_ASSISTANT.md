# Feature Implementation Assistant

A TypeScript-based CLI tool that leverages the Claude Agent SDK to help you implement features in your Next.js application using AI assistance.

## Overview

Instead of using Claude Code CLI directly, this script runs Claude as an intelligent agent within your project. The agent can:

- Analyze your codebase structure
- Understand feature requirements
- Generate and modify code
- Read/write/edit files
- Run commands to validate changes
- Provide implementation guidance

## Quick Start

### Setup

Make sure you have the `ANTHROPIC_API_KEY` environment variable set:

```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

### Basic Usage

```bash
# Simple feature request
npm run feature -- "Add a hero section to the home page"

# With context and scope
npm run feature -- "Add user authentication" \
  --context "Use NextAuth.js for JWT sessions" \
  --scope large

# Specify target files
npm run feature -- "Create a dashboard component" \
  --files "app/components/Dashboard.tsx,app/page.tsx"
```

## NPM Scripts

The following scripts are available:

- `npm run feature -- <description>` - Run feature assistant with default model (Claude Sonnet 4)
- `npm run feature:quick -- <description>` - Use Claude Haiku for quick, simple tasks
- `npm run feature:advanced -- <description>` - Use Claude Opus 4 for complex features

## Command Line Options

### Basic Syntax

```bash
npm run feature -- <description> [options]
```

### Arguments

| Argument | Short | Description | Example |
|----------|-------|-------------|---------|
| `<description>` (positional) | N/A | Feature description (required) | `"Add dark mode"` |
| `--description` | N/A | Alternative way to specify description | `--description "Add dark mode"` |
| `--context` | N/A | Additional context or requirements | `--context "Use CSS variables"` |
| `--scope` | N/A | Estimated scope: `small`, `medium`, or `large` | `--scope large` |
| `--files` | N/A | Comma-separated target files | `--files "app/page.tsx,app/components/Nav.tsx"` |
| `--model` | N/A | AI model to use | `--model claude-opus-4-1` |
| `--max-iterations` | N/A | Maximum iterations for agent (default: 10) | `--max-iterations 15` |
| `--help` | `-h` | Show help message | N/A |

### Available Models

- `claude-haiku-4-5-20251001` - Fastest, best for simple tasks (default for `feature:quick`)
- `claude-sonnet-4-20250514` - Balanced speed and capability (default for `feature`)
- `claude-opus-4-1` - Most capable, best for complex tasks (default for `feature:advanced`)

## Examples

### Simple Feature

```bash
npm run feature -- "Add a footer component"
```

### Complex Feature with Requirements

```bash
npm run feature -- "Build a real-time notification system" \
  --scope large \
  --context "Use WebSockets for real-time updates, store in PostgreSQL" \
  --files "app/components/Notifications.tsx,app/api/notifications/route.ts" \
  --model claude-opus-4-1
```

### Quick Bug Fix (Use Haiku)

```bash
npm run feature:quick -- "Fix typo in navigation menu"
```

### Medium-Complexity Feature

```bash
npm run feature -- "Create a user profile page with settings" \
  --scope medium \
  --context "Use the existing auth context, support dark mode" \
  --files "app/profile/page.tsx"
```

### Task with Enhanced Model

```bash
npm run feature:advanced -- "Implement advanced search with filters and sorting"
```

## How It Works

### The Agent Loop

1. **Initial Analysis**: The agent reads your project structure and understands the requirements
2. **File Inspection**: It analyzes relevant files to understand existing code patterns
3. **Implementation**: The agent generates code and makes changes using available tools
4. **Validation**: It can run commands to build/test the changes
5. **Iteration**: The agent refines the implementation based on feedback

### Available Agent Tools

The Claude Agent SDK provides these tools to the agent:

**File Operations:**
- Read files with line-range support
- Write files
- Edit files with precise replacements
- Search files with patterns
- Work with Jupyter notebooks

**Command Execution:**
- Run bash commands
- Monitor background processes
- Search for keywords in code

**Web & Research:**
- Fetch web content
- Search the web
- Access MCP resources

**User Interaction:**
- Ask follow-up questions
- Get clarifications

## Output

The agent will:

1. **Display its reasoning** - You'll see what it's analyzing and planning
2. **Show changes** - File modifications will be tracked
3. **Run validations** - Build/lint output will be shown
4. **Provide summary** - Final status and what was implemented

Example output:

```
🚀 Starting Feature Implementation Assistant...

📋 Feature: Add a hero section to the home page

🤖 Agent Configuration:
   Model: claude-sonnet-4-20250514
   Max Iterations: 10
   Timeout: 300000ms

[Agent processes and implements the feature...]

✅ Feature Implementation Complete!

Agent Response:
I've successfully implemented the hero section...
```

## Best Practices

### Feature Description

Write clear, specific feature descriptions:

- ❌ "Fix the thing" - Too vague
- ✅ "Add a sticky navigation header that stays at top during scroll" - Clear and specific

### Scope Selection

Choose the appropriate scope:

- **small** - Single component, minor changes
- **medium** - Feature involving multiple files, moderate complexity
- **large** - Major feature, significant architectural changes

### Context for Complex Features

Provide context for better results:

```bash
npm run feature -- "Implement user authentication" \
  --context "Use NextAuth.js v5, database is Prisma with PostgreSQL, store user data in 'users' table"
```

### Target Specific Files

When implementing features affecting specific files, list them:

```bash
npm run feature -- "Add error handling" \
  --files "app/api/users/route.ts,app/api/posts/route.ts,app/components/Form.tsx"
```

### Use Quick Model for Simple Tasks

Save tokens and get faster results for simple tasks:

```bash
npm run feature:quick -- "Update button text in navigation"
```

### Use Advanced Model for Complex Tasks

Get better results for complex features:

```bash
npm run feature:advanced -- "Implement complex authentication with OAuth providers"
```

## Troubleshooting

### Agent Timeout

If the agent times out:
- Break down the feature into smaller parts
- Reduce `--max-iterations` if needed
- Try with a faster model first

### ANTHROPIC_API_KEY Not Set

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run feature -- "Your feature description"
```

### Agent Makes Unnecessary Changes

- Provide more specific context about what you want
- Use `--files` to limit scope to specific files
- Use a more capable model for better understanding

### Build Errors After Implementation

The agent might make changes that need additional setup:
- Run `npm install` if new dependencies are needed
- Check for TypeScript errors: `npm run lint`
- Build to verify: `npm run build`

## Integration with Claude Code

This script **complements** Claude Code CLI:

- **Claude Code CLI**: Direct interactive development environment
- **Feature Assistant Script**: Automated feature implementation with specific requirements

You can use both:

```bash
# Use the script to implement a feature
npm run feature -- "Add authentication"

# Then use Claude Code for interactive refinement/debugging
npx claude-code
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for Claude |
| `NODE_ENV` | No | Set to `development` or `production` |

## File Locations

- **Script**: `/scripts/feature-assistant.ts`
- **Documentation**: `/FEATURE_ASSISTANT.md`
- **Configuration**: Built-in, no external config needed

## Advanced Usage

### Custom Model Selection

Use different models for different scenarios:

```bash
# For quick prototyping
npm run feature:quick -- "Prototype a new component"

# For production features
npm run feature -- "Implement critical authentication flow"

# For complex architectural decisions
npm run feature:advanced -- "Design and implement multi-tenant system"
```

### Iterative Development

Use the assistant multiple times for a feature:

1. First pass: Core implementation
2. Second pass: Error handling and validation
3. Third pass: Styling and UI polish

```bash
npm run feature -- "Create user profile component"
npm run feature -- "Add form validation to profile editor"
npm run feature -- "Style profile page with dark mode support"
```

## Limitations

- The agent can't access files outside the project directory
- Very large features might need multiple runs
- Some complex architectural decisions still benefit from human review
- The agent follows existing code patterns in your project

## Getting Help

For help with the feature assistant:

```bash
npm run feature -- --help
```

For issues with Claude Code or the Agent SDK:

```bash
npx claude-code --help
```

Visit: https://github.com/anthropics/claude-code

## Related Documentation

- [Claude Agent SDK Documentation](https://github.com/anthropics/claude-code)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
