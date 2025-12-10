import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const emailSummarizer = new Agent({
  id: "email-summarizer",
  name: "Email Summarizer",
  instructions: `You are an expert at analyzing and summarizing emails concisely.

Your task:
- Read the provided email content carefully
- Extract the key points, main message, and any action items
- Provide a SHORT summary (2-4 sentences maximum)
- Highlight any urgent items, deadlines, or required actions
- Maintain the original tone and intent of the email

Format your summary as:
**Summary:** [Brief overview of the email's main purpose]
**Key Points:** [Bullet points if there are multiple important items]
**Action Required:** [If any action is needed from the recipient]

Keep it concise, clear, and actionable.`,
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
