import { createHmac } from 'crypto';

const YAI_SERVER_URL = process.env.YAI_SERVER_URL || 'http://localhost:8080';
const SOFTWARE_ID = 'YahooMailIosMobile';
const BASE_PATH = '/yai/life-graph-agent';

function makeAppToken(): string {
  const secret = process.env.MAIL_LITE_APP_SECRET;
  if (!secret) throw new Error('MAIL_LITE_APP_SECRET env var is not set');
  const timestamp = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', secret)
    .update(SOFTWARE_ID + String(timestamp))
    .digest('hex');
  return `${timestamp}:${sig}`;
}

function buildUrl(path: string, queryParams?: Record<string, string>): string {
  const params = new URLSearchParams({ appid: SOFTWARE_ID, ...queryParams });
  return `${YAI_SERVER_URL}${BASE_PATH}${path}?${params}`;
}

// Logs the outgoing call to yai-node so we can see the exact method + URL the
// proxy sends (e.g. confirm delete goes out as POST, not DELETE).
async function loggedFetch(method: string, url: string, init: RequestInit): Promise<Response> {
  console.log(`[yai-life-graph] → ${method} ${url}`);
  try {
    const res = await fetch(url, init);
    console.log(`[yai-life-graph] ← ${method} ${url} ${res.status}`);
    return res;
  } catch (err) {
    console.error(`[yai-life-graph] ✗ ${method} ${url}`, err);
    throw err;
  }
}

export async function yaiLifeGraphGet(
  token: string,
  path: string,
  queryParams?: Record<string, string>
): Promise<Response> {
  const url = buildUrl(path, queryParams);
  return loggedFetch('GET', url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-App-Token': makeAppToken(),
    },
  });
}

export async function yaiLifeGraphPost(
  token: string,
  path: string,
  body: unknown
): Promise<Response> {
  const url = buildUrl(path);
  return loggedFetch('POST', url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-App-Token': makeAppToken(),
    },
    body: JSON.stringify(body),
  });
}

export async function yaiLifeGraphDelete(
  token: string,
  path: string,
  queryParams?: Record<string, string>
): Promise<Response> {
  // Delete goes out as POST (yai-node has no DELETE route — POST /delete only).
  const url = buildUrl(path, queryParams);
  return loggedFetch('POST', url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-App-Token': makeAppToken(),
    },
  });
}
