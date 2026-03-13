/**
 * Server-side Yahoo Mail API helper
 *
 * Thin wrapper around fetch that handles Yahoo Mail API requests with per-request auth.
 * All tools use this instead of the browser-side ApiClient singleton.
 */

const YAHOO_API_BASE_URL = 'https://apis.mail.yahoo.com/ws/v3';
const APP_ID = 'YahooMailIosMobile';

interface YahooApiHeaders {
  Authorization: string;
  'Content-Type'?: string;
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < 3) await new Promise((res) => setTimeout(res, 500 * attempt));
    }
  }
  throw new Error(`${label} failed after 3 attempts: ${lastError?.message ?? lastError}`);
}

/**
 * GET request to Yahoo Mail API
 */
export async function yahooGet<T>(token: string, endpoint: string): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${YAHOO_API_BASE_URL}${endpoint}${separator}appid=${APP_ID}`;

  const headers: YahooApiHeaders = {
    Authorization: `Bearer ${token}`,
  };

  return withRetry(async () => {
    const response = await fetch(url, {
      method: 'GET',
      headers: headers as unknown as HeadersInit,
    });

    if (!response.ok) {
      throw new Error(`Yahoo API GET failed: ${response.status} ${response.statusText} ${url}`);
    }

    const data = await response.json();
    return (data.result || data) as T;
  }, `Yahoo API GET ${endpoint}`);
}

/**
 * POST request to Yahoo Mail API
 */
export async function yahooPost<T>(
  token: string,
  endpoint: string,
  body: unknown
): Promise<T> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${YAHOO_API_BASE_URL}${endpoint}${separator}appid=${APP_ID}`;

  const headers: YahooApiHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log(`[yahooPost] POST ${url}`);
  console.log(`[yahooPost] token length: ${token?.length ?? 0}, token prefix: ${token?.slice(0, 10)}...`);
  console.log(`[yahooPost] body:`, JSON.stringify(body));

  return withRetry(async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers as unknown as HeadersInit,
      body: JSON.stringify(body),
    });

    console.log(`[yahooPost] response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '(could not read body)');
      console.error(`[yahooPost] error body: ${errorText}`);
      throw new Error(`Yahoo API POST failed: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    return (data.result || data) as T;
  }, `Yahoo API POST ${endpoint}`);
}

/**
 * DELETE request to Yahoo Mail API
 */
export async function yahooDelete(token: string, endpoint: string): Promise<void> {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${YAHOO_API_BASE_URL}${endpoint}${separator}appid=${APP_ID}`;

  const headers: YahooApiHeaders = {
    Authorization: `Bearer ${token}`,
  };

  return withRetry(async () => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers as unknown as HeadersInit,
    });

    if (!response.ok) {
      throw new Error(`Yahoo API DELETE failed: ${response.status} ${response.statusText}`);
    }
  }, `Yahoo API DELETE ${endpoint}`);
}
