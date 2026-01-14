'use client';

import { useEffect, useState } from 'react';
import { spacesService } from '@/lib/services/spaces-service';
import { Space } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpacesSectionProps {
  accountId: string;
  selectedSpaceId?: string;
  onSpaceSelected?: (spaceId: string) => void;
  className?: string;
}

export function SpacesSection({
  accountId,
  selectedSpaceId,
  onSpaceSelected,
  className
}: SpacesSectionProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

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
      console.log('SpacesSection: Got spaces:', spacesResponse.spaces?.length || 0);
      setSpaces(spacesResponse.spaces || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load spaces';
      setError(errorMessage);
      console.error('Error loading spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
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
  if (spaces.length === 0) {
    return null;
  }

  return (
    <div className={cn('px-4', className)}>
      <Collapsible
        open={!collapsed}
        onOpenChange={toggleCollapsed}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>AI Spaces</span>
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
              <Button
                key={space.id}
                variant="ghost"
                size="sm"
                onClick={() => onSpaceSelected?.(space.id)}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  selectedSpaceId === space.id && 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Sparkles className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm">{space.name}</span>
                      {space.description && (
                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {space.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {space.messageCount !== undefined && space.messageCount > 0 && (
                    <span className="flex-shrink-0 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 px-1.5 py-0.5 rounded-full text-xs ml-2">
                      {space.messageCount}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </nav>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
