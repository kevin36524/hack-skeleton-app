import { NextRequest, NextResponse } from 'next/server';

const SPACES_BASE_URL = 'https://stg-mobile.mail.yahoo.com/yai/autopilot';

/**
 * GET /api/spaces
 *
 * Server-side proxy for fetching spaces from Yahoo Mail Autopilot API
 * This route exists to avoid CORS issues when making requests from the browser
 *
 * Query Parameters:
 * - acctId (required): The account identifier
 * - retryCount (optional): Number of retry attempts (default: 0)
 * - genAI (optional): Whether to use generative AI features (default: true)
 *
 * Headers:
 * - Authorization: Bearer token (required)
 *
 * Automatically Added Parameters:
 * - appid: YahooMailIosMobile (fixed)
 * - appVer: 7.78.0_74539 (fixed)
 *
 * Example:
 * GET /api/spaces?acctId=account-123
 * GET /api/spaces?acctId=account-123&retryCount=1&genAI=false
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const acctId = searchParams.get('acctId');
    const retryCount = searchParams.get('retryCount');
    const genAI = searchParams.get('genAI');

    // Validate required parameters
    if (!acctId) {
      return NextResponse.json(
        { error: 'acctId query parameter is required' },
        { status: 400 }
      );
    }

    // Parse optional parameters
    const retryCountNum = retryCount ? parseInt(retryCount, 10) : 0;
    const genAIBool = genAI ? genAI === 'true' : true;

    // Validate parsed parameters
    if (isNaN(retryCountNum)) {
      return NextResponse.json(
        { error: 'retryCount must be a valid number' },
        { status: 400 }
      );
    }

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Build query parameters for Yahoo API
    const yahooParams = new URLSearchParams({
      acctId,
      appid: 'YahooMailIosMobile',
      retryCount: retryCountNum.toString(),
      genAI: genAIBool.toString(),
      appVer: '7.78.0_74539'
    });

    // Construct the Yahoo API URL
    const yahooUrl = `${SPACES_BASE_URL}/getSpaces?${yahooParams.toString()}`;

    console.log('[SPACES API] Making request to:', yahooUrl);

    // Make server-side request to Yahoo API
    const response = await fetch(yahooUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('[SPACES API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SPACES API] Error response:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to fetch spaces from Yahoo API',
          details: errorText || response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[SPACES API] Success, spaces count:', data.spaces?.length || 0);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[SPACES API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to fetch spaces',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
