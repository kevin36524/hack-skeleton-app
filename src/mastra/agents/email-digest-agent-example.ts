/**
 * Example Usage: Email Digest Agent
 *
 * This example demonstrates how to use the emailDigestAgent to generate
 * a daily digest summary from an array of email snippets.
 */

import { mastra } from '../index';

// Example function to generate email digest
export async function generateEmailDigest(emailSnippets: string[]) {
  const agent = mastra.getAgent('emailDigestAgent');

  // Format the email snippets into a message
  const emailList = emailSnippets
    .map((snippet, index) => `Email ${index + 1}:\n${snippet}`)
    .join('\n\n---\n\n');

  const message = `Please generate a daily digest summary for the following emails:\n\n${emailList}`;

  // Generate the digest
  const response = await agent.generate(message, {
    memory: {
      resource: 'user-123', // Replace with actual user ID
      thread: `digest-${new Date().toISOString().split('T')[0]}`, // Use date as thread ID
    },
  });

  return response.text;
}

// Example usage:
// const emailSnippets = [
//   "Subject: Project Update\nFrom: john@example.com\nThe Q4 project is 80% complete. Need approval for final phase by Friday.",
//   "Subject: Team Meeting\nFrom: sarah@example.com\nTeam sync scheduled for tomorrow at 2 PM. Please review the attached agenda.",
//   "Subject: Customer Inquiry\nFrom: customer@client.com\nUrgent: We need assistance with the API integration. Production issue affecting 500 users.",
//   "Subject: Invoice #12345\nFrom: billing@vendor.com\nYour invoice is due in 5 days. Amount: $2,450.00",
// ];
//
// const digest = await generateEmailDigest(emailSnippets);
// console.log(digest);
