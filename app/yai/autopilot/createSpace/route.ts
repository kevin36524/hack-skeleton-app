import { NextRequest, NextResponse } from 'next/server';

const SPACES_BASE_URL = 'https://stg-mobile.mail.yahoo.com/yai/autopilot';

/**
 * POST /yai/autopilot/createSpace
 *
 * Server-side proxy for creating spaces in Yahoo Mail Autopilot API
 * This route exists to avoid CORS issues when making requests from the browser
 *
 * Query Parameters:
 * - appid (optional): Application ID (default: YahooMailIosMobile)
 * - appVer (optional): Application version (default: 7.84.0_75832Dogfood-AdHoc)
 * - name (optional): Operation name (default: "CreateSpace")
 * - retryCount (optional): Number of retry attempts (default: 0)
 * - isGCP (optional): Whether using GCP (default: false)
 * - mailboxLocation (optional): Mailbox location (default: ONPREM)
 * - genAI (optional): Whether to use generative AI features (default: true)
 *
 * Headers:
 * - Authorization: Bearer token (required)
 *
 * Request Body:
 * - accountId (required): The account identifier
 * - userInstruction (required): User's instruction for creating the space
 *
 * Example:
 * POST /yai/autopilot/createSpace?appid=YahooMailIosMobile&appVer=7.84.0_75832Dogfood-AdHoc&name=CreateSpace&retryCount=0&isGCP=false&mailboxLocation=ONPREM&genAI=true
 * Body: {
 *   "accountId": "180001",
 *   "userInstruction": "Create a space for my traffic tickets"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const appid = searchParams.get('appid');
    const appVer = searchParams.get('appVer');
    const name = searchParams.get('name');
    const retryCount = searchParams.get('retryCount');
    const isGCP = searchParams.get('isGCP');
    const mailboxLocation = searchParams.get('mailboxLocation');
    const genAI = searchParams.get('genAI');

    // Parse request body
    const body = await request.json();
    const { accountId, userInstruction } = body;

    // Validate required parameters from body
    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required in request body' },
        { status: 400 }
      );
    }

    if (!userInstruction) {
      return NextResponse.json(
        { error: 'userInstruction is required in request body' },
        { status: 400 }
      );
    }

    // Parse optional parameters with defaults
    const appidStr = appid || 'YahooMailIosMobile';
    const appVerStr = appVer || '7.84.0_75832Dogfood-AdHoc';
    const operationName = name || 'CreateSpace';
    const retryCountNum = retryCount ? parseInt(retryCount, 10) : 0;
    const isGCPStr = isGCP || 'false';
    const mailboxLocationStr = mailboxLocation || 'ONPREM';
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
    const yahooUrl = `${SPACES_BASE_URL}/createSpace?${yahooParams.toString()}`;

    console.log('[CREATE SPACE API] Making request to:', yahooUrl);
    console.log('[CREATE SPACE API] Request body:', JSON.stringify(body, null, 2));

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

    console.log('[CREATE SPACE API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CREATE SPACE API] Error response:', errorText);
      return NextResponse.json(
        {
          error: 'Failed to create space in Yahoo API',
          details: errorText || response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[CREATE SPACE API] Success - Space created');

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[CREATE SPACE API] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to create space',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
