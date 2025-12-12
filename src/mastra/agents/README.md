# Email Digest Agent

## Overview

The Email Digest Agent is a Mastra AI agent that analyzes email snippets and generates concise, actionable daily digest summaries.

## Features

- **Smart Categorization**: Automatically groups related emails by topic or category
- **Priority Assessment**: Identifies urgent and important emails
- **Action Item Extraction**: Highlights key action items and deadlines
- **Concise Summaries**: Provides brief, scannable summaries for each email
- **Memory Support**: Maintains conversation context across multiple interactions

## Agent Configuration

- **ID**: `email-digest-agent`
- **Model**: `google/gemini-2.5-flash-lite` (fast and cost-effective)
- **Memory**: Configured with LibSQLStore, storing last 10 messages
- **Storage**: Uses `mastra-memory.db` for persistent memory

## Usage

### Basic Usage

```typescript
import { mastra } from '@/src/mastra';

const agent = mastra.getAgent('emailDigestAgent');

const emailSnippets = [
  "Subject: Project Update\nFrom: john@example.com\nThe Q4 project is 80% complete...",
  "Subject: Customer Inquiry\nFrom: customer@client.com\nUrgent: API integration issue...",
  // ... more email snippets
];

const emailList = emailSnippets
  .map((snippet, index) => `Email ${index + 1}:\n${snippet}`)
  .join('\n\n---\n\n');

const message = `Please generate a daily digest summary for the following emails:\n\n${emailList}`;

const response = await agent.generate(message, {
  memory: {
    resource: 'user-123', // User identifier
    thread: `digest-${new Date().toISOString().split('T')[0]}`, // Daily thread
  },
});

console.log(response.text);
```

### Using the Helper Function

```typescript
import { generateEmailDigest } from '@/src/mastra/agents/email-digest-agent-example';

const emailSnippets = [
  "Subject: Project Update\nFrom: john@example.com\nThe Q4 project is 80% complete. Need approval for final phase by Friday.",
  "Subject: Team Meeting\nFrom: sarah@example.com\nTeam sync scheduled for tomorrow at 2 PM. Please review the attached agenda.",
  "Subject: Customer Inquiry\nFrom: customer@client.com\nUrgent: We need assistance with the API integration. Production issue affecting 500 users.",
  "Subject: Invoice #12345\nFrom: billing@vendor.com\nYour invoice is due in 5 days. Amount: $2,450.00",
];

const digest = await generateEmailDigest(emailSnippets);
console.log(digest);
```

## Expected Output Format

The agent generates well-structured digests with:

1. **Overview**: Number of emails and main themes
2. **Categorized Sections**: Emails grouped by topic (e.g., "Work Updates", "Customer Inquiries")
3. **Email Summaries**: For each email:
   - Subject/Topic
   - 1-2 sentence summary
   - Action items or deadlines
   - Priority level (🔴 High, 🟡 Medium, 🟢 Low)
4. **Action Summary**: Key action items across all emails

### Example Output

```markdown
# Daily Email Digest - 4 Emails

## Overview
You received 4 emails today covering project updates, meetings, customer support, and billing.

---

## 🔴 High Priority

### Customer Inquiry - API Integration Issue
**From**: customer@client.com
**Summary**: Production issue affecting 500 users requires immediate attention for API integration assistance.
**Action**: Respond urgently and provide technical support.

---

## 🟡 Medium Priority

### Project Update - Q4 Project
**From**: john@example.com
**Summary**: Q4 project is 80% complete. Final phase approval needed by Friday.
**Action**: Review and approve final phase by end of week.

### Team Meeting Tomorrow
**From**: sarah@example.com
**Summary**: Team sync scheduled for 2 PM tomorrow. Agenda attached.
**Action**: Review agenda before meeting.

---

## 🟢 Low Priority

### Invoice Due - #12345
**From**: billing@vendor.com
**Summary**: Invoice of $2,450.00 due in 5 days.
**Action**: Process payment before due date.

---

## Summary of Action Items
1. 🔴 **URGENT**: Respond to customer API integration issue
2. 🟡 Approve Q4 project final phase by Friday
3. 🟡 Review meeting agenda for tomorrow at 2 PM
4. 🟢 Process invoice payment ($2,450.00) within 5 days
```

## Memory Management

The agent uses memory to:
- Remember previous digests and avoid repetition
- Maintain context about ongoing email threads
- Track action items across multiple digest generations

**Memory Identifiers**:
- `resource`: User ID (e.g., `"user-123"`)
- `thread`: Conversation thread (e.g., `"digest-2024-12-12"`)

## Customization

To modify the agent's behavior, edit `/src/mastra/agents/email-digest-agent.ts`:

- **Instructions**: Change the system prompt to adjust tone, format, or focus
- **Model**: Switch to a more capable model like `google/gemini-2.5-pro` for complex analysis
- **Memory Settings**: Adjust `lastMessages` to change context window size

## Integration Examples

### API Route (Next.js)

```typescript
// app/api/digest/route.ts
import { mastra } from '@/src/mastra';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { emailSnippets, userId } = await req.json();

  const agent = mastra.getAgent('emailDigestAgent');

  const emailList = emailSnippets
    .map((snippet: string, index: number) => `Email ${index + 1}:\n${snippet}`)
    .join('\n\n---\n\n');

  const message = `Please generate a daily digest summary for the following emails:\n\n${emailList}`;

  const response = await agent.generate(message, {
    memory: {
      resource: userId,
      thread: `digest-${new Date().toISOString().split('T')[0]}`,
    },
  });

  return NextResponse.json({ digest: response.text });
}
```

### Server Action

```typescript
// app/actions/generateDigest.ts
'use server';

import { mastra } from '@/src/mastra';

export async function generateDigestAction(emailSnippets: string[], userId: string) {
  const agent = mastra.getAgent('emailDigestAgent');

  const emailList = emailSnippets
    .map((snippet, index) => `Email ${index + 1}:\n${snippet}`)
    .join('\n\n---\n\n');

  const message = `Please generate a daily digest summary for the following emails:\n\n${emailList}`;

  const response = await agent.generate(message, {
    memory: {
      resource: userId,
      thread: `digest-${new Date().toISOString().split('T')[0]}`,
    },
  });

  return response.text;
}
```

## Files

- `email-digest-agent.ts`: Agent definition
- `email-digest-agent-example.ts`: Usage examples and helper functions
- `README.md`: This documentation

## Next Steps

1. **Test the Agent**: Use the example code to test with real email data
2. **Create API Routes**: Build endpoints to expose the agent functionality
3. **Add Tools**: Consider adding tools for email fetching or calendar integration
4. **Deploy**: The agent is ready to use in your application
5. **Monitor**: Use Mastra's observability features to track performance

## Troubleshooting

- **Agent not found**: Ensure `emailDigestAgent` is registered in `/src/mastra/index.ts`
- **Memory errors**: Verify LibSQLStore is installed: `npm install @mastra/libsql`
- **API key issues**: Check that `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env`
- **Import errors**: Restart the dev server after creating new agent files
