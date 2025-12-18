'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from '@/components/mailbox-selector';
import { AccountSwitcher } from '@/components/account-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { messageService } from '@/lib/services/message-service';
import { folderService } from '@/lib/services/folder-service';
import { Message } from '@/lib/types/api';
import { LogOut, Mail, ArrowLeft, ChevronDown, ChevronRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface GroupedBySender {
  senderName: string;
  senderEmail: string;
  messages: Message[];
  unreadCount: number;
}

function GroupBySenderContent() {
  const { logout } = useAuth();
  const router = useRouter();

  const [mailboxId, setMailboxId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSenders, setExpandedSenders] = useState<Set<string>>(new Set());

  const handleMailboxSelected = (id: string) => {
    setMailboxId(id);
  };

  const handleAccountSelected = (account: { id: string }) => {
    setAccountId(account.id);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!mailboxId) return;

      try {
        setLoading(true);
        setError(null);

        // First, fetch folders to find the inbox folder ID
        const foldersData = await folderService.getFolders(mailboxId);

        // Find the inbox folder - filter by accountId if provided, otherwise use the first inbox
        let inboxFolder;
        if (accountId) {
          inboxFolder = foldersData.folders.find(folder =>
            folder.types.includes('INBOX') && folder.acctId === accountId
          );
        } else {
          inboxFolder = foldersData.folders.find(folder =>
            folder.types.includes('INBOX')
          );
        }

        if (!inboxFolder) {
          setError('Inbox folder not found. Please select a mailbox.');
          setLoading(false);
          return;
        }

        // Fetch 100 messages by using count parameter
        const data = await messageService.getMessages(mailboxId, inboxFolder.id, 0, 100);
        setMessages(data.messages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [mailboxId, accountId]);

  const groupedMessages = useMemo(() => {
    const grouped = new Map<string, GroupedBySender>();

    messages.forEach((message) => {
      const sender = message.headers.from[0];
      const senderEmail = sender?.email || 'unknown@email.com';
      const senderName = sender?.name || senderEmail;

      const existing = grouped.get(senderEmail);
      if (existing) {
        existing.messages.push(message);
        if (!message.flags.read) {
          existing.unreadCount++;
        }
      } else {
        grouped.set(senderEmail, {
          senderName,
          senderEmail,
          messages: [message],
          unreadCount: message.flags.read ? 0 : 1
        });
      }
    });

    // Sort by number of messages (descending)
    return Array.from(grouped.values()).sort((a, b) => b.messages.length - a.messages.length);
  }, [messages]);

  const toggleSender = (senderEmail: string) => {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/mail')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Mail className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Group by Sender</h1>
                <MailboxSelector onMailboxSelected={handleMailboxSelected} />
              </div>

              <div className="flex items-center space-x-4">
                <AccountSwitcher
                  mailboxId={mailboxId}
                  onAccountSelected={handleAccountSelected}
                />
                <ThemeToggle />
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
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5" />
                <p className="text-sm">
                  Showing latest 100 emails grouped by sender from your Inbox
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No messages found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {groupedMessages.map((group) => (
                  <div
                    key={group.senderEmail}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
                      onClick={() => toggleSender(group.senderEmail)}
                    >
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className={cn(
                          "text-sm font-medium flex items-center justify-center",
                          group.unreadCount > 0 ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        )}>
                          {getInitials(group.senderName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={cn(
                            "text-base font-medium truncate",
                            group.unreadCount > 0 ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {group.senderName}
                          </p>
                          {group.unreadCount > 0 && (
                            <Badge variant="default" className="bg-purple-600">
                              {group.unreadCount} unread
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {group.senderEmail}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <Badge variant="secondary" className="text-sm">
                          {group.messages.length} {group.messages.length === 1 ? 'message' : 'messages'}
                        </Badge>
                        {expandedSenders.has(group.senderEmail) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedSenders.has(group.senderEmail) && (
                      <div className="border-t dark:border-gray-700">
                        <div className="divide-y dark:divide-gray-700">
                          {group.messages
                            .sort((a, b) => {
                              const dateA = parseInt(a.headers.internalDate) * 1000;
                              const dateB = parseInt(b.headers.internalDate) * 1000;
                              return dateB - dateA;
                            })
                            .map((message) => (
                              <div
                                key={message.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                onClick={() => router.push(`/mail?messageId=${message.id}`)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm font-medium truncate",
                                      !message.flags.read ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                                    )}>
                                      {message.headers.subject || '(No subject)'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                      {message.snippet}
                                    </p>
                                  </div>
                                  <div className="ml-3 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    {formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function GroupBySenderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <GroupBySenderContent />
    </Suspense>
  );
}
