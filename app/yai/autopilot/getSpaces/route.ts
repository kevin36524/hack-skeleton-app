import { NextRequest, NextResponse } from 'next/server';
import { Space, GetSpacesApiResponse } from '@/lib/types/api';
import { generateAllowlistedPhrases, findSimilarEmails } from '@/lib/services/spaces-processing';

const SPACES_BASE_URL = 'https://stg-mobile.mail.yahoo.com/yai/autopilot';
const EDIT_SPACES_BASE_URL = 'https://stg-mobile.mail.yahoo.com/yai/autopilot';

// Helper to check if filteredMessageIds need updating (older than 7 days)
function needsUpdate(space: Space): boolean {
  const mids = space.extraData?.filteredMessageIds;
  const updatedAt = space.extraData?.filteredMessageIdsUpdatedAt;

  // If no mids exist, needs update
  if (!mids || mids.length === 0) {
    return true;
  }

  // If no timestamp, needs update
  if (!updatedAt) {
    return true;
  }

  // Check if older than 7 days
  const lastUpdate = new Date(updatedAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return lastUpdate < sevenDaysAgo;
}

/**
 * GET /yai/autopilot/getSpaces
 *
 * Server-side proxy for fetching spaces from Yahoo Mail Autopilot API
 * This route exists to avoid CORS issues when making requests from the browser
 *
 * Query Parameters:
 * - acctId (required): The account identifier
 * - mailboxId (optional): The mailbox identifier (needed for auto-processing)
 * - guid (optional): The user GUID (needed for auto-processing)
 * - retryCount (optional): Number of retry attempts (default: 0)
 * - genAI (optional): Whether to use generative AI features (default: true)
 * - appid (optional): Application ID (default: YahooMailIosMobile)
 * - appVer (optional): Application version (default: 7.78.0_74539)
 *
 * Headers:
 * - Authorization: Bearer token (required)
 *
 * Auto-Processing:
 * - If mailboxId and guid are provided, accepted spaces will be automatically processed
 * - For each accepted space, if filteredMessageIds are missing or older than 7 days:
 *   - Generates allowlisted phrases using Gemini
 *   - Finds semantically similar emails using embeddings
 *   - Updates the space with new mids and phrases
 *
 * Example:
 * GET /yai/autopilot/getSpaces?acctId=1&appid=YahooMailIosMobile&retryCount=0&genAI=true&appVer=7.78.0_74539
 * GET /yai/autopilot/getSpaces?acctId=account-123&mailboxId=mb-456&guid=user-guid-789
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const acctId = searchParams.get('acctId');
    const mailboxId = searchParams.get('mailboxId');
    const guid = searchParams.get('guid');
    const retryCount = searchParams.get('retryCount');
    const genAI = searchParams.get('genAI');
    const appid = searchParams.get('appid');
    const appVer = searchParams.get('appVer');

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
    const appidStr = appid || 'YahooMailIosMobile';
    const appVerStr = appVer || '7.78.0_74539';

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

    // Build query parameters for Yahoo API - forward all incoming params
    const yahooParams = new URLSearchParams(searchParams);

    // Ensure defaults for required parameters if not provided
    if (!yahooParams.has('appid')) {
      yahooParams.set('appid', appidStr);
    }
    if (!yahooParams.has('retryCount')) {
      yahooParams.set('retryCount', retryCountNum.toString());
    }
    if (!yahooParams.has('genAI')) {
      yahooParams.set('genAI', genAIBool.toString());
    }
    if (!yahooParams.has('appVer')) {
      yahooParams.set('appVer', appVerStr);
    }

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

    const data: GetSpacesApiResponse = await response.json();
    console.log('[SPACES API] Success - Suggested:', data.suggestedSpaces?.length || 0, '- Accepted:', data.acceptedSpaces?.length || 0);

    // Auto-process accepted spaces if mailboxId and guid are provided
    if (mailboxId && guid && data.acceptedSpaces && data.acceptedSpaces.length > 0) {
      console.log('[SPACES API] Auto-processing accepted spaces...');

      const processedSpaces: Space[] = [];

      for (const space of data.acceptedSpaces) {
        try {
          if (needsUpdate(space)) {
            console.log(`[SPACES API] Processing space: ${space.name} (${space.id})`);

            // Step 1: Generate allowlisted phrases using Gemini (direct function call)
            console.log('[SPACES API] Step 1: Generating allowlisted phrases...');
            const allowlistedPhrases = await generateAllowlistedPhrases(space, guid, acctId);
            console.log(`[SPACES API] Generated ${allowlistedPhrases.length} phrases`);

            // Step 2: Find semantically similar emails (direct function call)
            console.log('[SPACES API] Step 2: Finding similar emails...');

            // Create updated space with new phrases
            const spaceWithPhrases = {
              ...space,
              extraData: {
                ...space.extraData,
                allowlistedPhrases
              }
            };

            const result = await findSimilarEmails(
              spaceWithPhrases,
              mailboxId,
              acctId,
              authHeader
            );
            console.log(`[SPACES API] Found ${result.filteredMessageIds.length} similar emails (${result.allowlistedMessageIds.length} allowlisted, ${result.blocklistedMessageIds.length} blocklisted)`);

            // Step 3: Update the space with new data (direct Yahoo API call)
            console.log('[SPACES API] Step 3: Updating space...');
            const updateObj = {
              extraData: {
                ...space.extraData,
                allowlistedPhrases,
                filteredMessageIds: result.filteredMessageIds,
                allowlistedMessageIds: result.allowlistedMessageIds,
                blocklistedMessageIds: result.blocklistedMessageIds,
                filteredMessageIdsUpdatedAt: new Date().toISOString()
              }
            };

            // Build query parameters for Yahoo API - forward all incoming params
            const editParams = new URLSearchParams(searchParams);

            // Override/add specific parameters for editSpace
            editParams.set('ymreqid', `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`);
            editParams.set('name', 'EditSpace');

            // Ensure defaults for required parameters if not provided
            if (!editParams.has('appid')) {
              editParams.set('appid', 'YahooMailIosMobile');
            }
            if (!editParams.has('appVer')) {
              editParams.set('appVer', '7.84.0_75832Dogfood-AdHoc');
            }
            if (!editParams.has('retryCount')) {
              editParams.set('retryCount', '0');
            }
            if (!editParams.has('genAI')) {
              editParams.set('genAI', 'true');
            }

            const editUrl = `${EDIT_SPACES_BASE_URL}/editSpace?${editParams.toString()}`;

            const editResponse = await fetch(editUrl, {
              method: 'POST',
              headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': '*/*',
              },
              body: JSON.stringify({
                accountId: acctId,
                spaceId: space.id,
                updateObj
              }),
            });

            if (!editResponse.ok) {
              const errorText = await editResponse.text();
              console.error(`[SPACES API] Failed to update space ${space.id}:`, errorText);
              processedSpaces.push(space); // Keep original space
              continue;
            }

            const editData = await editResponse.json();
            console.log(`[SPACES API] Successfully updated space: ${space.name}`);

            // Use the updated space from edit response if available
            const updatedSpace = editData.space || {
              ...space,
              extraData: updateObj.extraData
            };
            processedSpaces.push(updatedSpace);
          } else {
            console.log(`[SPACES API] Space ${space.name} is up to date (mids age < 7 days)`);
            processedSpaces.push(space);
          }
        } catch (error) {
          console.error(`[SPACES API] Error processing space ${space.id}:`, error);
          processedSpaces.push(space); // Keep original space on error
        }
      }

      // Replace accepted spaces with processed ones
      data.acceptedSpaces = processedSpaces;
      console.log('[SPACES API] Auto-processing complete');
    }

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
