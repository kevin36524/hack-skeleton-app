'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { messageService } from '@/lib/services/message-service';
import { Message, Conversation } from '@/lib/types/api';
import { formatDistanceToNow } from 'date-fns';
import { Box, HStack, VStack, Text, Icon, Badge, IconButton, Divider, AvatarText } from '@yahoo/uds';
import { Refresh, MoreVertical, Check, Envelope, Priority, Paperclip, Star } from '@yahoo/uds-icons';
import { cn } from '@/lib/utils';
import { UDSIcons } from '@/lib/uds-icons-map';

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

  const getSenderName = (message: Message) => {
    const from = message.headers.from[0];
    return from?.name || from?.email || 'Unknown';
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
      <VStack gap="2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Box
            key={i}
            className="flex items-center space-x-3 p-3 border rounded-lg"
          >
            <Box className="h-10 w-10 rounded-full bg-[var(--color-bg-secondary)] animate-pulse" />
            <Box className="flex-1 space-y-2">
              <Box className="h-4 w-3/4 bg-[var(--color-bg-secondary)] animate-pulse rounded" />
              <Box className="h-3 w-1/2 bg-[var(--color-bg-secondary)] animate-pulse rounded" />
              <Box className="h-3 w-full bg-[var(--color-bg-secondary)] animate-pulse rounded" />
            </Box>
            <Box className="space-y-1">
              <Box className="h-3 w-16 bg-[var(--color-bg-secondary)] animate-pulse rounded" />
              <Box className="h-3 w-8 bg-[var(--color-bg-secondary)] animate-pulse rounded" />
            </Box>
          </Box>
        ))}
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack className="items-center justify-center py-8">
        <Box className="text-center max-w-sm">
          <Icon
            name={UDSIcons.AlertCircle}
            className="h-12 w-12 text-red-500 mb-4 mx-auto"
          />
          <Text className="text-lg font-semibold mb-2">Failed to load messages</Text>
          <Text className="text-sm text-gray-600 mb-4">{error}</Text>
          <IconButton
            name={UDSIcons.Refresh}
            onClick={loadMessages}
            className="mt-2"
          >
            Try Again
          </IconButton>
        </Box>
      </VStack>
    );
  }

  if (groupedMessages.length === 0) {
    return (
      <Box className="text-center py-8">
        <Text className="text-gray-500">No messages in this folder</Text>
      </Box>
    );
  }

  const formatTime = (internalDate: string | undefined) => {
    if (!internalDate) return 'Unknown';
    const date = new Date(parseInt(internalDate) * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const unreadCount = messages.filter(m => !m.flags.read).length;

  return (
    <Box
      display="flex"
      flexDirection="column"
      rowGap="0"
      className="h-full overflow-hidden"
    >
      {/* Filter Bar */}
      <Box
        display="flex"
        flexDirection="row"
        columnGap="2"
        spacingHorizontal="3"
        spacingVertical="2"
        borderBottomWidth="thin"
        borderColor="secondary"
        alignItems="center"
      >
        <HStack gap="2" alignItems="center" justifyContent="flex-start">
          <Icon name={Check} size="xs" color="secondary" />
          <Text variant="caption1" color="secondary">All</Text>
        </HStack>
        <Divider vertical className="h-4" />
        <HStack gap="2" alignItems="center" justifyContent="flex-start">
          <Icon name={Envelope} size="xs" color="secondary" />
          <Text variant="caption1" color="secondary">Unread</Text>
        </HStack>
        <Divider vertical className="h-4" />
        <HStack gap="2" alignItems="center" justifyContent="flex-start">
          <Icon name={Priority} size="xs" color="secondary" />
          <Text variant="caption1" color="secondary">Priority</Text>
        </HStack>
      </Box>

      {/* Email List */}
      <VStack gap="0" alignItems="stretch" justifyContent="flex-start" className="flex-1 overflow-auto">
        {groupedMessages.map((group) => {
          const message = group.latestMessage;
          const isSelected = selectedMessageId === message.id;
          const isRead = message.flags.read;

          return (
            <React.Fragment key={message.id}>
              <Box
                display="flex"
                flexDirection="column"
                spacing="3"
                backgroundColor={isSelected ? "brand-secondary" : undefined}
                className={`cursor-pointer transition-colors ${!isSelected ? "hover:bg-[var(--color-bg-secondary)]" : ""}`}
                onClick={() => onMessageSelected?.(message)}
              >
                <HStack gap="3" alignItems="flex-start" justifyContent="flex-start">
                  <AvatarText initials={getInitials(getSenderName(message))} size="sm" />
                  <VStack gap="1" alignItems="flex-start" justifyContent="flex-start" className="flex-1 min-w-0">
                    <HStack gap="2" alignItems="center" justifyContent="space-between" className="w-full">
                      <Text
                        variant={isRead ? "label2" : "headline1"}
                        color="primary"
                        className="truncate"
                      >
                        {getSenderName(message)}
                      </Text>
                      <HStack gap="1" alignItems="center" justifyContent="flex-end" className="shrink-0">
                        {message.attachments.length > 0 && (
                          <Icon name={Paperclip} size="xs" color="secondary" />
                        )}
                        <Text variant="caption2" color="secondary">
                          {formatTime(message.headers.internalDate)}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text
                      variant={isRead ? "label3" : "label2"}
                      color="primary"
                      className="truncate w-full"
                    >
                      {message.headers.subject || '(No subject)'}
                    </Text>
                    <Text variant="caption1" color="secondary" className="truncate w-full">
                      {message.snippet}
                    </Text>
                  </VStack>
                  <Box display="flex" className="shrink-0">
                    <Icon
                      name={Star}
                      size="sm"
                      variant={message.flags.flagged ? "fill" : "outline"}
                      color={message.flags.flagged ? "warning" : "tertiary"}
                    />
                  </Box>
                </HStack>
              </Box>
              <Divider variant="muted" />
            </React.Fragment>
          );
        })}
      </VStack>
    </Box>
  );
}
