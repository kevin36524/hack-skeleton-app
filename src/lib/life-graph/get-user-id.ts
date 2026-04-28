import { yahooGet } from '@/src/mastra/helpers/yahoo-api';
import type { GetMailBoxApiResponse } from '@/lib/types/api';

const cache = new Map<string, string>();

/**
 * Returns a stable user ID in the form `{guid}_{accountId}`.
 * guid comes from the top-level mailboxes response; accountId is passed by the client.
 */
export async function getUserId(token: string, accountId: string): Promise<string> {
  const cacheKey = `${token.slice(-16)}_${accountId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const response = await yahooGet<GetMailBoxApiResponse>(token, '/mailboxes');
  if (!response.guid) throw new Error('No guid in mailboxes response');

  const uid = `${response.guid}_${accountId}`;
  console.log(`[get-user-id] guid=${response.guid} accountId=${accountId} → uid=${uid}`);
  cache.set(cacheKey, uid);
  return uid;
}
