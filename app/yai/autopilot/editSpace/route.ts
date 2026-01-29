import { NextRequest, NextResponse } from 'next/server';

const SPACES_BASE_URL = 'https://stg-mobile.mail.yahoo.com/yai/autopilot';

/**
 * POST /yai/autopilot/editSpace
 *
 * Server-side proxy for editing spaces in Yahoo Mail Autopilot API
 * This route exists to avoid CORS issues when making requests from the browser
 *
 * Query Parameters:
 * - retryCount (optional): Number of retry attempts (default: 0)
 * - genAI (optional): Whether to use generative AI features (default: true)
 * - name (optional): Operation name (default: "EditSpace")
 * - appid (optional): Application ID (default: YahooMailIosMobile)
 * - appVer (optional): Application version (default: 7.84.0_75832Dogfood-AdHoc)
 * - isGCP (optional): Whether using GCP (default: false)
 * - mailboxLocation (optional): Mailbox location (default: ONPREM)
 *
 * Headers:
 * - Authorization: Bearer token (required)
 *
 * Request Body:
 * - accountId (required): The account identifier
 * - spaceId (required): The space identifier to edit
 * - updateObj (required): Object containing updates (e.g., emailSenders, keywords, etc.)
 *
 * Example:
 * POST /yai/autopilot/editSpace?retryCount=0&genAI=true&appid=YahooMailIosMobile&appVer=7.84.0_75832Dogfood-AdHoc
 * Body: {
 *   "accountId": "180001",
 *   "spaceId": "c538ac2e-b057-4c98-bfdb-f0aebfd15886",
 *   "updateObj": {
 *     "emailSenders": [
 *       { "email": "user@example.com", "name": "User Name" }
 *     ]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const retryCount = searchParams.get('retryCount');
    const genAI = searchParams.get('genAI');
    const name = searchParams.get('name');
    const appid = searchParams.get('appid');
    const appVer = searchParams.get('appVer');
    const isGCP = searchParams.get('isGCP');
    const mailboxLocation = searchParams.get('mailboxLocation');

    // Parse request body
    const body = await request.json();
    const { accountId, spaceId, updateObj } = body;

    // Validate required parameters from body
    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required in request body' },
        { status: 400 }
      );
    }

    if (!spaceId) {
      return NextResponse.json(
        { error: 'spaceId is required in request body' },
        { status: 400 }
      );
    }

    if (!updateObj) {
      return NextResponse.json(
        { error: 'updateObj is required in request body' },
        { status: 400 }
      );
    }

    // Parse optional parameters with defaults
    const retryCountNum = retryCount ? parseInt(retryCount, 10) : 0;
    const genAIBool = genAI ? genAI === 'true' : true;
    const operationName = name || 'EditSpace';
    const appidStr = appid || 'YahooMailIosMobile';
    const appVerStr = appVer || '7.84.0_75832Dogfood-AdHoc';
    const isGCPStr = isGCP || 'false';
    const mailboxLocationStr = mailboxLocation || 'ONPREM';

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

    // Generate a unique request ID (ymreqid)
    const ymreqid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Build query parameters for Yahoo API
    const yahooParams = new URLSearchParams({
      appid: appidStr,
      appVer: appVerStr,
      ymreqid,
      name: operationName,
      retryCount: retryCountNum.toString(),
      isGCP: isGCPStr,
      mailboxLocation: mailboxLocationStr,
      genAI: genAIBool.toString()
    });

    // Construct the Yahoo API URL
    const yahooUrl = `${SPACES_BASE_URL}/editSpace?${yahooParams.toString()}`;

    console.log('[EDIT SPACE API] Making request to:', yahooUrl);
    console.log('[EDIT SPACE API] Request body:', JSON.stringify(body, null, 2));

    // Make server-side request to Yahoo API
    const response = await fetch(yahooUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify(body),
    });

    console.log('[EDIT SPACE API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[EDIT SPACE API] Error response:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to edit space in Yahoo API',
          details: errorText || response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[EDIT SPACE API] Success - Space edited:', spaceId);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[EDIT SPACE API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to edit space',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
