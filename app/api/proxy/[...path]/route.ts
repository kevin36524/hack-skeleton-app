import { NextRequest, NextResponse } from 'next/server';

const YAHOO_API_BASE = 'https://apis.mail.yahoo.com/ws/v3';
const APP_ID = 'YahooMailIosMobile';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, params, 'DELETE');
}

async function handleProxy(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const { path } = await params;
    const pathStr = path ? path.join('/') : '';

    // Get the full URL from Yahoo Mail API
    const url = new URL(`${YAHOO_API_BASE}/${pathStr}`);

    // Add appid parameter
    url.searchParams.set('appid', APP_ID);

    // Copy all query parameters from the original request
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      if (key !== 'appid') {
        url.searchParams.set(key, value);
      }
    });

    // Get authorization header from the original request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Prepare headers for Yahoo API
    const headers: Record<string, string> = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    };

    // Copy other relevant headers
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    // Make the request to Yahoo API
    console.log('[PROXY] Making request to:', url.toString());
    console.log('[PROXY] Method:', method);

    let response: Response;
    try {
      response = await fetch(url.toString(), options);
      console.log('[PROXY] Response status:', response.status);
    } catch (error) {
      console.error('[PROXY] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to connect to Yahoo API' },
        { status: 502 }
      );
    }

    // Get the complete response data
    const contentType = response.headers.get('content-type') || '';
    let responseData: string;

    if (contentType.includes('application/json')) {
      const parsedData = await response.json();
      responseData = JSON.stringify(parsedData);
      console.log('[PROXY] Response received (JSON)');
    } else {
      responseData = await response.text();
      console.log('[PROXY] Response received (text)');
    }

    // Create response with proper headers
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy response headers
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip problematic headers that might cause issues
      if (!['content-encoding', 'transfer-encoding', 'content-length', 'connection'].includes(lowerKey)) {
        nextResponse.headers.set(key, value);
      }
    });

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Ensure content-length is set correctly
    nextResponse.headers.set('Content-Length', Buffer.byteLength(responseData, 'utf8').toString());

    return nextResponse;

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
