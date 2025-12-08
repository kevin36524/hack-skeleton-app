import { ApiError } from '@/lib/types/api';

// Determine if we're running on the server or client
const isServer = typeof window === 'undefined';

const BASE_URL = (() => {
  // Always use proxy for client-side requests to avoid CORS issues
  // Server-side requests can go directly to Yahoo API for better performance
  return isServer ? 'https://apis.mail.yahoo.com/ws/v3' : '/api/proxy';
})();
const APP_ID = 'YahooMailIosMobile';

class ApiClient {
  private token: string | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Create a unique key for deduplication based on URL and method
  private getRequestKey(url: string, method: string, body?: string): string {
    return `${method}:${url}${body ? `:${body}` : ''}`;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      throw new Error('No authorization token provided');
    }

    let url: string;
    if (BASE_URL === '/api/proxy') {
      // Use proxy endpoint - strip leading slash from endpoint if present
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      url = `${BASE_URL}/${cleanEndpoint}${cleanEndpoint.includes('?') ? '&' : '?'}appid=${APP_ID}`;
    } else {
      // Server-side: Direct Yahoo API call - no encoding needed
      // Fix the @.id== format which might not work in direct calls
      let fixedEndpoint = endpoint.replace('/@.id==', '/');
      url = `${BASE_URL}${fixedEndpoint}${fixedEndpoint.includes('?') ? '&' : '?'}appid=${APP_ID}`;
      console.log('[API CLIENT] Direct mode - Original endpoint:', endpoint);
      console.log('[API CLIENT] Direct mode - Fixed endpoint:', fixedEndpoint);
      console.log('[API CLIENT] Direct mode - Constructed URL:', url);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Create request key for deduplication
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body as string | undefined;
    const requestKey = this.getRequestKey(url, method, body);

    // Check if there's already a pending request for this endpoint
    if (this.pendingRequests.has(requestKey)) {
      console.log('[API CLIENT] Deduplicating request to:', url);
      return this.pendingRequests.get(requestKey)!;
    }

    console.log('[API CLIENT] Token length:', this.token?.length || 0);
    console.log('[API CLIENT] Authorization header:', `Bearer ${this.token?.substring(0, 20)}...`);

    // Create the request promise
    const requestPromise = (async () => {
      try {
        console.log('[API CLIENT] Making fetch request to:', url);

      // Validate the URL before making the request
      try {
        // For relative URLs (like /api/proxy/...), we need to provide a base URL
        if (url.startsWith('/')) {
          // Use a dummy base for validation - fetch() will handle the relative URL correctly
          new URL(url, 'http://localhost');
        } else {
          new URL(url);
        }
      } catch (urlError) {
        console.error('[API CLIENT] Invalid URL construction:', urlError);
        throw new Error(`Failed to parse URL from ${url}`);
      }

      const response = await fetch(url, config);
      console.log('[API CLIENT] Fetch response status:', response.status);

      if (!response.ok) {
        const error: ApiError = {
          status: response.status,
          message: response.statusText,
        };

        try {
          const errorData = await response.json() as Record<string, unknown>;
          error.details = errorData;
          console.log('[API CLIENT] Full error response:', JSON.stringify(errorData, null, 2));
        } catch {
          // Ignore JSON parsing errors
        }

        console.log('[API CLIENT] HTTP error:', error);
        throw error;
      }

      // Handle 204 No Content responses (like updateMessage)
      if (response.status === 204) {
        console.log('[API CLIENT] Success response received (204 No Content)');
        return { status: 204 } as T;
      }

        const responseData = await response.json();
        console.log('[API CLIENT] Success response received');
        return responseData;
      } catch (error) {
        console.log('[API CLIENT] Catch block error:', error);

        if (error instanceof Error && 'status' in error) {
          throw error;
        }

        // Network or other errors
        const apiError: ApiError = {
          status: 0,
          message: error instanceof Error ? error.message : 'Network error occurred',
        };

        console.log('[API CLIENT] Network error:', apiError);
        throw apiError;
      } finally {
        // Clean up the pending request after it completes (success or failure)
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Store the pending request
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
