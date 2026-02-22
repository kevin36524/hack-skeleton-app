/**
 * Helper to get OAuth token from requestContext or environment
 *
 * For production: token comes from requestContext (passed by client)
 * For dev/test: token comes from TEST_YAHOO_OAUTH_TOKEN env variable
 */
export function getToken(params: any): string {
  if (params && 'requestContext' in params && params.requestContext) {
    const token = params.requestContext.get('token') as string;
    if (token) {
      return token;
    }
    console.warn('[getToken] requestContext present but token was empty/null');
  } else {
    console.warn('[getToken] no requestContext in params, keys:', params ? Object.keys(params) : null);
  }

  throw new Error('No auth token available. Pass via requestContext.');
}

/**
 * Helper to get accountId from requestContext or environment
 *
 * For production: accountId comes from requestContext (passed by client)
 * For dev/test: accountId comes from TEST_YAHOO_ACCOUNT_ID env variable
 */
export function getAccountId(params: any): string | undefined {
  // Try requestContext first (production)
  if (params && 'requestContext' in params && params.requestContext) {
    const accountId = params.requestContext.get('accountId') as string;
    if (accountId) {
      return accountId;
    }
  }

  // Fallback to test env variable (dev/test)
  const envAccountId = process.env.TEST_YAHOO_ACCOUNT_ID;
  if (envAccountId) {
    return envAccountId;
  }

  // accountId is optional, so return undefined if not found
  return undefined;
}
