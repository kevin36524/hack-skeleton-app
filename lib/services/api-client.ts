import { ApiError } from '@/lib/types/api';

// Gmail API base URL
const BASE_URL = process.env.NEXT_PUBLIC_GMAIL_API_URL || 'https://gmail.googleapis.com/gmail/v1';

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

    // Construct URL - Gmail API expects clean paths
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

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
    console.log('[API CLIENT] Making request to:', url);

    // Create the request promise
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, config);
        console.log('[API CLIENT] Fetch response status:', response.status);

        // Handle 401 errors by attempting token refresh
        if (response.status === 401) {
          console.log('[API CLIENT] Token expired, needs refresh');
          const error: ApiError = {
            status: 401,
            message: 'Token expired',
          };
          throw error;
        }

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

        // Handle 204 No Content responses
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
