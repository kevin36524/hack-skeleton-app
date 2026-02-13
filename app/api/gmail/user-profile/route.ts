import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { google } from 'googleapis';

/**
 * GET /api/gmail/user-profile
 * 
 * Analyze user's read emails and generate a profile of their interests
 * 
 * Query params:
 * - maxEmails: number of emails to analyze (default: 100)
 * 
 * Response:
 * {
 *   "profile": "# User Profile Analysis\n\n## Executive Summary...",
 *   "emailsAnalyzed": 100,
 *   "analysisTimestamp": "2024-01-15T10:30:00Z"
 * }
 */

interface EmailData {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
  }[];
  date: string;
  snippet: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { searchParams } = new URL(request.url);
    const maxEmails = parseInt(searchParams.get('maxEmails') || '100');

    // First, fetch the read emails
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: 'v1', auth });

    console.log('[USER PROFILE] Fetching read emails...');

    // Fetch read emails using is:read query
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxEmails,
      q: 'is:read',
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      return NextResponse.json({
        profile: '# User Profile Analysis\n\nNo read emails found to analyze.',
        emailsAnalyzed: 0,
        analysisTimestamp: new Date().toISOString(),
      });
    }

    console.log(`[USER PROFILE] Fetched ${messages.length} messages, getting details...`);

    // Fetch metadata for each message
    const emailData: EmailData[] = await Promise.all(
      messages.map(async (msg) => {
        try {
          const detailResponse = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject', 'Date'],
          });

          const messageData = detailResponse.data;
          const headers = messageData.payload?.headers || [];

          const getHeader = (name: string) => {
            const header = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase());
            return header?.value || '';
          };

          // Parse From header
          const fromHeader = getHeader('from');
          const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [];
          const fromName = fromMatch[1]?.trim().replace(/^["']|["']$/g, '') || '';
          const fromEmail = fromMatch[2]?.trim() || fromHeader.trim();

          return {
            id: messageData.id!,
            subject: getHeader('subject') || '(No subject)',
            from: [{
              name: fromName,
              email: fromEmail,
            }],
            date: getHeader('date'),
            snippet: messageData.snippet || '',
          };
        } catch (error) {
          console.error(`Error fetching message ${msg.id}:`, error);
          return {
            id: msg.id!,
            subject: '(Unable to fetch)',
            from: [],
            date: '',
            snippet: '',
          };
        }
      })
    );

    // Filter out any failed fetches
    const validEmails = emailData.filter(e => e.subject !== '(Unable to fetch)');

    console.log(`[USER PROFILE] Analyzing ${validEmails.length} emails with AI...`);

    // Prepare data for the agent
    const emailSummary = validEmails.map((email, index) => {
      const sender = email.from[0];
      const senderStr = sender 
        ? `${sender.name ? `${sender.name} ` : ''}${sender.email ? `<${sender.email}>` : ''}`
        : 'Unknown';
      return `${index + 1}. Subject: "${email.subject}"\n   From: ${senderStr}`;
    }).join('\n\n');

    // Get the user profile agent and generate analysis
    const agent = mastra.getAgent('user-profile-agent');
    
    const prompt = `Analyze the following ${validEmails.length} emails from the user's inbox and create a comprehensive profile of their interests and priorities.

EMAIL DATA:
${emailSummary}

Please provide a detailed analysis in markdown format.`;

    const result = await agent.generate(prompt);

    console.log('[USER PROFILE] Analysis complete');

    return NextResponse.json({
      profile: result.text,
      emailsAnalyzed: validEmails.length,
      analysisTimestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[USER PROFILE] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to analyze user profile',
        details: error.stack || 'No stack trace available'
      },
      { status: error.status || 500 }
    );
  }
}
