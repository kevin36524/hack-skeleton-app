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

/**
 * GET request to Yahoo Mail API
 */
export async function yahooGet<T>(token: string, endpoint: string): Promise<T> {
  // Add appid as query parameter
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${YAHOO_API_BASE_URL}${endpoint}${separator}appid=${APP_ID}`;

  const headers: YahooApiHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: 'GET',
    headers: headers as unknown as HeadersInit,
  });

  if (!response.ok) {
    throw new Error(`Yahoo API GET failed: ${response.status} ${response.statusText} ${url}`);
  }

  const data = await response.json();
  // Yahoo API wraps responses in { result: {...} }
  return (data.result || data) as T;
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

  const response = await fetch(url, {
    method: 'POST',
    headers: headers as unknown as HeadersInit,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Yahoo API POST failed: ${response.status} ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  // Yahoo API wraps responses in { result: {...} }
  return (data.result || data) as T;
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

  const response = await fetch(url, {
    method: 'DELETE',
    headers: headers as unknown as HeadersInit,
  });

  if (!response.ok) {
    throw new Error(`Yahoo API DELETE failed: ${response.status} ${response.statusText}`);
  }
}
