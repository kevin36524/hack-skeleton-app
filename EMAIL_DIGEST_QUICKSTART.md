# Email Digest Agent - Quick Start Guide

Welcome! Your email digest agent is ready to use. This guide will help you get started quickly.

## ✅ What's Been Created

1. **Email Digest Agent** (`src/mastra/agents/email-digest-agent.ts`)
   - AI-powered agent that generates email digests
   - Analyzes email snippets and creates structured summaries
   - Identifies urgent items and action items
   - Groups related emails by theme

2. **API Endpoints** (`app/api/digest/route.ts`)
   - `POST /api/digest` - Generate digest from emails
   - `GET /api/digest` - Ask follow-up questions

3. **Documentation**
   - Complete API documentation (`API_DOCUMENTATION.md`)
   - Agent usage guide (`src/mastra/agents/README.md`)
   - Code examples (`src/mastra/agents/email-digest-agent.example.ts`)

4. **Test Script** (`test-email-digest.ts`)
   - Ready-to-run test with sample emails

## 🚀 Quick Start

### Option 1: Test the Agent Directly (Recommended First Step)

Run the test script to see the agent in action:

```bash
npx tsx test-email-digest.ts
```

This will:
- Load 7 sample emails
- Generate a comprehensive digest
- Show a follow-up question example
- Verify everything is working

### Option 2: Use the API Endpoint

Since your app is already running in dev mode, the API is ready to use!

**Test with cURL:**

```bash
curl -X POST http://localhost:3000/api/digest \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      {
        "from": "urgent@company.com",
        "subject": "Server Down!",
        "snippet": "Production server is experiencing issues...",
        "timestamp": "2024-03-15T14:00:00Z"
      },
      {
        "from": "team@company.com",
        "subject": "Meeting Tomorrow",
        "snippet": "Budget review at 10 AM...",
        "timestamp": "2024-03-15T09:00:00Z"
      }
    ],
    "userId": "demo-user",
    "threadId": "test-digest-1"
  }'
```

**Test with JavaScript:**

```javascript
const response = await fetch('http://localhost:3000/api/digest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emails: [
      {
        from: 'sender@example.com',
        subject: 'Important Update',
        snippet: 'Email content here...'
      }
    ]
  })
});

const result = await response.json();
console.log(result.digest);
```

### Option 3: Use in Your Code

```typescript
import { mastra } from '@/src/mastra';

const agent = mastra.getAgent('emailDigestAgent');

const response = await agent.generate(
  'Generate digest from these emails: ...',
  {
    memory: {
      resource: 'user-123',
      thread: 'digest-001'
    }
  }
);

console.log(response.text);
```

## 📋 What the Digest Includes

The agent automatically organizes emails into:

1. **Overview** - Quick summary of all emails
2. **Urgent/Priority Items** - Time-sensitive matters
3. **Action Items** - Things that need your response
4. **By Theme** - Related emails grouped together
5. **FYI Items** - Informational emails

## 💡 Example Output

```
**Overview**
You received 7 emails covering urgent technical issues, meetings,
administrative updates, and project milestones.

**Urgent/Priority Items**
1. Production Server Down (john.smith@company.com) - Server has been
   down since 2 PM, requires immediate investigation
2. Password Reset Required (security@company.com) - Must reset password
   within 24 hours

**Action Items**
- Investigate and resolve production server downtime
- Prepare budget report for tomorrow's 10 AM meeting
- Reset account password within 24 hours
- Schedule Project Alpha Milestone 3 review meeting

**By Theme/Topic**

Administrative:
- Benefits enrollment deadline extended to March 31st
- March newsletter now available on intranet

Finance:
- Q4 budget review meeting tomorrow at 10 AM
- Invoice #12345 payment confirmed

**FYI/Low Priority**
- Company newsletter for March (marketing@company.com)
- Project Alpha Milestone 3 completed ahead of schedule
```

## 🔄 Follow-up Questions

After generating a digest, you can ask follow-up questions:

```bash
# Using the same threadId from the initial digest
curl "http://localhost:3000/api/digest?question=Which%20emails%20need%20immediate%20replies&threadId=test-digest-1&userId=demo-user"
```

The agent remembers the context and can answer questions like:
- "Which emails require immediate action?"
- "What meetings are scheduled?"
- "Are there any urgent security issues?"
- "Summarize the action items"

## ⚙️ Configuration

The agent is configured with:
- **Model**: Google Gemini 2.5 Flash Lite (fast and cost-effective)
- **Memory**: Last 10 messages stored
- **Storage**: LibSQL database (`mastra-memory.db`)

### Required Environment Variable

Make sure you have this in your `.env` file:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Don't have a key? Get one at: https://aistudio.google.com/app/apikey

## 📚 More Examples

Check out these files for detailed examples:

1. **API Usage**: `API_DOCUMENTATION.md`
2. **Agent Usage**: `src/mastra/agents/README.md`
3. **Code Examples**: `src/mastra/agents/email-digest-agent.example.ts`

## 🧪 Testing Scenarios

Try these to explore the agent's capabilities:

### 1. Urgent Items Detection
```javascript
const emails = [
  { from: 'security@co.com', subject: 'URGENT: Security Alert', snippet: '...' },
  { from: 'team@co.com', subject: 'FYI: Newsletter', snippet: '...' }
];
// Agent will prioritize the security alert
```

### 2. Theme Grouping
```javascript
const emails = [
  { subject: 'Meeting: Project A', snippet: '...' },
  { subject: 'Meeting: Project B', snippet: '...' },
  { subject: 'Invoice Payment', snippet: '...' }
];
// Agent will group meetings together
```

### 3. Action Items Extraction
```javascript
const emails = [
  { snippet: 'Please review the report by Friday...' },
  { snippet: 'Need your approval on the budget...' }
];
// Agent will identify required actions
```

## 🎯 Common Use Cases

1. **Morning Email Digest** - Start your day with a summary
2. **Team Updates** - Digest team communications
3. **Client Communications** - Summarize client emails
4. **Project Updates** - Track project-related emails
5. **Support Tickets** - Summarize support requests

## 🔧 Troubleshooting

**Agent not found?**
- Check that `src/mastra/index.ts` imports and registers the agent

**No digest generated?**
- Verify your API key is set in `.env`
- Check the console for error messages

**Memory not working?**
- Ensure you're using the same `threadId` for follow-ups
- Both `resource` and `thread` IDs are required

**API endpoint not responding?**
- Confirm the dev server is running
- Check the URL: `http://localhost:3000/api/digest`

## 🎉 Next Steps

1. **Test it out** - Run `npx tsx test-email-digest.ts`
2. **Try the API** - Use the cURL examples above
3. **Integrate** - Use the agent in your application
4. **Customize** - Modify the agent instructions for your needs
5. **Explore** - Check out the full documentation

## 📞 Need Help?

- Read the full API docs: `API_DOCUMENTATION.md`
- Check agent examples: `src/mastra/agents/email-digest-agent.example.ts`
- Review agent configuration: `src/mastra/agents/email-digest-agent.ts`

---

**Ready to generate your first digest?** Run:

```bash
npx tsx test-email-digest.ts
```

🎊 Enjoy your new email digest agent!
