'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/services/api-client';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  validateToken: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const TOKEN_STORAGE_KEY = 'yahoo_mail_token';

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage (persists across reloads)
  useEffect(() => {
    // Ensure we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      console.log('[AUTH] Initializing auth from localStorage...');
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      console.log('[AUTH] Stored token exists:', !!storedToken);
      if (storedToken) {
        console.log('[AUTH] Restoring token from localStorage');
        setToken(storedToken);
        setIsAuthenticated(true);
        // Set token in API client
        apiClient.setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    // Basic validation - Yahoo OAuth tokens are typically long strings
    if (!token || token.trim().length < 10) {
      return false;
    }

    // Additional validation could include API call to verify token
    // For now, we'll use basic format validation
    const tokenPattern = /^[A-Za-z.0-9\-_]+$/;
    return tokenPattern.test(token.trim());
  };

  const login = async (newToken: string) => {
    const isValid = await validateToken(newToken);
    if (isValid) {
      console.log('[AUTH] Saving token to localStorage');
      // Store token in localStorage (persists across reloads)
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      console.log('[AUTH] Token saved, verifying:', !!localStorage.getItem(TOKEN_STORAGE_KEY));
      setToken(newToken);
      setIsAuthenticated(true);
      // Set token in API client
      apiClient.setToken(newToken);
      console.log('[AUTH] Navigating to /mail');
      router.push('/mail');
    } else {
      throw new Error('Invalid token format');
    }
  };

  const logout = () => {
    console.log('[AUTH] Logging out, clearing localStorage');
    // Clear token from localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setIsAuthenticated(false);
    // Clear token from API client
    apiClient.clearToken();
    router.push('/login');
  };

  const value: AuthContextType = {
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    validateToken,
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
