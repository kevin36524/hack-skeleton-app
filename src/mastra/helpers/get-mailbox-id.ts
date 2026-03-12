import { yahooGet } from './yahoo-api';
import type { GetMailBoxApiResponse } from '../../../lib/types/api';

const MAILBOX_KEY = 'mailboxId';

/**
 * Fetch the primary mailbox ID for the given OAuth token.
 * Caches the result in requestContext so subsequent tools in the same request
 * skip the extra API call.
 */
export async function getMailboxId(token: string, context?: any): Promise<string> {
  const cached = context?.requestContext?.get(MAILBOX_KEY) as string | undefined;
  if (cached) return cached;

  const response = await yahooGet<GetMailBoxApiResponse>(token, '/mailboxes');
  const primary = response.mailboxes.find((mb) => mb.isPrimary);
  if (!primary) {
    throw new Error('No primary mailbox found');
  }

  context?.requestContext?.set(MAILBOX_KEY, primary.id);
  return primary.id;
}
