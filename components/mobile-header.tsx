'use client';

import { useState } from 'react';
import { Menu, Mail, LogOut, RefreshCw, X, BarChart3, Bot, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from './mailbox-selector';
import { AccountSwitcher } from './account-switcher';
import { ThemeToggle } from './theme-toggle';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onMailboxSelected: (id: string) => void;
  onAccountSelected: (account: { id: string }) => void;
  mailboxId: string;
  onLogout: () => void;
  onRefresh: () => void;
  onGroupBySender?: () => void;
  groupBySenderIcon?: 'users' | 'back';
  activeTab?: 'mail' | 'digest' | 'autopilot';
  onTabChange?: (tab: 'mail' | 'digest' | 'autopilot') => void;
}

export function MobileHeader({
  onToggleSidebar,
  sidebarOpen,
  onMailboxSelected,
  onAccountSelected,
  mailboxId,
  onLogout,
  onRefresh,
  onGroupBySender,
  groupBySenderIcon = 'users',
  activeTab = 'mail',
  onTabChange,
}: MobileHeaderProps) {

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b md:hidden">
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
              <Mail className="h-6 w-6 text-purple-600" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Yahoo Mail
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle size="sm" />
            {onGroupBySender && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onGroupBySender}
                className="p-2"
                title={groupBySenderIcon === 'back' ? 'Back to Mail' : 'Group by Sender'}
              >
                {groupBySenderIcon === 'back' ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </Button>
            )}
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

        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-3">
          <Button
            variant={activeTab === 'mail' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange?.('mail')}
            className="flex-1 py-1 h-8 text-xs"
          >
            <Mail className="h-3 w-3 mr-1" />
            Mail
          </Button>
          <Button
            variant={activeTab === 'digest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange?.('digest')}
            className="flex-1 py-1 h-8 text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Digest
          </Button>
          <Button
            variant={activeTab === 'autopilot' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange?.('autopilot')}
            className="flex-1 py-1 h-8 text-xs"
          >
            <Bot className="h-3 w-3 mr-1" />
            Autopilot
          </Button>
        </div>

        <div className="space-y-2">
          <MailboxSelector onMailboxSelected={onMailboxSelected} />
          {mailboxId && (
            <AccountSwitcher 
              mailboxId={mailboxId} 
              onAccountSelected={onAccountSelected}
            />
          )}
        </div>
      </div>
    </header>
  );
}