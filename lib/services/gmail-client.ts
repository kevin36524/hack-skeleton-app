/**
 * Gmail API Client for Browser
 * Routes all calls through Next.js API proxy
 */

let accessToken: string | null = null;

/**
 * Set access token
 */
export function setAccessToken(token: string) {
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
 * Make authenticated request to our API proxy
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', response.status, errorData);

    const error: any = new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.body = errorData;

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

      /**
       * Intelligent search using natural language
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
