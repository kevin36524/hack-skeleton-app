'use client';

import { useEffect, useState } from 'react';
import { folderService } from '@/lib/services/folder-service';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronLeft, Inbox, Send, Trash2, Archive, Star, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { setAccessToken } from '@/lib/services/gmail-client';

interface FolderSidebarProps {
  mailboxId?: string;
  accountId?: string;
  selectedFolderId?: string;
  onFolderSelected?: (folderId: string) => void;
  className?: string;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface FolderGroup {
  name: string;
  folders: any[];
  icon: React.ElementType;
}

export function FolderSidebar({
  mailboxId,
  accountId,
  selectedFolderId,
  onFolderSelected,
  className,
  isCollapsed = false,
  onCollapsedChange
}: FolderSidebarProps) {
  const { getValidAccessToken } = useAuth();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log('FolderSidebar: Loading folders...');
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure we have a valid access token (auto-refreshes if expired)
      const token = await getValidAccessToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Update token in gmail client
      setAccessToken(token);

      console.log('FolderSidebar: Calling folderService.getFolders');
      const labels = await folderService.getFolders();
      console.log('FolderSidebar: Got labels:', labels.length);

      setFolders(labels);

      // Auto-select inbox if no folder is selected
      if (!selectedFolderId && labels.length > 0) {
        const inbox = labels.find(label => label.id === 'INBOX');
        if (inbox) {
          console.log('FolderSidebar: Auto-selecting inbox');
          onFolderSelected?.('INBOX');
        } else {
          // Fallback to first folder
          console.log('FolderSidebar: Auto-selecting first folder:', labels[0].id);
          onFolderSelected?.(labels[0].id!);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load folders';
      setError(errorMessage);
      console.error('Error loading folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFolderIcon = (folder: any) => {
    const type = folder.id?.toUpperCase();
    
    switch (type) {
      case 'INBOX':
        return Inbox;
      case 'SENT':
        return Send;
      case 'TRASH':
        return Trash2;
      case 'ARCHIVE':
        return Archive;
      case 'DRAFT':
        return FileText;
      case 'SPAM':
        return AlertCircle;
      case 'STARRED':
        return Star;
      default:
        return FileText;
    }
  };

  const groupFolders = (): FolderGroup[] => {
    const systemLabelIds = ['INBOX', 'SENT', 'DRAFT', 'TRASH', 'STARRED', 'SPAM', 'IMPORTANT'];

    const systemFolders = folders.filter(f =>
      f.type === 'system' && systemLabelIds.includes(f.id)
    );

    const customFolders = folders.filter(f =>
      f.type === 'user'
    );

    const groups: FolderGroup[] = [];

    // System folders
    if (systemFolders.length > 0) {
      groups.push({
        name: 'System Folders',
        folders: systemFolders.sort((a, b) => {
          const order = ['INBOX', 'STARRED', 'SENT', 'DRAFT', 'SPAM', 'TRASH'];
          const aIndex = order.indexOf(a.id);
          const bIndex = order.indexOf(b.id);
          return aIndex - bIndex;
        }),
        icon: Inbox
      });
    }

    // Custom folders
    if (customFolders.length > 0) {
      groups.push({
        name: 'Custom Folders',
        folders: customFolders.sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        icon: FileText
      });
    }

    return groups;
  };

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  if (loading) {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {[1, 2, 3].map((group) => (
          <div key={group} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-24" />
            <div className="space-y-1">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-2 p-2 rounded">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex-1" />
                  <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4', className)}>
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3 mx-auto" />
          <h3 className="text-sm font-semibold mb-2">Failed to load folders</h3>
          <p className="text-xs text-gray-600 mb-3">{error}</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadFolders}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const folderGroups = groupFolders();

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header with collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Folders</h2>
        )}
        {onCollapsedChange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange(!isCollapsed)}
            className="hidden md:flex ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
        {folderGroups.map((group) => (
          <div key={group.name}>
            <Collapsible
              open={!collapsedGroups.has(group.name)}
              onOpenChange={() => toggleGroup(group.name)}
            >
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
                isCollapsed && "hidden"
              )}>
                <span>{group.name}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    !collapsedGroups.has(group.name) && 'rotate-90'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <nav className="space-y-1 mt-2">
                  {group.folders.map((folder) => {
                    const Icon = getFolderIcon(folder);

                    if (isCollapsed) {
                      return (
                        <Button
                          key={folder.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => onFolderSelected?.(folder.id)}
                          className={cn(
                            'w-full justify-center px-2',
                            selectedFolderId === folder.id && 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          )}
                          title={folder.name}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      );
                    }

                    return (
                      <Button
                        key={folder.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFolderSelected?.(folder.id)}
                        className={cn(
                          'w-full justify-start text-left font-normal whitespace-normal h-auto py-2',
                          selectedFolderId === folder.id && 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                        )}
                      >
                        <div className="flex items-start justify-between w-full min-w-0 gap-2">
                          <div className="flex items-start space-x-2 min-w-0 flex-1">
                            <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="break-all">{folder.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs flex-shrink-0">
                            {folder.unread > 0 && (
                              <span className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                                {folder.unread}
                              </span>
                            )}
                            <span className="text-gray-500 dark:text-gray-400">
                              {folder.total}
                            </span>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </nav>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </ScrollArea>
    </div>
  );
}