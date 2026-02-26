'use client';

import { useState } from 'react';
import { Menu, Mail, LogOut, RefreshCw, X, ScrollText, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from './mailbox-selector';
import { AccountSwitcher } from './account-switcher';
import { ThemeToggle } from './theme-toggle';
import Image from 'next/image';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onMailboxSelected: (id: string) => void;
  onAccountSelected: (account: { id: string }) => void;
  mailboxId: string;
  onLogout: () => void;
  onRefresh: () => void;
  activeTab?: 'mail' | 'profile' | 'summary';
  onTabChange?: (tab: 'mail' | 'profile' | 'summary') => void;
  onViewModeToggle?: () => void;
}

export function MobileHeader({
  onToggleSidebar,
  sidebarOpen,
  onMailboxSelected,
  onAccountSelected,
  mailboxId,
  onLogout,
  onRefresh,
  activeTab = 'mail',
  onTabChange,
  onViewModeToggle,
}: MobileHeaderProps) {

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Test Mail Logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Test Mail
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewModeToggle}
              className="p-2"
              title="Switch to Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <MailboxSelector onMailboxSelected={onMailboxSelected} />
          {mailboxId && (
            <AccountSwitcher
              mailboxId={mailboxId}
              onAccountSelected={onAccountSelected}
            />
          )}
        </div>

        <div className="relative flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {/* Sliding pill indicator */}
          <div
            className="absolute top-1 bottom-1 w-1/2 bg-white dark:bg-gray-900 rounded-md shadow-sm transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(${['mail', 'summary'].indexOf(activeTab === 'profile' ? 'mail' : activeTab) * 100}%)` }}
          />
          <button
            onClick={() => onTabChange?.('mail')}
            className="relative z-10 flex-1 flex items-center justify-center py-1 h-8 text-xs font-medium text-gray-700 dark:text-gray-200"
          >
            <Mail className="h-3 w-3 mr-1" />
            Mail
          </button>
          <button
            onClick={() => onTabChange?.('summary')}
            className="relative z-10 flex-1 flex items-center justify-center py-1 h-8 text-xs font-medium text-gray-700 dark:text-gray-200"
          >
            <ScrollText className="h-3 w-3 mr-1" />
            Summary
          </button>
        </div>
      </div>
    </header>
  );
}