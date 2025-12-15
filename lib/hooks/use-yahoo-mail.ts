import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/api-client';
import { mailboxService } from '@/lib/services/mailbox-service';
import { accountService } from '@/lib/services/account-service';
import { folderService } from '@/lib/services/folder-service';
import { messageService } from '@/lib/services/message-service';

// Query keys
export const QUERY_KEYS = {
  MAILBOX: ['mailbox'] as const,
  ACCOUNTS: ['accounts'] as const,
  FOLDERS: ['folders'] as const,
  CONVERSATIONS: (folderId: string) => ['conversations', folderId] as const,
  CONVERSATION_MESSAGES: (conversationId: string) => ['conversation-messages', conversationId] as const,
};

// Hook to set authentication token
export function useAuthToken() {
  return {
    setToken: (token: string) => {
      apiClient.setToken(token);
    },
    clearToken: () => {
      apiClient.clearToken();
    },
  };
}

// Mailbox hooks
export function useMailbox() {
  return useQuery({
    queryKey: QUERY_KEYS.MAILBOX,
    queryFn: () => mailboxService.getMailbox(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Accounts hooks
export function useAccounts(mailboxId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS, mailboxId],
    queryFn: () => accountService.getAccounts(mailboxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!mailboxId,
    select: (data) => ({
      ...data,
      accounts: data.accounts.filter(account => account.status === 'ENABLED'),
    }),
  });
}

// Folders hooks
export function useFolders(mailboxId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.FOLDERS, mailboxId],
    queryFn: () => folderService.getFolders(mailboxId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!mailboxId,
  });
}

// Conversations hooks
export function useConversations(mailboxId: string, folderId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONVERSATIONS, mailboxId, folderId],
    queryFn: () => messageService.getConversations(mailboxId, folderId),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    enabled: !!mailboxId && !!folderId,
  });
}

// Conversation messages hook
export function useConversationMessages(mailboxId: string, folderId: string, conversationId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONVERSATION_MESSAGES, mailboxId, folderId, conversationId],
    queryFn: () => messageService.getMessagesByConversation(mailboxId, folderId, conversationId),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    enabled: !!mailboxId && !!folderId && !!conversationId,
  });
}

// Message triage mutations
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mailboxId, messageIds }: { mailboxId: string; messageIds: string[] }) =>
      messageService.markAsRead(mailboxId, messageIds),
    onSuccess: () => {
      // Invalidate all conversation queries to refresh read status
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
}

export function useMarkAsUnread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mailboxId, messageIds }: { mailboxId: string; messageIds: string[] }) =>
      messageService.markAsRead(mailboxId, messageIds, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
}

export function useStarMessages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mailboxId, messageIds }: { mailboxId: string; messageIds: string[] }) =>
      messageService.toggleStar(mailboxId, messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
}

export function useUnstarMessages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mailboxId, messageIds }: { mailboxId: string; messageIds: string[] }) =>
      messageService.toggleStar(mailboxId, messageIds, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation-messages'] });
    },
  });
}

export function useMoveMessages() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mailboxId, messageIds, targetFolderId }: { mailboxId: string; messageIds: string[]; targetFolderId: string }) =>
      messageService.moveMessages(mailboxId, messageIds, targetFolderId),
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

// Combined hook for mailbox data
export function useMailboxData() {
  const mailboxQuery = useMailbox();
  const mailboxId = mailboxQuery.data?.mailboxes?.[0]?.id;
  
  const accountsQuery = useAccounts(mailboxId || '');
  const foldersQuery = useFolders(mailboxId || '');

  return {
    mailbox: mailboxQuery.data,
    mailboxId,
    accounts: accountsQuery.data?.accounts || [],
    folders: foldersQuery.data?.folders || [],
    isLoading: mailboxQuery.isLoading || accountsQuery.isLoading || foldersQuery.isLoading,
    error: mailboxQuery.error || accountsQuery.error || foldersQuery.error,
    refetch: () => {
      mailboxQuery.refetch();
      if (mailboxId) {
        accountsQuery.refetch();
        foldersQuery.refetch();
      }
    },
  };
}

// Hook for selected account management
export function useSelectedAccount(mailboxId: string) {
  const { data } = useAccounts(mailboxId);
  const accounts = data?.accounts || [];
  
  const selectedAccount = accounts.find(account => account.isSelected) || 
                         accounts.find(account => account.isPrimary) || 
                         accounts[0];

  return {
    selectedAccount,
    primaryAccount: accounts.find(account => account.isPrimary),
    enabledAccounts: accounts,
  };
}

// Hook for folder navigation
export function useFolderNavigation(mailboxId: string) {
  const { data } = useFolders(mailboxId);
  const folders = data?.folders || [];
  const queryClient = useQueryClient();

  const getFolderByType = (type: string) => {
    return folders.find(folder =>
      folder.types.includes(type)
    );
  };

  const getFolderById = (id: string) => {
    return folders.find(folder => folder.id === id);
  };

  const refreshFolderData = () => {
    if (mailboxId) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS, mailboxId] });
    }
  };

  return {
    folders,
    getFolderByType,
    getFolderById,
    refreshFolderData,
    isLoading: !mailboxId,
    error: null,
  };
}

// Hook to fetch many messages (100 by default)
export function useManyMessages(mailboxId: string, folderId: string, count: number = 100) {
  return useQuery({
    queryKey: ['many-messages', mailboxId, folderId, count],
    queryFn: () => messageService.getMany(mailboxId, folderId, count),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    enabled: !!mailboxId && !!folderId,
  });
}