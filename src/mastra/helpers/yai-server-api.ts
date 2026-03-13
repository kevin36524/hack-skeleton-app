/**
 * YAI Node Server API helper
 *
 * Thin wrapper around fetch for calling the YAI autopilot server
 * (spaces, rules, etc.) — distinct from the Yahoo Mail messages API.
 *
 * Set YAI_SERVER_URL in .env to override (default: http://localhost:8080)
 */

const YAI_SERVER_URL = process.env.YAI_SERVER_URL || 'https://stg-mobile.mail.yahoo.com';
const APP_ID = 'YahooMailIosMobile';

/**
 * GET request to YAI server
 */
export async function yaiGet<T>(token: string, path: string): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${YAI_SERVER_URL}${path}${separator}appid=${APP_ID}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '(could not read body)');
    throw new Error(`YAI server GET failed: ${response.status} ${response.statusText} — ${errorText}`);
  }

  return response.json();
}

/**
 * POST request to YAI server
 */
export async function yaiPost<T>(token: string, path: string, body: unknown): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${YAI_SERVER_URL}${path}${separator}appid=${APP_ID}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '(could not read body)');
    throw new Error(`YAI server POST failed: ${response.status} ${response.statusText} — ${errorText}`);
  }

  return response.json();
}
