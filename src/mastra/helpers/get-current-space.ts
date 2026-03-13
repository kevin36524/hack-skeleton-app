import { getToken, getAccountId } from './get-token';
import { yaiGet } from './yai-server-api';

const SPACES_CACHE_KEY = 'cachedSpaces';

export interface EmailSender {
  email: string;
  name?: string;
}

export interface SpaceData {
  id: string;
  name: string;
  shortName?: string;
  keywords?: string[];
  emailSenders?: EmailSender[];
  extraData?: Record<string, any>;
  [key: string]: any;
}

interface SpacesCache {
  acceptedSpaces: SpaceData[];
  suggestedSpaces: SpaceData[];
}

/**
 * Fetches all spaces (using cache if available) and returns the current space
 * identified by the referenceId in requestContext.
 *
 * Throws if no referenceId is set or the space cannot be found.
 */
export async function getCurrentSpace(context: any): Promise<{ space: SpaceData; spaceId: string }> {
  const token = getToken(context);
  const accountId = getAccountId(context);
  if (!accountId) throw new Error('accountId is required');

  const spaceId = context?.requestContext?.get('referenceId') as string | undefined;
  if (!spaceId) throw new Error('No spaceId in context — referenceId must be set');

  // Use cached spaces if available
  let cached = context?.requestContext?.get(SPACES_CACHE_KEY) as SpacesCache | undefined;

  if (!cached) {
    let response: any;
    try {
      response = await yaiGet<any>(
        token,
        `/yai/autopilot/getSpaces?acctId=${accountId}&appVer=7.80.0_74539`
      );
    } catch (err: any) {
      throw new Error(`getSpaces API failed: ${err?.message ?? err}`);
    }

    cached = {
      acceptedSpaces: Array.isArray(response?.acceptedSpaces) ? response.acceptedSpaces : [],
      suggestedSpaces: Array.isArray(response?.suggestedSpaces) ? response.suggestedSpaces : [],
    };

    context?.requestContext?.set(SPACES_CACHE_KEY, cached);
  }

  const space =
    cached.acceptedSpaces.find((s) => s.id === spaceId) ||
    cached.suggestedSpaces.find((s) => s.id === spaceId);

  if (!space) throw new Error(`Space "${spaceId}" not found`);

  return { space, spaceId };
}
