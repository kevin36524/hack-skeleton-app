import { NextRequest, NextResponse } from 'next/server';
import { intelligentSearchService } from '@/lib/services/intelligent-search-service';
import { getImapCredentials } from '@/lib/imap/client';

/**
 * POST /api/gmail/intelligent-search
 * 
 * Perform intelligent search using natural language
 * 
 * Request body:
 * {
 *   "query": "show me emails with birthday from niti in my primary inbox",
 *   "maxResults": 30,
 *   "useAgent": true  // optional, defaults to true. Set to false for quick rule-based search
 * }
 * 
 * Response:
 * {
 *   "query": "from:niti birthday in:inbox",
 *   "labelIds": ["INBOX"],
 *   "explanation": "Search for emails from niti containing 'birthday' in the inbox",
 *   "detectedParams": { ... },
 *   "messages": [ ... ]
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);

    const body = await request.json();
    const { query, maxResults = 30, useAgent = true } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('[API] Intelligent search request:', query);

    intelligentSearchService.setCredentials(email, password);

    // Perform the intelligent search
    let result;
    if (useAgent) {
      result = await intelligentSearchService.search(query, maxResults);
    } else {
      result = await intelligentSearchService.quickSearch(query, maxResults);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Intelligent search error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to perform intelligent search',
        details: error.stack || 'No stack trace available'
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * GET /api/gmail/intelligent-search?q=show me emails from john
 * 
 * Alternative GET endpoint for simple queries
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const { email, password } = getImapCredentials(authHeader);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('maxResults') || '30');
    const useAgent = searchParams.get('useAgent') !== 'false'; // defaults to true

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    console.log('[API] Intelligent search GET request:', query);

    intelligentSearchService.setCredentials(email, password);

    // Perform the intelligent search
    let result;
    if (useAgent) {
      result = await intelligentSearchService.search(query, maxResults);
    } else {
      result = await intelligentSearchService.quickSearch(query, maxResults);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Intelligent search error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to perform intelligent search',
        details: error.stack || 'No stack trace available'
      },
      { status: error.status || 500 }
    );
  }
}
