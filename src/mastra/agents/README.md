# Email Digest Agent

An AI-powered agent that generates concise, actionable email digests from arrays of email snippets.

## Overview

The Email Digest Agent analyzes multiple email snippets and creates a well-structured digest that:
- Identifies urgent and time-sensitive matters
- Groups related emails by theme
- Extracts action items
- Prioritizes information by importance
- Presents everything in a clear, scannable format

## Features

- **Intelligent Prioritization**: Automatically identifies urgent emails and action items
- **Theme Grouping**: Groups related emails together for easier comprehension
- **Memory Support**: Remembers previous conversations for follow-up questions
- **Flexible Input**: Accepts emails in various formats (plain text, JSON)
- **Professional Output**: Generates well-formatted, scannable digests

## Usage

### Basic Usage

```typescript
import { mastra } from "@/src/mastra";

const agent = mastra.getAgent("emailDigestAgent");

// Prepare your email snippets
const emailsText = `
Email 1:
From: john@company.com
Subject: Urgent: Q4 Budget Review
Content: Please prepare budget reports for tomorrow's meeting...
---

Email 2:
From: sarah@vendor.com
Subject: Re: Invoice #12345
Content: Invoice has been marked as paid...
---
`;

// Generate digest
const response = await agent.generate(
  `Please generate an email digest from the following emails:\n\n${emailsText}`,
  {
    memory: {
      resource: "user-123",      // User identifier
      thread: "digest-session-1" // Conversation thread
    }
  }
);

console.log(response.text);
```

### JSON Input

```typescript
const emailSnippets = [
  {
    from: "john@company.com",
    subject: "Urgent: Q4 Budget Review",
    snippet: "Please prepare budget reports...",
    timestamp: "2024-03-15T09:30:00Z"
  },
  // ... more emails
];

const response = await agent.generate(
  `Generate an email digest from: ${JSON.stringify(emailSnippets, null, 2)}`,
  {
    memory: {
      resource: "user-123",
      thread: "digest-session-1"
    }
  }
);
```

### Follow-up Questions

Thanks to memory support, you can ask follow-up questions:

```typescript
// First request - generate digest
await agent.generate("Generate digest from these emails...", {
  memory: { resource: "user-123", thread: "session-1" }
});

// Follow-up - agent remembers the previous digest
await agent.generate("Which emails require immediate action?", {
  memory: { resource: "user-123", thread: "session-1" }
});
```

## Digest Format

The agent generates digests in the following format:

1. **Overview**: Brief summary of email volume and key themes
2. **Urgent/Priority Items**: Time-sensitive emails needing immediate attention
3. **Action Items**: Tasks or responses required
4. **By Theme/Topic**: Grouped summaries of related emails
5. **FYI/Low Priority**: Informational emails without action requirements

## Configuration

The agent uses:
- **Model**: `google/gemini-2.5-flash-lite` (fast and cost-effective)
- **Memory**: Last 10 messages stored for context
- **Storage**: LibSQL database (`mastra-memory.db`)

## Examples

See `email-digest-agent.example.ts` for complete working examples including:
- Basic digest generation
- Follow-up questions with memory
- JSON input format
- Multiple digest sessions

## Memory Management

### Resource and Thread IDs

- **resource**: Identifies the user/entity (e.g., user ID, email address)
- **thread**: Identifies the conversation session (e.g., daily digest, specific topic)

Use consistent IDs to maintain context across multiple requests.

### Example Sessions

```typescript
// Daily digest for user 123
{ resource: "user-123", thread: "daily-digest-2024-03-15" }

// Specific project digest
{ resource: "user-456", thread: "project-alpha-digest" }

// Department-wide digest
{ resource: "sales-team", thread: "weekly-digest-12" }
```

## Best Practices

1. **Consistent Formatting**: Use consistent email snippet format for best results
2. **Include Context**: Add sender, subject, and timestamp when available
3. **Batch Size**: Process 5-50 emails per digest for optimal results
4. **Session Management**: Use unique thread IDs for different digest sessions
5. **Follow-ups**: Leverage memory for clarifications and drill-down questions

## API Keys

The agent requires a Google Generative AI API key:

```bash
# .env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Alternatively, you can use OpenAI by changing the model in the agent configuration.

## Troubleshooting

**Agent not found**: Ensure the agent is registered in `src/mastra/index.ts`

**Memory not working**: Verify `@mastra/memory` and `@mastra/libsql` are installed

**Context lost**: Check that you're using the same resource and thread IDs

**API errors**: Verify your API key is set correctly in `.env`

## Next Steps

- Test the agent in Mastra Studio UI
- Create API routes to expose the digest functionality
- Add custom tools for fetching emails from email providers
- Implement scheduled digest generation
