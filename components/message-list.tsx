'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { messageService } from '@/lib/services/message-service';
import { Message, Conversation } from '@/lib/types/api';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Star, Paperclip, Reply, Forward, AlertCircle } from 'lucide-react';

interface MessageListProps {
  mailboxId: string;
  folderId: string;
  onMessageSelected?: (message: Message) => void;
  selectedMessageId?: string;
}

interface GroupedMessage {
  conversationId: string;
  latestMessage: Message;
  messages: Message[];
  conversation: Conversation | undefined;
}

export function MessageList({ 
  mailboxId, 
  folderId, 
  onMessageSelected, 
  selectedMessageId 
}: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversationsForFolder(mailboxId, folderId);
      setMessages(data.messages);
      setConversations(data.conversations);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [mailboxId, folderId]);

  useEffect(() => {
    if (mailboxId && folderId) {
      loadMessages();
    }
  }, [loadMessages]);

  const groupedMessages = useMemo(() => {
    const grouped = new Map<string, GroupedMessage>();

    messages.forEach((message) => {
      const existing = grouped.get(message.conversationId);
      if (existing) {
        existing.messages.push(message);
        // Keep the latest message based on internalDate
        const newDate = message.headers.internalDate ? parseInt(message.headers.internalDate) * 1000 : 0;
        const existingDate = existing.latestMessage.headers.internalDate ? parseInt(existing.latestMessage.headers.internalDate) * 1000 : 0;
        if (newDate > existingDate) {
          existing.latestMessage = message;
        }
      } else {
        const conversation = conversations.find(c => c.id === message.conversationId);
        grouped.set(message.conversationId, {
          conversationId: message.conversationId,
          latestMessage: message,
          messages: [message],
          conversation
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => {
      const dateA = a.latestMessage.headers.internalDate ? parseInt(a.latestMessage.headers.internalDate) * 1000 : 0;
      const dateB = b.latestMessage.headers.internalDate ? parseInt(b.latestMessage.headers.internalDate) * 1000 : 0;
      return dateB - dateA;
    });
  }, [messages, conversations]);

  const toggleMessageSelection = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };

  const getSenderName = (message: Message) => {
    const from = message.headers.from[0];
    return from?.name || from?.email || 'Unknown';
  };

  const getSenderEmail = (message: Message) => {
    const from = message.headers.from[0];
    return from?.email || '';
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
      <div className="h-full overflow-y-auto">
        <div className="space-y-2 p-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold mb-2">Failed to load messages</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={loadMessages}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (groupedMessages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No messages in this folder</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {groupedMessages.map((group) => {
          const message = group.latestMessage;
          const isSelected = selectedMessages.has(message.id);
          const isUnread = !message.flags.read;

          return (
            <div
              key={message.id}
              className={cn(
                'flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-lg cursor-pointer transition-colors duration-150 border border-transparent',
                isSelected && 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500 border-purple-200 dark:border-purple-800',
                selectedMessageId === message.id && 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-l-purple-600 border-purple-300 dark:border-purple-700'
              )}
              onClick={() => onMessageSelected?.(message)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleMessageSelection(message.id)}
                onClick={(e) => e.stopPropagation()}
              />

              <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                <AvatarFallback className={cn(
                  "text-xs font-medium flex items-center justify-center",
                  isUnread ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                )}>
                  {getInitials(getSenderName(message))}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className={cn(
                      "text-sm font-medium truncate max-w-full",
                      isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {getSenderName(message)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full overflow-hidden">
                      {getSenderEmail(message)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <span className="whitespace-nowrap">
                      {message.headers.internalDate ? formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true }) : 'Unknown time'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {message.flags.flagged && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      {message.attachments.length > 0 && <Paperclip className="h-3 w-3 text-gray-400" />}
                    </div>
                  </div>
                </div>

                <div className="mt-1">
                  <p className={cn(
                    "text-sm text-gray-700 dark:text-gray-300 line-clamp-2 break-words overflow-hidden",
                    isUnread ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                  )}>
                    {message.headers.subject || '(No subject)'}
                  </p>
                  <p className={cn(
                    "text-sm line-clamp-1 mt-1 break-words overflow-hidden",
                    isUnread ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"
                  )}>
                    {message.snippet}
                  </p>
                </div>

                {group.messages.length > 1 && (
                  <Badge variant="secondary" className="mt-2">
                    {group.messages.length} messages
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}