/**
 * Helper to get OAuth token from requestContext or environment
 *
 * For production: token comes from requestContext (passed by client)
 * For dev/test: token comes from TEST_YAHOO_OAUTH_TOKEN env variable
 */
export function getToken(params: any): string {
  // Try requestContext first (production)
  if (params && 'requestContext' in params && params.requestContext) {
    const token = params.requestContext.get('token') as string;
    if (token) {
      return token;
    }
  }

  // Fallback to test env variable (dev/test)
  const envToken = process.env.TEST_YAHOO_OAUTH_TOKEN;
  if (envToken) {
    return envToken;
  }

  throw new Error(
    'No auth token available. ' +
    'In production, pass via requestContext. ' +
    'In dev/test, set TEST_YAHOO_OAUTH_TOKEN env variable.'
  );
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
