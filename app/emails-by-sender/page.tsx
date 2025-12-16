'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from '@/components/mailbox-selector';
import { AccountSwitcher } from '@/components/account-switcher';
import { FolderSidebar } from '@/components/folder-sidebar';
import { messageService } from '@/lib/services/message-service';
import { Message } from '@/lib/types/api';
import { LogOut, Mail, RefreshCw, Menu, X, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSearchParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface GroupedEmails {
  senderEmail: string;
  senderName: string;
  messages: Message[];
  totalCount: number;
}

function EmailsBySenderContent() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mailboxId, setMailboxId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSenders, setExpandedSenders] = useState<Set<string>>(new Set());

  // Initialize folderId from URL on mount
  useEffect(() => {
    const folderFromUrl = searchParams.get('folder');
    if (folderFromUrl && folderFromUrl !== folderId) {
      setFolderId(folderFromUrl);
    }
  }, [searchParams]);

  const handleMailboxSelected = (id: string) => {
    setMailboxId(id);
  };

  const handleAccountSelected = (account: { id: string }) => {
    setAccountId(account.id);
  };

  const handleFolderSelected = (id: string) => {
    setFolderId(id);
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('folder', id);
    router.replace(`/emails-by-sender?${newSearchParams.toString()}`, { scroll: false });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const refreshData = () => {
    if (mailboxId && folderId) {
      loadMessages();
    }
  };

  const handleBackToMail = () => {
    // Preserve current folder selection when navigating back
    const newSearchParams = new URLSearchParams();
    if (folderId) {
      newSearchParams.set('folder', folderId);
    }
    router.push(`/mail?${newSearchParams.toString()}`);
  };

  const loadMessages = async () => {
    if (!mailboxId || !folderId) return;

    try {
      setLoading(true);
      setError(null);
      // Fetch 100 emails instead of the default 30
      const data = await messageService.getMessages(mailboxId, folderId, 0, 100);
      setMessages(data.messages);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mailboxId && folderId) {
      loadMessages();
    }
  }, [mailboxId, folderId]);

  // Group messages by sender email
  const groupedBySender = useMemo(() => {
    const grouped = new Map<string, GroupedEmails>();

    messages.forEach((message) => {
      const senderEmail = message.headers.from[0]?.email || 'unknown@unknown.com';
      const senderName = message.headers.from[0]?.name || message.headers.from[0]?.email || 'Unknown Sender';

      if (grouped.has(senderEmail)) {
        const existing = grouped.get(senderEmail)!;
        existing.messages.push(message);
        existing.totalCount++;
      } else {
        grouped.set(senderEmail, {
          senderEmail,
          senderName,
          messages: [message],
          totalCount: 1,
        });
      }
    });

    // Sort by message count (descending)
    return Array.from(grouped.values()).sort((a, b) => b.totalCount - a.totalCount);
  }, [messages]);

  const toggleSenderExpansion = (senderEmail: string) => {
    const newExpanded = new Set(expandedSenders);
    if (newExpanded.has(senderEmail)) {
      newExpanded.delete(senderEmail);
    } else {
      newExpanded.add(senderEmail);
    }
    setExpandedSenders(newExpanded);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isReady = mailboxId;

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
          onGroupBySender={handleBackToMail}
          groupBySenderIcon="back"
        />

        {/* Desktop Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b hidden md:block">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMail}
                  className="flex items-center space-x-1"
                  title="Back to Mail"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Mail className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Emails by Sender</h1>
                <MailboxSelector onMailboxSelected={handleMailboxSelected} />
              </div>

              <div className="flex items-center space-x-4">
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
                  disabled={!isReady}
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
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Emails Grouped by Sender
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing up to 100 emails from the selected folder, organized by sender
                  </p>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {!loading && !error && !isReady && (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a mailbox and folder to view emails grouped by sender
                    </p>
                  </div>
                )}

                {!loading && !error && isReady && groupedBySender.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No emails found in this folder
                    </p>
                  </div>
                )}

                {!loading && !error && groupedBySender.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">
                            Total: {messages.length} emails from {groupedBySender.length} senders
                          </p>
                        </div>
                      </div>
                    </div>

                    {groupedBySender.map((group) => {
                      const isExpanded = expandedSenders.has(group.senderEmail);

                      return (
                        <div
                          key={group.senderEmail}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          {/* Sender Header */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            onClick={() => toggleSenderExpansion(group.senderEmail)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                )}

                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarFallback className="bg-purple-500 text-white">
                                    {getInitials(group.senderName)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {group.senderName}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {group.senderEmail}
                                  </p>
                                </div>
                              </div>

                              <Badge variant="secondary" className="ml-4">
                                {group.totalCount} {group.totalCount === 1 ? 'email' : 'emails'}
                              </Badge>
                            </div>
                          </div>

                          {/* Expanded Message List */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 dark:border-gray-700">
                              {group.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className="p-4 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "font-medium text-gray-900 dark:text-white truncate",
                                        !message.flags.read && "font-bold"
                                      )}>
                                        {message.headers.subject || '(No subject)'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                        {message.snippet}
                                      </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                        {message.headers.internalDate
                                          ? formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true })
                                          : 'Unknown time'}
                                      </p>
                                      {!message.flags.read && (
                                        <Badge variant="default" className="mt-1 bg-purple-600">
                                          Unread
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function EmailsBySenderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <EmailsBySenderContent />
    </Suspense>
  );
}
