/**
 * Spaces Service
 *
 * Handles all Yahoo Mail Autopilot Spaces API operations.
 * Spaces is an AI-powered feature that organizes and categorizes emails.
 */

import { apiClient } from './api-client';
import { Space, GetSpacesApiResponse } from '@/lib/types/api';

/**
 * Spaces Service Class
 *
 * Provides methods to interact with Yahoo Mail Autopilot Spaces API
 * Routes requests through Next.js API to avoid CORS issues
 */
class SpacesService {
  /**
   * Gets all spaces for a given account
   *
   * This function retrieves the list of AI-powered spaces configured for the user's account.
   * Spaces help organize emails into intelligent categories.
   *
   * Note: This calls the Next.js API route (/api/spaces) which then makes the server-side
   * request to Yahoo Mail Autopilot API to avoid CORS issues.
   *
   * @param acctId - The account identifier (mailbox ID or account ID)
   * @param retryCount - Number of retry attempts (default: 0)
   * @param genAI - Whether to use generative AI features (default: true)
   * @returns Promise resolving to the spaces response
   *
   * @throws {Error} If the API request fails or returns non-2xx status
   *
   * @example
   * ```typescript
   * const spacesResponse = await spacesService.getSpaces('account-123');
   * console.log(`Found ${spacesResponse.spaces.length} spaces`);
   * ```
   */
  async getSpaces(
    acctId: string,
    retryCount: number = 0,
    genAI: boolean = true
  ): Promise<GetSpacesApiResponse> {
    try {
      // Build query parameters for our Next.js API route
      const params = new URLSearchParams({
        acctId,
        retryCount: retryCount.toString(),
        genAI: genAI.toString()
      });

      // Call our Next.js API route (server-side) to avoid CORS issues
      const url = `/api/spaces?${params.toString()}`;

      // Get the current token for authorization
      const token = (apiClient as any).token;
      if (!token) {
        throw new Error('No authorization token available');
      }

      // Make the request with proper authorization headers
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch spaces (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get spaces:', error);
      throw error;
    }
  }

  /**
   * Gets spaces with default parameters
   *
   * Convenience method that uses sensible defaults for most common use case.
   *
   * @param acctId - The account identifier
   * @returns Promise resolving to the spaces response
   *
   * @example
   * ```typescript
   * const spaces = await spacesService.getSpacesDefault('account-123');
   * ```
   */
  async getSpacesDefault(acctId: string): Promise<GetSpacesApiResponse> {
    return this.getSpaces(acctId, 0, true);
  }
}

// Export singleton instance
export const spacesService = new SpacesService();
