'use client';

import { useEffect, useState } from 'react';
import { spacesService } from '@/lib/services/spaces-service';
import { Space } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Sparkles, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpaceDataDialog } from '@/components/space-data-dialog';

interface SpacesSectionProps {
  accountId: string;
  selectedSpaceId?: string;
  onSpaceSelected?: (spaceId: string) => void;
  onSpaceDataUpdated?: (spaceId: string, updatedSpace: Space) => void;
  className?: string;
}

export function SpacesSection({
  accountId,
  selectedSpaceId,
  onSpaceSelected,
  onSpaceDataUpdated,
  className
}: SpacesSectionProps) {
  const [suggestedSpaces, setSuggestedSpaces] = useState<Space[]>([]);
  const [acceptedSpaces, setAcceptedSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestedCollapsed, setSuggestedCollapsed] = useState(false);
  const [acceptedCollapsed, setAcceptedCollapsed] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    console.log('SpacesSection: accountId:', accountId);
    if (accountId) {
      console.log('SpacesSection: Loading spaces...');
      loadSpaces();
    }
  }, [accountId]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('SpacesSection: Calling spacesService.getSpaces for accountId:', accountId);
      const spacesResponse = await spacesService.getSpaces(accountId);
      console.log('SpacesSection: Got suggested spaces:', spacesResponse.suggestedSpaces?.length || 0);
      console.log('SpacesSection: Got accepted spaces:', spacesResponse.acceptedSpaces?.length || 0);
      setSuggestedSpaces(spacesResponse.suggestedSpaces || []);
      setAcceptedSpaces(spacesResponse.acceptedSpaces || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load spaces';
      setError(errorMessage);
      console.error('Error loading spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestedCollapsed = () => {
    setSuggestedCollapsed(!suggestedCollapsed);
  };

  const toggleAcceptedCollapsed = () => {
    setAcceptedCollapsed(!acceptedCollapsed);
  };

  const handleEditSpace = (space: Space, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSpace(space);
    setDialogOpen(true);
  };

  const handleSaveSpace = (updatedSpace: Space) => {
    // Update the space in the appropriate list
    if (updatedSpace.status === 'suggested') {
      setSuggestedSpaces(prev =>
        prev.map(s => s.id === updatedSpace.id ? updatedSpace : s)
      );
    } else {
      setAcceptedSpaces(prev =>
        prev.map(s => s.id === updatedSpace.id ? updatedSpace : s)
      );
    }

    // Notify parent component
    onSpaceDataUpdated?.(updatedSpace.id, updatedSpace);

    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className={cn('space-y-2 px-4', className)}>
        <div className="flex items-center space-x-2 px-2 py-1">
          <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-20" />
        </div>
        <div className="space-y-1 pl-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-2 p-2 rounded">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('px-4 py-2', className)}>
        <div className="flex items-center justify-between px-2 py-1 text-sm">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Spaces unavailable</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSpaces}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Don't render if no spaces
  if (suggestedSpaces.length === 0 && acceptedSpaces.length === 0) {
    return null;
  }

  const renderSpacesList = (spaces: Space[], title: string, collapsed: boolean, toggleCollapsed: () => void) => {
    if (spaces.length === 0) return null;

    return (
      <Collapsible
        open={!collapsed}
        onOpenChange={toggleCollapsed}
        className="mb-4"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>{title}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({spaces.length})</span>
          </div>
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              !collapsed && 'rotate-90'
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav className="space-y-1 mt-2">
            {spaces.map((space) => (
              <div key={space.id} className="space-y-1 w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSpaceSelected?.(space.id)}
                  className={cn(
                    'w-full justify-start text-left font-normal h-auto py-2',
                    selectedSpaceId === space.id && 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  )}
                >
                  <div className="flex flex-col w-full space-y-1 min-w-0">
                    <div className="flex items-center justify-between w-full gap-2 min-w-0">
                      <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
                        <Sparkles className="h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                          <span className="truncate text-sm font-medium">{space.name}</span>
                          <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {space.shortName}
                          </span>
                        </div>
                      </div>
                      <span className="flex-shrink-0 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                        {Math.round(space.relevanceScore * 100)}%
                      </span>
                    </div>
                    {space.justification && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 pl-6 break-words">
                        {space.justification}
                      </p>
                    )}
                    {space.extraData?.attachments && space.extraData.attachments.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-6 truncate">
                        {space.extraData.attachments.length} attachment(s)
                      </div>
                    )}
                    {space.extraData?.pinnedMessages && space.extraData.pinnedMessages.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-6 truncate">
                        {space.extraData.pinnedMessages.length} pinned message(s)
                      </div>
                    )}
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleEditSpace(space, e)}
                  className="w-full text-xs py-1 h-7 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center justify-center gap-1"
                >
                  <Settings className="h-3 w-3 flex-shrink-0" />
                  <span>Debug</span>
                </Button>
              </div>
            ))}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>
      <div className={cn('px-4 space-y-2', className)}>
        {renderSpacesList(acceptedSpaces, 'My Spaces', acceptedCollapsed, toggleAcceptedCollapsed)}
        {renderSpacesList(suggestedSpaces, 'Suggested Spaces', suggestedCollapsed, toggleSuggestedCollapsed)}
      </div>

      <SpaceDataDialog
        space={editingSpace}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveSpace}
      />
    </>
  );
}
