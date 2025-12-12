/**
 * Email Digest Agent - Usage Example
 *
 * This example demonstrates how to use the email digest agent to generate
 * summaries from an array of email snippets.
 */

import { mastra } from "../index";

// Example email snippets
const emailSnippets = [
  {
    from: "john@company.com",
    subject: "Urgent: Q4 Budget Review Meeting Tomorrow",
    snippet: "Hi team, please prepare your Q4 budget reports for tomorrow's meeting at 10 AM. We need to finalize numbers before the board presentation on Friday.",
    timestamp: "2024-03-15T09:30:00Z"
  },
  {
    from: "sarah@vendor.com",
    subject: "Re: Invoice #12345",
    snippet: "Thanks for the payment. The invoice has been marked as paid. Let me know if you need any additional documentation.",
    timestamp: "2024-03-15T11:45:00Z"
  },
  {
    from: "marketing@company.com",
    subject: "Weekly Newsletter: March Edition",
    snippet: "Check out this week's highlights including new product launches and upcoming events. Full newsletter available on our intranet.",
    timestamp: "2024-03-15T08:00:00Z"
  },
  {
    from: "support@client.com",
    subject: "URGENT: Production Server Down",
    snippet: "Our production server has been down since 2 PM. Users are unable to access the application. Please investigate immediately.",
    timestamp: "2024-03-15T14:15:00Z"
  },
  {
    from: "hr@company.com",
    subject: "Benefits Enrollment Deadline Extended",
    snippet: "Good news! The benefits enrollment deadline has been extended to March 31st. Take your time reviewing the options.",
    timestamp: "2024-03-15T10:00:00Z"
  }
];

async function generateEmailDigest() {
  // Get the email digest agent
  const agent = mastra.getAgent("emailDigestAgent");

  // Format the email snippets into a readable format for the agent
  const emailsText = emailSnippets
    .map((email, index) =>
      `Email ${index + 1}:
From: ${email.from}
Subject: ${email.subject}
Time: ${email.timestamp}
Content: ${email.snippet}
---`
    )
    .join("\n\n");

  // Generate the digest
  const prompt = `Please generate an email digest from the following emails:\n\n${emailsText}`;

  try {
    const response = await agent.generate(prompt, {
      memory: {
        resource: "user-123",
        thread: "digest-session-001"
      }
    });

    console.log("=== EMAIL DIGEST ===\n");
    console.log(response.text);
    console.log("\n=== END DIGEST ===");

    return response.text;
  } catch (error) {
    console.error("Error generating email digest:", error);
    throw error;
  }
}

// Example: Generate digest with follow-up question
async function generateDigestWithFollowUp() {
  const agent = mastra.getAgent("emailDigestAgent");

  // First, generate the initial digest
  const emailsText = emailSnippets
    .map((email, index) =>
      `Email ${index + 1}:
From: ${email.from}
Subject: ${email.subject}
Content: ${email.snippet}
---`
    )
    .join("\n\n");

  const initialPrompt = `Please generate an email digest from the following emails:\n\n${emailsText}`;

  const initialResponse = await agent.generate(initialPrompt, {
    memory: {
      resource: "user-123",
      thread: "digest-session-002"
    }
  });

  console.log("=== INITIAL DIGEST ===\n");
  console.log(initialResponse.text);

  // Follow-up question (the agent will remember the previous digest)
  const followUpPrompt = "Which emails require immediate action?";

  const followUpResponse = await agent.generate(followUpPrompt, {
    memory: {
      resource: "user-123",
      thread: "digest-session-002"
    }
  });

  console.log("\n=== FOLLOW-UP RESPONSE ===\n");
  console.log(followUpResponse.text);
  console.log("\n=== END ===");
}

// Example: Generate digest from JSON array
async function generateDigestFromJSON() {
  const agent = mastra.getAgent("emailDigestAgent");

  const jsonPrompt = `Please generate an email digest from the following emails in JSON format:

${JSON.stringify(emailSnippets, null, 2)}`;

  const response = await agent.generate(jsonPrompt, {
    memory: {
      resource: "user-456",
      thread: "json-digest-001"
    }
  });

  console.log(response.text);
}

// Export functions for use in other files
export {
  generateEmailDigest,
  generateDigestWithFollowUp,
  generateDigestFromJSON
};

// Uncomment to run examples:
// generateEmailDigest();
// generateDigestWithFollowUp();
// generateDigestFromJSON();
