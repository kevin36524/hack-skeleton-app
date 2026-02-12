/**
 * Gmail API Client for Browser
 * Routes all calls through Next.js API proxy
 */

import { refreshTokenStandalone } from '@/lib/auth-context';

let accessToken: string | null = null;

/**
 * Set access token
 */
export function setAccessToken(token: string) {
  console.log('[GMAIL CLIENT] Setting new access token:', token ? `${token.substring(0, 20)}...` : 'null');
  accessToken = token;
}

/**
 * Get access token
 */
export function getAccessToken(): string {
  if (!accessToken) {
    throw new Error('Gmail client not initialized. Please authenticate first.');
  }
  return accessToken;
}

/**
 * Check if error is due to insufficient scope/permissions
 */
export function isInsufficientScopeError(error: any): boolean {
  // Check for 403 with insufficient permissions
  if (error.status === 403 || error.message?.includes('403')) {
    const errorMessage = error.message || '';
    const errorBody = error.body || '';

    return (
      errorMessage.toLowerCase().includes('insufficient') ||
      errorMessage.toLowerCase().includes('permission') ||
      errorMessage.toLowerCase().includes('scope') ||
      errorBody.includes('PERMISSION_DENIED') ||
      errorBody.includes('insufficient authentication scopes')
    );
  }
  return false;
}

/**
 * Make authenticated request to our API proxy with automatic 401 retry
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized with automatic token refresh and retry
  if (response.status === 401 && !isRetry) {
    console.log('[GMAIL CLIENT] Got 401, attempting token refresh and retry...');

    try {
      const newToken = await refreshTokenStandalone();
      if (newToken) {
        console.log('[GMAIL CLIENT] Token refreshed, retrying request...');
        setAccessToken(newToken);
        // Retry the request once with the new token
        return apiRequest<T>(endpoint, options, true);
      }
    } catch (refreshError) {
      console.error('[GMAIL CLIENT] Token refresh failed:', refreshError);
    }

    // If refresh fails or no new token, fall through to error handling
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', response.status, errorData);

    // Create detailed error object
    const error: any = new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.body = errorData;

    // Special handling for 403 errors (insufficient scope)
    if (response.status === 403) {
      console.warn('[GMAIL CLIENT] 403 Forbidden - may require additional OAuth scopes');

      // Check if it's a scope error
      if (isInsufficientScopeError(error)) {
        console.error('[GMAIL CLIENT] Insufficient scope detected. User needs to grant additional permissions.');
        error.needsScopeUpgrade = true;
      }
    }

    throw error;
  }

  return response.json();
}

/**
 * Gmail API client methods (calls our Next.js API routes)
 */
export const gmail = {
  users: {
    getProfile: async () => {
      return apiRequest('/api/gmail/profile');
    },

    labels: {
      list: async () => {
        return apiRequest<{ labels: any[] }>('/api/gmail/labels');
      },
    },

    threads: {
      list: async (params: { labelIds?: string[]; maxResults?: number }) => {
        const { labelIds, maxResults } = params;
        const queryParams = new URLSearchParams();
        if (labelIds) queryParams.append('labelIds', labelIds.join(','));
        if (maxResults) queryParams.append('maxResults', maxResults.toString());

        return apiRequest(`/api/gmail/threads?${queryParams}`);
      },

      get: async (params: { id: string; format?: string }) => {
        const { id, format = 'full' } = params;
        return apiRequest(`/api/gmail/threads/${id}?format=${format}`);
      },
    },

    messages: {
      list: async (params: { labelIds?: string[]; maxResults?: number; q?: string }) => {
        const { labelIds, maxResults, q } = params;
        const queryParams = new URLSearchParams();
        if (labelIds) queryParams.append('labelIds', labelIds.join(','));
        if (maxResults) queryParams.append('maxResults', maxResults.toString());
        if (q) queryParams.append('q', q);

        return apiRequest(`/api/gmail/messages?${queryParams}`);
      },

      get: async (params: { id: string; format?: string; metadataHeaders?: string[] }) => {
        const { id, format = 'full', metadataHeaders } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('format', format);
        if (metadataHeaders) {
          metadataHeaders.forEach(header => queryParams.append('metadataHeaders', header));
        }
        return apiRequest(`/api/gmail/messages/${id}?${queryParams}`);
      },

      modify: async (params: { id: string; addLabelIds?: string[]; removeLabelIds?: string[] }) => {
        const { id, addLabelIds, removeLabelIds } = params;
        return apiRequest(`/api/gmail/messages/${id}/modify`, {
          method: 'POST',
          body: JSON.stringify({ addLabelIds, removeLabelIds }),
        });
      },

      trash: async (params: { id: string }) => {
        const { id } = params;
        return apiRequest(`/api/gmail/messages/${id}/trash`, {
          method: 'POST',
        });
      },

      /**
       * Intelligent search using natural language
       * Converts natural language queries into Gmail API queries using AI
       * 
       * Example: "emails from niti about birthday in inbox"
       */
      intelligentSearch: async (params: { 
        query: string; 
        maxResults?: number; 
        useAgent?: boolean 
      }) => {
        const { query, maxResults = 30, useAgent = true } = params;
        return apiRequest<{
          query: string;
          labelIds: string[];
          explanation: string;
          detectedParams: {
            from?: string;
            to?: string;
            subject?: string;
            folder?: string;
            hasAttachment?: boolean;
            isUnread?: boolean;
            isStarred?: boolean;
            dateRange?: string;
            keywords?: string[];
          };
          messages: any[];
        }>('/api/gmail/intelligent-search', {
          method: 'POST',
          body: JSON.stringify({ query, maxResults, useAgent }),
        });
      },
    },
  },
};
