'use client';

import { useEffect, useState } from 'react';
import { folderService } from '@/lib/services/folder-service';
import { Folder, Account } from '@/lib/types/api';
import { Box, VStack, HStack, Text, Icon, Badge, IconButton, Button, Divider } from '@yahoo/uds';
import { Add } from '@yahoo/uds-icons';
import { UDSIcons } from '@/lib/uds-icons-map';
import { HoverableListItem } from '@/components/uds-utils';
import { cn, getFolderDisplayName } from '@/lib/utils';

interface FolderSidebarProps {
  mailboxId: string;
  account?: Account | null;
  selectedFolderId?: string;
  onFolderSelected?: (folderId: string) => void;
  className?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function FolderSidebar({
  mailboxId,
  account,
  selectedFolderId,
  onFolderSelected,
  className,
  isCollapsed = false,
  onCollapsedChange
}: FolderSidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('FolderSidebar: mailboxId:', mailboxId, 'account:', account?.id);
    if (mailboxId) {
      console.log('FolderSidebar: Loading folders...');
      loadFolders();
    }
  }, [mailboxId, account]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      console.log('FolderSidebar: Calling folderService.getFolders for mailboxId:', mailboxId);
      const foldersData = await folderService.getFolders(mailboxId);
      console.log('FolderSidebar: Got folders:', foldersData.folders.length);

      // Filter folders by accountId if provided
      const filteredFolders = account
        ? foldersData.folders.filter(folder => folder.acctId === account.id)
        : foldersData.folders;

      console.log('FolderSidebar: Filtered folders for account:', account?.id, 'count:', filteredFolders.length);
      setFolders(filteredFolders);

      // Auto-select inbox if no folder is selected
      if (!selectedFolderId && filteredFolders.length > 0) {
        const inbox = filteredFolders.find(folder =>
          folder.types.includes('INBOX')
        );
        if (inbox) {
          console.log('FolderSidebar: Auto-selecting inbox:', inbox.id);
          onFolderSelected?.(inbox.id);
        } else {
          // Fallback to first folder
          console.log('FolderSidebar: Auto-selecting first folder:', filteredFolders[0].id);
          onFolderSelected?.(filteredFolders[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load folders');
      console.error('Error loading folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFolderIcon = (folder: Folder) => {
    const type = folder.types[0]?.toUpperCase();

    switch (type) {
      case 'INBOX':
        return UDSIcons.Inbox;
      case 'SENT':
        return UDSIcons.Sent;
      case 'TRASH':
        return UDSIcons.Trash;
      case 'ARCHIVE':
        return UDSIcons.Archive;
      case 'DRAFT':
        return UDSIcons.Drafts;
      case 'STARRED':
        return UDSIcons.Star;
      default:
        return UDSIcons.Folder;
    }
  };

  if (loading) {
    return (
      <Box className={cn('space-y-4 p-4', className)}>
        {[1, 2, 3].map((group) => (
          <VStack key={group} gap="2">
            <Box className="h-4 bg-[var(--color-bg-secondary)] animate-pulse rounded w-24" />
            <VStack gap="1">
              {[1, 2, 3, 4].map((item) => (
                <HStack key={item} gap="2" alignItems="center" spacing="2" className="rounded">
                  <Box className="h-4 w-4 bg-[var(--color-bg-secondary)] animate-pulse rounded" />
                  <Box className="h-4 bg-[var(--color-bg-secondary)] animate-pulse rounded flex-1" />
                  <Box className="h-4 w-8 bg-[var(--color-bg-secondary)] animate-pulse rounded" />
                </HStack>
              ))}
            </VStack>
          </VStack>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" spacing="4" className={className}>
        <VStack gap="3" alignItems="center" className="text-center max-w-sm">
          <Icon name={UDSIcons.Close} size="lg" color="alert" />
          <Text variant="label1" color="primary">Failed to load folders</Text>
          <Text variant="caption1" color="secondary">{error}</Text>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadFolders}
            startIcon={UDSIcons.Refresh}
          >
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  const systemFolders = folders.filter(f =>
    f.types.some(t => ['INBOX', 'SENT', 'DRAFT', 'TRASH', 'ARCHIVE', 'SPAM', 'STARRED'].includes(t.toUpperCase()))
  ).sort((a, b) => {
    const order = ['INBOX', 'STARRED', 'SENT', 'DRAFT', 'ARCHIVE', 'SPAM', 'TRASH'];
    const aIndex = order.indexOf(a.types[0]?.toUpperCase() || '');
    const bIndex = order.indexOf(b.types[0]?.toUpperCase() || '');
    return aIndex - bIndex;
  });

  const customFolders = folders.filter(f =>
    !f.types.some(t => ['INBOX', 'SENT', 'DRAFT', 'TRASH', 'ARCHIVE', 'SPAM', 'STARRED'].includes(t.toUpperCase()))
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box
      display="flex"
      flexDirection="column"
      rowGap="1"
      spacing="3"
      className={cn('overflow-auto', className)}
    >
      <Button variant="brand" size="lg" startIcon={Add} className="mb-2 w-full">
        Compose
      </Button>

      <VStack gap="1" alignItems="stretch" justifyContent="flex-start">
        {systemFolders.map((folder) => {
          const icon = getFolderIcon(folder);
          const isActive = selectedFolderId === folder.id;
          const displayName = getFolderDisplayName(folder, account || undefined);

          return (
            <HStack
              key={folder.id}
              gap="3"
              alignItems="center"
              justifyContent="space-between"
              spacing="2"
              spacingHorizontal="3"
              borderRadius="md"
              backgroundColor={isActive ? "brand-secondary" : undefined}
              className="cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
              onClick={() => onFolderSelected?.(folder.id)}
            >
              <HStack gap="3" alignItems="center" justifyContent="flex-start">
                <Icon
                  name={icon}
                  size="sm"
                  variant="outline"
                  color={isActive ? "brand" : "secondary"}
                />
                <Text
                  variant="label2"
                  color={isActive ? "brand" : "primary"}
                >
                  {displayName}
                </Text>
              </HStack>
              {folder.unread > 0 && (
                <Badge variant={isActive ? "brand" : "secondary"} size="sm">
                  {folder.unread > 99 ? '99+' : folder.unread}
                </Badge>
              )}
            </HStack>
          );
        })}
      </VStack>

      {customFolders.length > 0 && (
        <>
          <Divider variant="muted" />

          <Text variant="caption1" color="secondary" className="px-2">
            Folders
          </Text>
          <VStack gap="1" alignItems="stretch" justifyContent="flex-start">
            {customFolders.map((folder) => {
              const icon = getFolderIcon(folder);
              const isActive = selectedFolderId === folder.id;
              const displayName = getFolderDisplayName(folder, account || undefined);

              return (
                <HStack
                  key={folder.id}
                  gap="3"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing="2"
                  spacingHorizontal="3"
                  borderRadius="md"
                  backgroundColor={isActive ? "brand-secondary" : undefined}
                  className="cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
                  onClick={() => onFolderSelected?.(folder.id)}
                >
                  <HStack gap="3" alignItems="center" justifyContent="flex-start">
                    <Icon
                      name={icon}
                      size="sm"
                      variant="outline"
                      color={isActive ? "brand" : "secondary"}
                    />
                    <Text
                      variant="label2"
                      color={isActive ? "brand" : "primary"}
                    >
                      {displayName}
                    </Text>
                  </HStack>
                  {folder.unread > 0 && (
                    <Badge variant={isActive ? "brand" : "secondary"} size="sm">
                      {folder.unread > 99 ? '99+' : folder.unread}
                    </Badge>
                  )}
                </HStack>
              );
            })}
          </VStack>
        </>
      )}
    </Box>
  );
}