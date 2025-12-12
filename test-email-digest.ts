/**
 * Test script for Email Digest Agent
 *
 * Run this script to test the email digest agent:
 * npx tsx test-email-digest.ts
 */

import { mastra } from './src/mastra';

const sampleEmails = [
  {
    from: 'john.smith@company.com',
    subject: 'URGENT: Production Server Down',
    snippet: 'Our production server has been experiencing downtime since 2 PM. Multiple users are reporting they cannot access the application. Please investigate immediately and provide an ETA for resolution.',
    timestamp: '2024-03-15T14:15:00Z'
  },
  {
    from: 'sarah.johnson@vendor.com',
    subject: 'Q4 Budget Review Meeting - Tomorrow at 10 AM',
    snippet: 'Hi team, just a reminder that we have the Q4 budget review meeting tomorrow at 10 AM. Please bring your department budget reports and be prepared to discuss any variances from the forecast.',
    timestamp: '2024-03-15T09:30:00Z'
  },
  {
    from: 'finance@company.com',
    subject: 'Invoice #12345 - Payment Confirmation',
    snippet: 'Thank you for your payment. Invoice #12345 has been marked as paid in our system. If you need a receipt or any additional documentation, please let me know.',
    timestamp: '2024-03-15T11:45:00Z'
  },
  {
    from: 'marketing@company.com',
    subject: 'March Newsletter Now Available',
    snippet: 'Check out this month\'s company newsletter featuring new product launches, upcoming events, and employee spotlights. The full newsletter is available on the company intranet.',
    timestamp: '2024-03-15T08:00:00Z'
  },
  {
    from: 'hr@company.com',
    subject: 'Benefits Enrollment Deadline Extended',
    snippet: 'Good news! We\'ve extended the benefits enrollment deadline to March 31st. This gives you more time to review the options and make your selections. Visit the HR portal for details.',
    timestamp: '2024-03-15T10:00:00Z'
  },
  {
    from: 'david.wilson@client.com',
    subject: 'Project Alpha - Milestone 3 Completed',
    snippet: 'I\'m pleased to report that we\'ve successfully completed Milestone 3 of Project Alpha ahead of schedule. The deliverables have been uploaded to the shared drive. Let\'s schedule a review meeting next week.',
    timestamp: '2024-03-15T16:30:00Z'
  },
  {
    from: 'security@company.com',
    subject: 'IMMEDIATE ACTION REQUIRED: Password Reset',
    snippet: 'We detected unusual activity on your account. For security reasons, you must reset your password within 24 hours. Click the secure link in this email to proceed. Do not ignore this message.',
    timestamp: '2024-03-15T13:00:00Z'
  }
];

async function testEmailDigest() {
  console.log('🚀 Testing Email Digest Agent\n');
  console.log('=' .repeat(60));

  try {
    // Get the agent
    const agent = mastra.getAgent('emailDigestAgent');
    console.log('✅ Agent retrieved successfully');
    console.log(`   Agent Name: ${agent.name}`);
    console.log(`   Agent ID: ${agent.id}\n`);

    // Format emails for the agent
    const emailsText = sampleEmails
      .map((email, index) =>
        `Email ${index + 1}:
From: ${email.from}
Subject: ${email.subject}
Time: ${email.timestamp}
Content: ${email.snippet}
---`
      )
      .join('\n\n');

    console.log('📧 Processing', sampleEmails.length, 'email snippets...\n');

    // Generate digest
    const prompt = `Please generate an email digest from the following ${sampleEmails.length} emails:\n\n${emailsText}`;

    const response = await agent.generate(prompt, {
      memory: {
        resource: 'test-user',
        thread: 'test-digest-' + Date.now()
      }
    });

    console.log('=' .repeat(60));
    console.log('📊 EMAIL DIGEST GENERATED\n');
    console.log(response.text);
    console.log('\n' + '='.repeat(60));

    // Test follow-up question
    console.log('\n🔍 Testing follow-up question...\n');

    const followUpResponse = await agent.generate(
      'Which emails require immediate action?',
      {
        memory: {
          resource: 'test-user',
          thread: 'test-digest-' + Date.now()
        }
      }
    );

    console.log('💡 FOLLOW-UP RESPONSE:\n');
    console.log(followUpResponse.text);
    console.log('\n' + '='.repeat(60));

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error during test:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testEmailDigest();
