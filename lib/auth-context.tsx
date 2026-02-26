'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getQueryClient } from '@/lib/react-query-provider';
import { setAccessToken } from '@/lib/services/gmail-client';
import type { MailProvider } from '@/lib/imap/providers';

export type { MailProvider };

export interface AuthData {
  email: string;
  appPassword: string;
  provider: MailProvider;
}

interface AuthContextType {
  token: string | null;
  tokenData: AuthData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthData) => Promise<void>;
  logout: () => void;
  validateToken: (token: string) => Promise<boolean>;
  getValidAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'gmail_imap_credentials';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<AuthData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedData) {
        try {
          const parsed: AuthData = JSON.parse(storedData);
          if (!parsed.provider) parsed.provider = 'gmail'; // migrate old sessions
          const credential = btoa(`${parsed.email}:${parsed.appPassword}`);
          setTokenData(parsed);
          setToken(credential);
          setIsAuthenticated(true);
          setAccessToken(credential, parsed.provider);
        } catch {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    let data = tokenData;
    if (!data) {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) return null;
      try { data = JSON.parse(stored); } catch { return null; }
    }
    if (!data) return null;
    return btoa(`${data.email}:${data.appPassword}`);
  }, [tokenData]);

  const validateToken = async (token: string): Promise<boolean> => {
    return token.length > 0;
  };

  const login = async (authData: AuthData) => {
    const credential = btoa(`${authData.email}:${authData.appPassword}`);
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(authData));
    setTokenData(authData);
    setToken(credential);
    setIsAuthenticated(true);
    setAccessToken(credential, authData.provider);
    router.push('/mail');
  };

  const logout = () => {
    localStorage.clear();
    const queryClient = getQueryClient();
    queryClient.clear();
    setToken(null);
    setTokenData(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, tokenData, isAuthenticated, isLoading, login, logout, validateToken, getValidAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
