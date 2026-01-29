/**
 * Spaces Service
 *
 * Handles all Yahoo Mail Autopilot Spaces API operations.
 * Spaces is an AI-powered feature that organizes and categorizes emails.
 */

import { apiClient } from './api-client';
import {
  Space,
  GetSpacesApiResponse,
  EditSpaceRequest,
  EditSpaceApiResponse,
  EditSpaceUpdateObj,
  CreateSpaceRequest,
  CreateSpaceApiResponse
} from '@/lib/types/api';

/**
 * Spaces Service Class
 *
 * Provides methods to interact with Yahoo Mail Autopilot Spaces API
 * Routes requests through Next.js API to avoid CORS issues
 */
class SpacesService {
  // Cache to prevent duplicate simultaneous requests
  private pendingRequests: Map<string, Promise<GetSpacesApiResponse>> = new Map();
  /**
   * Gets all spaces for a given account
   *
   * This function retrieves the list of AI-powered spaces configured for the user's account.
   * Spaces help organize emails into intelligent categories.
   *
   * Note: This calls the Next.js API route (/yai/autopilot/getSpaces) which then makes the server-side
   * request to Yahoo Mail Autopilot API to avoid CORS issues.
   *
   * Auto-Processing: If mailboxId and guid are provided, accepted spaces will be automatically
   * processed to generate allowlisted phrases and find semantically similar emails.
   *
   * @param acctId - The account identifier (mailbox ID or account ID)
   * @param retryCount - Number of retry attempts (default: 0)
   * @param genAI - Whether to use generative AI features (default: true)
   * @param mailboxId - Optional mailbox ID for auto-processing
   * @param guid - Optional user GUID for auto-processing
   * @returns Promise resolving to the spaces response
   *
   * @throws {Error} If the API request fails or returns non-2xx status
   *
   * @example
   * ```typescript
   * const spacesResponse = await spacesService.getSpaces('account-123');
   * console.log(`Found ${spacesResponse.spaces.length} spaces`);
   * ```
   *
   * @example
   * ```typescript
   * // With auto-processing
   * const spacesResponse = await spacesService.getSpaces(
   *   'account-123',
   *   0,
   *   true,
   *   'mailbox-456',
   *   'guid-789'
   * );
   * ```
   */
  async getSpaces(
    acctId: string,
    retryCount: number = 0,
    genAI: boolean = true,
    mailboxId?: string,
    guid?: string
  ): Promise<GetSpacesApiResponse> {
    // Create a cache key based on the request parameters
    const cacheKey = `${acctId}-${retryCount}-${genAI}-${mailboxId || ''}-${guid || ''}`;

    // If there's already a pending request for these params, return it
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log('[SpacesService] Reusing pending request for:', cacheKey);
      return pendingRequest;
    }

    // Create a new request
    const request = this.fetchSpaces(acctId, retryCount, genAI, mailboxId, guid);

    // Store it in the pending requests map
    this.pendingRequests.set(cacheKey, request);

    try {
      const result = await request;
      return result;
    } finally {
      // Clean up the pending request after it completes
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchSpaces(
    acctId: string,
    retryCount: number,
    genAI: boolean,
    mailboxId?: string,
    guid?: string
  ): Promise<GetSpacesApiResponse> {
    try {
      // Build query parameters for our Next.js API route
      const params = new URLSearchParams({
        acctId,
        retryCount: retryCount.toString(),
        genAI: genAI.toString()
      });

      // Add optional parameters if provided
      if (mailboxId) {
        params.append('mailboxId', mailboxId);
      }
      if (guid) {
        params.append('guid', guid);
      }

      // Call our Next.js API route (server-side) to avoid CORS issues
      const url = `/yai/autopilot/getSpaces?${params.toString()}`;

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
   * @param mailboxId - Optional mailbox ID for auto-processing
   * @param guid - Optional user GUID for auto-processing
   * @returns Promise resolving to the spaces response
   *
   * @example
   * ```typescript
   * const spaces = await spacesService.getSpacesDefault('account-123');
   * ```
   *
   * @example
   * ```typescript
   * // With auto-processing
   * const spaces = await spacesService.getSpacesDefault(
   *   'account-123',
   *   'mailbox-456',
   *   'guid-789'
   * );
   * ```
   */
  async getSpacesDefault(
    acctId: string,
    mailboxId?: string,
    guid?: string
  ): Promise<GetSpacesApiResponse> {
    return this.getSpaces(acctId, 0, true, mailboxId, guid);
  }

  /**
   * Edits an existing space
   *
   * This function updates a space's configuration (e.g., email senders, keywords, name).
   *
   * Note: This calls the Next.js API route (/yai/autopilot/editSpace) which then makes the
   * server-side request to Yahoo Mail Autopilot API to avoid CORS issues.
   *
   * @param accountId - The account identifier
   * @param spaceId - The space identifier to edit
   * @param updateObj - Object containing the fields to update
   * @param retryCount - Number of retry attempts (default: 0)
   * @param genAI - Whether to use generative AI features (default: true)
   * @returns Promise resolving to the edit space response
   *
   * @throws {Error} If the API request fails or returns non-2xx status
   *
   * @example
   * ```typescript
   * const response = await spacesService.editSpace(
   *   'account-123',
   *   'space-456',
   *   {
   *     emailSenders: [
   *       { email: 'user@example.com', name: 'User Name' }
   *     ]
   *   }
   * );
   * ```
   */
  async editSpace(
    accountId: string,
    spaceId: string,
    updateObj: EditSpaceUpdateObj,
    retryCount: number = 0,
    genAI: boolean = true
  ): Promise<EditSpaceApiResponse> {
    try {
      // Build query parameters for our Next.js API route
      const params = new URLSearchParams({
        retryCount: retryCount.toString(),
        genAI: genAI.toString()
      });

      // Call our Next.js API route (server-side) to avoid CORS issues
      const url = `/yai/autopilot/editSpace?${params.toString()}`;

      // Get the current token for authorization
      const token = (apiClient as any).token;
      if (!token) {
        throw new Error('No authorization token available');
      }

      // Prepare the request body
      const requestBody: EditSpaceRequest = {
        accountId,
        spaceId,
        updateObj
      };

      // Make the request with proper authorization headers
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to edit space (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to edit space:', error);
      throw error;
    }
  }

  /**
   * Edits a space with default parameters
   *
   * Convenience method that uses sensible defaults for most common use case.
   *
   * @param accountId - The account identifier
   * @param spaceId - The space identifier to edit
   * @param updateObj - Object containing the fields to update
   * @returns Promise resolving to the edit space response
   *
   * @example
   * ```typescript
   * const response = await spacesService.editSpaceDefault(
   *   'account-123',
   *   'space-456',
   *   { emailSenders: [{ email: 'user@example.com', name: 'User' }] }
   * );
   * ```
   */
  async editSpaceDefault(
    accountId: string,
    spaceId: string,
    updateObj: EditSpaceUpdateObj
  ): Promise<EditSpaceApiResponse> {
    return this.editSpace(accountId, spaceId, updateObj, 0, true);
  }

  /**
   * Creates a new space
   *
   * This function creates a new space based on user instruction.
   *
   * Note: This calls the Next.js API route (/yai/autopilot/createSpace) which then makes the
   * server-side request to Yahoo Mail Autopilot API to avoid CORS issues.
   *
   * @param accountId - The account identifier
   * @param userInstruction - User's instruction for creating the space
   * @param retryCount - Number of retry attempts (default: 0)
   * @param genAI - Whether to use generative AI features (default: true)
   * @returns Promise resolving to the create space response
   *
   * @throws {Error} If the API request fails or returns non-2xx status
   *
   * @example
   * ```typescript
   * const response = await spacesService.createSpace(
   *   'account-123',
   *   'Create a space for my traffic tickets'
   * );
   * ```
   */
  async createSpace(
    accountId: string,
    userInstruction: string,
    retryCount: number = 0,
    genAI: boolean = true
  ): Promise<CreateSpaceApiResponse> {
    try {
      // Build query parameters for our Next.js API route
      const params = new URLSearchParams({
        retryCount: retryCount.toString(),
        genAI: genAI.toString()
      });

      // Call our Next.js API route (server-side) to avoid CORS issues
      const url = `/yai/autopilot/createSpace?${params.toString()}`;

      // Get the current token for authorization
      const token = (apiClient as any).token;
      if (!token) {
        throw new Error('No authorization token available');
      }

      // Prepare the request body
      const requestBody: CreateSpaceRequest = {
        accountId,
        userInstruction
      };

      // Make the request with proper authorization headers
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create space (${response.status}): ${errorText || response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create space:', error);
      throw error;
    }
  }

  /**
   * Creates a space with default parameters
   *
   * Convenience method that uses sensible defaults for most common use case.
   *
   * @param accountId - The account identifier
   * @param userInstruction - User's instruction for creating the space
   * @returns Promise resolving to the create space response
   *
   * @example
   * ```typescript
   * const response = await spacesService.createSpaceDefault(
   *   'account-123',
   *   'Create a space for my traffic tickets'
   * );
   * ```
   */
  async createSpaceDefault(
    accountId: string,
    userInstruction: string
  ): Promise<CreateSpaceApiResponse> {
    return this.createSpace(accountId, userInstruction, 0, true);
  }
}

// Export singleton instance
export const spacesService = new SpacesService();
