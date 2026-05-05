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

export async function yaiLifeGraphGet(
  token: string,
  path: string,
  queryParams?: Record<string, string>
): Promise<Response> {
  return fetch(buildUrl(path, queryParams), {
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
  return fetch(buildUrl(path), {
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
  return fetch(buildUrl(path, queryParams), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-App-Token': makeAppToken(),
    },
  });
}
