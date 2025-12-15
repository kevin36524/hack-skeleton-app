'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from '@/components/mailbox-selector';
import { AccountSwitcher } from '@/components/account-switcher';
import { FolderSidebar } from '@/components/folder-sidebar';
import { LogOut, Mail, RefreshCw, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSearchParams, useRouter } from 'next/navigation';
import { Message } from '@/lib/types/api';
import { useManyMessages, useFolderNavigation } from '@/lib/hooks/use-yahoo-mail';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface GroupedEmails {
  [senderEmail: string]: {
    senderName: string;
    senderEmail: string;
    count: number;
    messages: Message[];
  };
}

function GroupedEmailsPageContent() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mailboxId, setMailboxId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSenders, setExpandedSenders] = useState<Set<string>>(new Set());

  const { data: messagesData, isLoading: isLoadingMessages, error: messagesError } = useManyMessages(
    mailboxId,
    folderId,
    100
  );

  const { folders } = useFolderNavigation(mailboxId);

  // Initialize folderId from URL on mount
  useEffect(() => {
    const folderFromUrl = searchParams.get('folder');
    if (folderFromUrl && folderFromUrl !== folderId) {
      setFolderId(folderFromUrl);
    } else if (!folderFromUrl && folders.length > 0) {
      // Default to Inbox
      const inboxFolder = folders.find(f => f.types.includes('Inbox'));
      if (inboxFolder) {
        setFolderId(inboxFolder.id);
      }
    }
  }, [searchParams, folders]);

  const handleMailboxSelected = (id: string) => {
    setMailboxId(id);
  };

  const handleAccountSelected = (account: { id: string }) => {
    setAccountId(account.id);
  };

  const handleFolderSelected = (id: string) => {
    setFolderId(id);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('folder', id);
    router.replace(`/grouped-emails?${newSearchParams.toString()}`, { scroll: false });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const refreshData = () => {
    window.location.reload();
  };

  const toggleSender = (senderEmail: string) => {
    setExpandedSenders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(senderEmail)) {
        newSet.delete(senderEmail);
      } else {
        newSet.add(senderEmail);
      }
      return newSet;
    });
  };

  // Group emails by sender
  const groupedEmails: GroupedEmails = useMemo(() => {
    if (!messagesData?.messages) return {};

    const groups: GroupedEmails = {};

    messagesData.messages.forEach((message) => {
      const from = message.headers.from[0];
      const senderEmail = from?.email || 'unknown@example.com';
      const senderName = from?.name || senderEmail;

      if (!groups[senderEmail]) {
        groups[senderEmail] = {
          senderName,
          senderEmail,
          count: 0,
          messages: [],
        };
      }

      groups[senderEmail].count++;
      groups[senderEmail].messages.push(message);
    });

    return groups;
  }, [messagesData]);

  // Sort senders by message count (descending)
  const sortedSenders = useMemo(() => {
    return Object.values(groupedEmails).sort((a, b) => b.count - a.count);
  }, [groupedEmails]);

  const isReady = mailboxId;
  const selectedFolder = folders.find(f => f.id === folderId);

  const formatDate = (internalDate: string): string => {
    const date = new Date(parseInt(internalDate) * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

        {/* Mobile Header */}
        <MobileHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onMailboxSelected={handleMailboxSelected}
          onAccountSelected={handleAccountSelected}
          mailboxId={mailboxId}
          onLogout={handleLogout}
          onRefresh={refreshData}
        />

        {/* Desktop Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b hidden md:block">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Mail className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Grouped Emails
                </h1>
                <MailboxSelector onMailboxSelected={handleMailboxSelected} />
              </div>

              <div className="flex items-center space-x-4">
                <Link href="/mail">
                  <Button variant="outline" size="sm">
                    Back to Mail
                  </Button>
                </Link>
                <AccountSwitcher
                  mailboxId={mailboxId}
                  onAccountSelected={handleAccountSelected}
                />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                onClick={toggleSidebar}
              />
            )}

            {/* Sidebar */}
            <aside className={`
              fixed md:relative inset-y-0 left-0 z-50
              w-64 bg-white dark:bg-gray-800 border-r flex flex-col
              transform transition-transform duration-200 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0
            `}>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Folders</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                {isReady ? (
                  <FolderSidebar
                    mailboxId={mailboxId}
                    accountId={accountId}
                    selectedFolderId={folderId}
                    onFolderSelected={(id) => {
                      handleFolderSelected(id);
                      setSidebarOpen(false);
                    }}
                  />
                ) : (
                  <div className="p-4 text-sm text-gray-500">Loading folders...</div>
                )}
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Emails Grouped by Sender
                  </h2>
                  {selectedFolder && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing up to 100 emails from <span className="font-semibold">{selectedFolder.name}</span>
                    </p>
                  )}
                  {messagesData && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total: {messagesData.messages.length} emails from {sortedSenders.length} senders
                    </p>
                  )}
                </div>

                <ScrollArea className="h-[calc(100vh-240px)]">
                  {isLoadingMessages && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
                      </div>
                    </div>
                  )}

                  {messagesError && (
                    <div className="text-center py-12">
                      <p className="text-red-600 dark:text-red-400">
                        Error loading emails. Please try again.
                      </p>
                    </div>
                  )}

                  {!isLoadingMessages && !messagesError && sortedSenders.length === 0 && (
                    <div className="text-center py-12">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No emails found in this folder.
                      </p>
                    </div>
                  )}

                  {!isLoadingMessages && !messagesError && sortedSenders.length > 0 && (
                    <div className="space-y-3">
                      {sortedSenders.map((sender) => (
                        <Card key={sender.senderEmail} className="overflow-hidden">
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => toggleSender(sender.senderEmail)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {expandedSenders.has(sender.senderEmail) ? (
                                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {sender.senderName}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {sender.senderEmail}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-3">
                                {sender.count} {sender.count === 1 ? 'email' : 'emails'}
                              </Badge>
                            </div>
                          </div>

                          {expandedSenders.has(sender.senderEmail) && (
                            <div className="border-t dark:border-gray-700">
                              {sender.messages.map((message, index) => (
                                <div
                                  key={message.id}
                                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                    index !== sender.messages.length - 1 ? 'border-b dark:border-gray-700' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white flex-1 mr-4">
                                      {message.headers.subject || '(No subject)'}
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                      {formatDate(message.headers.internalDate)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {message.snippet}
                                  </p>
                                  {message.flags.read === false && (
                                    <Badge variant="default" className="mt-2">
                                      Unread
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function GroupedEmailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <GroupedEmailsPageContent />
    </Suspense>
  );
}
