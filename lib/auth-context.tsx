'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getQueryClient } from '@/lib/react-query-provider';
import { setAccessToken } from '@/lib/services/gmail-client';

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in milliseconds
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  token: string | null;
  tokenData: TokenData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokenData: TokenData) => Promise<void>;
  logout: () => void;
  validateToken: (token: string) => Promise<boolean>;
  getValidAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = 'gmail_oauth_tokens';
const OAUTH_BRIDGE_URL = process.env.NEXT_PUBLIC_OAUTH_BRIDGE_URL || 'https://login.oath.email';

/**
 * Standalone token refresh function that can be called outside of React context
 * Used by gmail-client for 401 retry logic
 */
export async function refreshTokenStandalone(): Promise<string | null> {
  try {
    const storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedData) {
      console.log('[AUTH STANDALONE] No token data found');
      return null;
    }

    const tokenData: TokenData = JSON.parse(storedData);
    console.log('[AUTH STANDALONE] Attempting token refresh...');

    const response = await fetch(`${OAUTH_BRIDGE_URL}/api/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokenData.refresh_token }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Token refresh failed');
    }

    const refreshData = await response.json();
    const expiresAt = Date.now() + (refreshData.expires_in * 1000);

    const newTokenData: TokenData = {
      ...tokenData,
      access_token: refreshData.access_token,
      expires_at: expiresAt,
      ...(refreshData.refresh_token && { refresh_token: refreshData.refresh_token }),
    };

    // Store the new tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokenData));
    console.log('[AUTH STANDALONE] Token refreshed successfully');

    return newTokenData.access_token;
  } catch (error) {
    console.error('[AUTH STANDALONE] Failed to refresh token:', error);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage (persists across reloads)
  useEffect(() => {
    // Ensure we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      console.log('[AUTH] Initializing auth from localStorage...');
      const storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
      console.log('[AUTH] Stored token data exists:', !!storedData);
      if (storedData) {
        try {
          const parsed: TokenData = JSON.parse(storedData);
          console.log('[AUTH] Restoring token from localStorage');
          setTokenData(parsed);
          setToken(parsed.access_token);
          setIsAuthenticated(true);
          // Set token in Gmail client
          setAccessToken(parsed.access_token);
        } catch (error) {
          console.error('[AUTH] Failed to parse stored tokens:', error);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Check if token is expired
  const isTokenExpired = (data: TokenData): boolean => {
    // Add 5 minute buffer before expiry
    const now = Date.now();
    const expiresAt = data.expires_at - 5 * 60 * 1000;
    const isExpired = now >= expiresAt;

    if (isExpired) {
      const minutesUntilExpiry = Math.round((expiresAt - now) / (1000 * 60));
      console.log('[AUTH] Token expired or expiring soon. Minutes until expiry:', minutesUntilExpiry);
    }

    return isExpired;
  };

  // Refresh access token
  const refreshAccessToken = async (data: TokenData): Promise<TokenData> => {
    console.log('[AUTH] Refreshing access token...');
    const response = await fetch(`${OAUTH_BRIDGE_URL}/api/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: data.refresh_token }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Token refresh failed');
    }

    const refreshData = await response.json();

    // Calculate actual expiration timestamp
    // expires_in is in seconds, but expires_at should be a Unix timestamp in milliseconds
    const expiresAt = Date.now() + (refreshData.expires_in * 1000);

    const newTokenData: TokenData = {
      ...data,
      access_token: refreshData.access_token,
      expires_at: expiresAt,
      // Update refresh_token if Google returns a new one
      ...(refreshData.refresh_token && { refresh_token: refreshData.refresh_token }),
    };

    // Store the new tokens
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokenData));
    setTokenData(newTokenData);
    setToken(newTokenData.access_token);
    setAccessToken(newTokenData.access_token);

    console.log('[AUTH] Access token refreshed successfully. New expiry:', new Date(expiresAt).toISOString());
    return newTokenData;
  };

  // Get valid access token (auto-refresh if expired)
  const getValidAccessToken = async (): Promise<string | null> => {
    console.log('[AUTH] Getting valid access token...');
    let currentTokenData = tokenData;
    if (!currentTokenData) {
      const storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedData) {
        console.log('[AUTH] No token data found in storage');
        return null;
      }
      try {
        currentTokenData = JSON.parse(storedData);
      } catch {
        console.error('[AUTH] Failed to parse stored token data');
        return null;
      }
    }

    // Additional safety check
    if (!currentTokenData) {
      console.log('[AUTH] No token data available');
      return null;
    }

    // Refresh if expired
    if (isTokenExpired(currentTokenData)) {
      console.log('[AUTH] Token expired, attempting refresh...');
      try {
        const newTokenData = await refreshAccessToken(currentTokenData);
        console.log('[AUTH] Token refreshed successfully');
        return newTokenData.access_token;
      } catch (error) {
        console.error('[AUTH] Failed to refresh token:', error);
        // Clear invalid tokens and logout
        logout();
        return null;
      }
    }

    console.log('[AUTH] Token still valid, using existing token');
    return currentTokenData.access_token;
  };

  const validateToken = async (token: string): Promise<boolean> => {
    // For Gmail OAuth, we validate the token structure
    if (!token || token.trim().length < 10) {
      return false;
    }
    return true;
  };

  const login = async (newTokenData: TokenData) => {
    console.log('[AUTH] Saving tokens to localStorage');
    // Store tokens in localStorage (persists across reloads)
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokenData));
    console.log('[AUTH] Tokens saved, verifying:', !!localStorage.getItem(TOKEN_STORAGE_KEY));
    setTokenData(newTokenData);
    setToken(newTokenData.access_token);
    setIsAuthenticated(true);
    // Set token in Gmail client
    setAccessToken(newTokenData.access_token);
    console.log('[AUTH] Navigating to /mail');
    router.push('/mail');
  };

  const logout = () => {
    console.log('[AUTH] Logging out, clearing localStorage and cache');
    // Clear tokens from localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    // Clear UI state from localStorage (sidebar, panels, etc.)
    localStorage.removeItem('sidebar-collapsed');
    localStorage.removeItem('panel-sizes');
    // Clear all React Query cached data (mailboxes, folders, messages, etc.)
    const queryClient = getQueryClient();
    queryClient.clear();
    console.log('[AUTH] React Query cache cleared');
    setToken(null);
    setTokenData(null);
    setIsAuthenticated(false);
    // Gmail client will be reinitialized on next login
    router.push('/login');
  };

  const value: AuthContextType = {
    token,
    tokenData,
    isAuthenticated,
    isLoading,
    login,
    logout,
    validateToken,
    getValidAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
