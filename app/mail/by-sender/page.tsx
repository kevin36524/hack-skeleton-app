'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { messageService } from '@/lib/services/message-service';
import { Message } from '@/lib/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Mail, Star, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface SenderGroup {
  senderEmail: string;
  senderName: string;
  messageCount: number;
  messages: Message[];
}

export default function MessagesBySenderPage() {
  const searchParams = useSearchParams();
  const mailboxId = searchParams.get('mailboxId');
  const folderId = searchParams.get('folderId');

  const [senderGroups, setSenderGroups] = useState<SenderGroup[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSenders, setExpandedSenders] = useState<Set<string>>(new Set());

  const loadGroupedMessages = useCallback(async () => {
    if (!mailboxId || !folderId) {
      setError('Missing mailboxId or folderId parameters');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[BY_SENDER] Fetching messages for mailbox:', mailboxId, 'folder:', folderId);

      // Fetch top 100 messages using the existing message service
      const data = await messageService.getMessages(mailboxId, folderId, 0, 100);
      const messages = data.messages || [];

      console.log('[BY_SENDER] Fetched', messages.length, 'messages');
      setTotalMessages(messages.length);

      // Group messages by sender
      const groupedBySender = new Map<string, SenderGroup>();

      messages.forEach((message: Message) => {
        const from = message.headers?.from?.[0];
        const senderEmail = from?.email || 'unknown@unknown.com';
        const senderName = from?.name || senderEmail;

        if (!groupedBySender.has(senderEmail)) {
          groupedBySender.set(senderEmail, {
            senderEmail,
            senderName,
            messageCount: 0,
            messages: [],
          });
        }

        const group = groupedBySender.get(senderEmail)!;
        group.messageCount++;
        group.messages.push(message);
      });

      // Convert to array and sort by message count (descending)
      const groupedArray = Array.from(groupedBySender.values()).sort(
        (a, b) => b.messageCount - a.messageCount
      );

      // Sort messages within each group by date (newest first)
      groupedArray.forEach(group => {
        group.messages.sort((a, b) => {
          const dateA = parseInt(a.headers.internalDate) * 1000;
          const dateB = parseInt(b.headers.internalDate) * 1000;
          return dateB - dateA;
        });
      });

      console.log('[BY_SENDER] Grouped into', groupedArray.length, 'senders');
      setSenderGroups(groupedArray);
    } catch (err) {
      console.error('[BY_SENDER] Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [mailboxId, folderId]);

  useEffect(() => {
    loadGroupedMessages();
  }, [loadGroupedMessages]);

  const toggleSender = (senderEmail: string) => {
    const newExpanded = new Set(expandedSenders);
    if (newExpanded.has(senderEmail)) {
      newExpanded.delete(senderEmail);
    } else {
      newExpanded.add(senderEmail);
    }
    setExpandedSenders(newExpanded);
  };

  const expandAll = () => {
    setExpandedSenders(new Set(senderGroups.map(g => g.senderEmail)));
  };

  const collapseAll = () => {
    setExpandedSenders(new Set());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Failed to Load Messages</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={loadGroupedMessages}>
              Try Again
            </Button>
            <Link href="/mail">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mail
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages Grouped by Sender</h1>
            <p className="text-gray-600">
              Showing {totalMessages} messages from {senderGroups.length} senders
            </p>
          </div>
          <Link href="/mail">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mail
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Sender Groups */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3">
          {senderGroups.map((group) => {
            const isExpanded = expandedSenders.has(group.senderEmail);

            return (
              <Collapsible
                key={group.senderEmail}
                open={isExpanded}
                onOpenChange={() => toggleSender(group.senderEmail)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-purple-500 text-white">
                              {getInitials(group.senderName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <CardTitle className="text-lg">{group.senderName}</CardTitle>
                            <p className="text-sm text-gray-500">{group.senderEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="text-base px-4 py-1">
                            <Mail className="h-4 w-4 mr-2" />
                            {group.messageCount} {group.messageCount === 1 ? 'message' : 'messages'}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <div className="space-y-2">
                          {group.messages.map((message) => (
                            <div
                              key={message.id}
                              className={cn(
                                'p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                                !message.flags.read && 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={cn(
                                      'font-medium text-sm truncate',
                                      !message.flags.read && 'font-bold'
                                    )}>
                                      {message.headers.subject || '(No subject)'}
                                    </h4>
                                    {message.flags.flagged && (
                                      <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {message.snippet}
                                  </p>
                                </div>
                                <div className="ml-4 text-xs text-gray-500 whitespace-nowrap">
                                  {formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
