import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/gmail/read-emails
 * 
 * Fetch last N read emails (is:read query)
 * 
 * Query params:
 * - maxResults: number of emails to fetch (default: 100)
 * - includeMetadata: if true, returns full message details (default: false)
 * 
 * Response:
 * {
 *   "messages": [
 *     {
 *       "id": "...",
 *       "threadId": "...",
 *       "labelIds": [...],
 *       "snippet": "...",
 *       "payload": { ... }, // if includeMetadata=true
 *       "internalDate": "...",
 *       "headers": {        // if includeMetadata=true
 *         "from": [{ "name": "...", "email": "..." }],
 *         "subject": "...",
 *         "date": "..."
 *       }
 *     }
 *   ],
 *   "resultSizeEstimate": 100
 * }
 */

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '100');
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });

    const gmail = google.gmail({ version: 'v1', auth });

    // Fetch read emails using is:read query
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:read',
    });

    const messages = listResponse.data.messages || [];
    const resultSizeEstimate = listResponse.data.resultSizeEstimate || 0;

    // If metadata is requested, fetch full details for each message
    if (includeMetadata && messages.length > 0) {
      const detailedMessages = await Promise.all(
        messages.map(async (msg) => {
          try {
            const detailResponse = await gmail.users.messages.get({
              userId: 'me',
              id: msg.id!,
              format: 'metadata',
              metadataHeaders: ['From', 'Subject', 'Date', 'To'],
            });

            const messageData = detailResponse.data;
            const headers = messageData.payload?.headers || [];

            // Helper to get header value
            const getHeader = (name: string) => {
              const header = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase());
              return header?.value || '';
            };

            // Parse From header
            const fromHeader = getHeader('from');
            const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [];
            const fromName = fromMatch[1]?.trim().replace(/^["']|["']$/g, '') || '';
            const fromEmail = fromMatch[2]?.trim() || fromHeader.trim();

            // Parse To header
            const toHeader = getHeader('to');
            const toEmails = toHeader.split(',').map((email: string) => {
              const match = email.trim().match(/^(.+?)\s*<(.+?)>$/) || [];
              return {
                name: match[1]?.trim().replace(/^["']|["']$/g, '') || '',
                email: match[2]?.trim() || email.trim(),
              };
            });

            return {
              id: messageData.id,
              threadId: messageData.threadId,
              labelIds: messageData.labelIds || [],
              snippet: messageData.snippet || '',
              internalDate: messageData.internalDate,
              headers: {
                from: [{
                  name: fromName,
                  email: fromEmail,
                }],
                to: toEmails,
                subject: getHeader('subject'),
                date: getHeader('date'),
              },
            };
          } catch (error) {
            console.error(`Error fetching message ${msg.id}:`, error);
            return {
              id: msg.id,
              threadId: msg.threadId,
              error: true,
            };
          }
        })
      );

      return NextResponse.json({
        messages: detailedMessages,
        resultSizeEstimate,
      });
    }

    // Return basic message list without metadata
    return NextResponse.json({
      messages,
      resultSizeEstimate,
    });
  } catch (error: any) {
    console.error('Read emails API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch read emails' },
      { status: error.status || 500 }
    );
  }
}
