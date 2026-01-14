import { NextRequest, NextResponse } from 'next/server';
import { spacesService } from '@/lib/services/spaces-service';

/**
 * GET /api/spaces
 *
 * Fetches spaces for a given account using the Yahoo Mail Autopilot API
 *
 * Query Parameters:
 * - acctId (required): The account identifier
 * - retryCount (optional): Number of retry attempts (default: 0)
 * - genAI (optional): Whether to use generative AI features (default: true)
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

    // Call the spaces service
    const spacesResponse = await spacesService.getSpaces(
      acctId,
      retryCountNum,
      genAIBool
    );

    return NextResponse.json(spacesResponse, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch spaces:', error);

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
