'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Create a singleton query client that can be accessed globally
let globalQueryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
          refetchOnWindowFocus: false,
          refetchOnMount: false, // Don't refetch on component mount if data exists
          refetchOnReconnect: false, // Don't refetch on network reconnect
        },
      },
    });
  }
  return globalQueryClient;
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
