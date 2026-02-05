'use client';

import { useState, useEffect, useRef } from 'react';
import { Message, Attachment } from '@/lib/types/api';
import { format } from 'date-fns';
import { Box, VStack, HStack, Text, Icon, Divider, Button, IconButton, Badge, AvatarText } from '@yahoo/uds';
import { PaperPlane } from '@yahoo/uds-icons';
import { HoverableListItem } from '@/components/uds-utils';
import { UDSIcons } from '@/lib/uds-icons-map';
import { messageService } from '@/lib/services/message-service';

interface MessageDetailProps {
  message: Message | null;
  mailboxId?: string;
  onMarkAsRead?: (messageId: string) => void;
  onMarkAsUnread?: (messageId: string) => void;
  onToggleStar?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onArchive?: (messageId: string) => void;
}

export function MessageDetail({
  message,
  mailboxId,
  onMarkAsRead,
  onMarkAsUnread,
  onToggleStar,
  onReply,
  onForward,
  onDelete,
  onArchive
}: MessageDetailProps) {
  const [fullBody, setFullBody] = useState<{ text: string; html?: string } | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fetch full message body when message changes
  useEffect(() => {
    if (message && mailboxId) {
      const fetchFullBody = async () => {
        setLoadingBody(true);
        setBodyError(null);
        setFullBody(null);

        try {
          const response = await messageService.getFullMessageBody(mailboxId, message.id);
          setFullBody(response.simpleBody);
        } catch (error) {
          console.error('Failed to fetch full message body:', error);
          setBodyError('Failed to load message content');
        } finally {
          setLoadingBody(false);
        }
      };

      fetchFullBody();
    } else {
      setFullBody(null);
      setBodyError(null);
    }
  }, [message?.id, mailboxId]);

  if (!message) {
    return (
      <VStack
        alignItems="center"
        justifyContent="center"
        className="h-full"
        gap="4"
        spacing="4"
      >
        <Icon name={UDSIcons.Mail} size="lg" color="secondary" />
        <Text variant="body1" color="secondary">Select a message to view its contents</Text>
      </VStack>
    );
  }

  const getSenderName = (from: Array<{name?: string; email: string}>) => {
    const sender = from[0];
    return sender?.name || sender?.email || 'Unknown';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDropdownItemClick = (action: () => void) => {
    action();
    setDropdownOpen(false);
  };

  return (
    <VStack gap="0" alignItems="stretch" justifyContent="flex-start" className="h-full" backgroundColor="primary">
      {/* Message Header - Action Buttons */}
      <HStack gap="2" alignItems="center" justifyContent="flex-end" spacing="4">
        <IconButton
          name={UDSIcons.Archive}
          variant="tertiary"
          size="sm"
          aria-label="Archive"
          onClick={() => onArchive?.(message.id)}
        />
        <IconButton
          name={UDSIcons.Trash}
          variant="tertiary"
          size="sm"
          aria-label="Delete"
          onClick={() => onDelete?.(message.id)}
        />
        <IconButton
          name={UDSIcons.Star}
          variant="tertiary"
          size="sm"
          aria-label="Star"
          onClick={() => onToggleStar?.(message.id)}
          style={{
            color: message.flags.flagged ? '#f59e0b' : undefined,
          }}
        />
        <Box position="relative" ref={dropdownRef}>
          <IconButton
            name={UDSIcons.MoreVertical}
            variant="tertiary"
            size="sm"
            aria-label="More options"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <Box
              position="absolute"
              backgroundColor="primary"
              borderWidth="thin"
              borderColor="secondary"
              borderRadius="md"
              className="right-0 top-full mt-1 min-w-[200px] z-50 overflow-hidden shadow-lg"
            >
              <VStack gap="0">
                <HoverableListItem
                  onClick={() => handleDropdownItemClick(() => onMarkAsRead?.(message.id))}
                >
                  <Text variant="body1" className="px-3 py-2">Mark as read</Text>
                </HoverableListItem>
                <HoverableListItem
                  onClick={() => handleDropdownItemClick(() => onMarkAsUnread?.(message.id))}
                >
                  <Text variant="body1" className="px-3 py-2">Mark as unread</Text>
                </HoverableListItem>
              </VStack>
            </Box>
          )}
        </Box>
      </HStack>

      {/* Sender Info */}
      <HStack gap="4" alignItems="flex-start" justifyContent="flex-start" spacing="4">
        <AvatarText initials={getInitials(getSenderName(message.headers.from))} size="lg" />
        <VStack gap="1" alignItems="flex-start" justifyContent="flex-start" className="flex-1">
          <HStack gap="2" alignItems="center" justifyContent="space-between" className="w-full">
            <Text variant="headline1" color="primary">
              {getSenderName(message.headers.from)}
            </Text>
            <Text variant="caption1" color="secondary">
              {message.headers.internalDate ? format(new Date(parseInt(message.headers.internalDate) * 1000), 'MMM d, h:mm a') : 'Unknown'}
            </Text>
          </HStack>
          <Text variant="caption1" color="secondary">
            to me
          </Text>
        </VStack>
      </HStack>

      {/* Subject */}
      <Box spacing="4">
        <Text variant="title3" color="primary">
          {message.headers.subject || '(No subject)'}
        </Text>
      </Box>

      <Divider variant="secondary" />

      {/* Message Body */}
      <Box display="flex" flexDirection="column" spacing="4" rowGap="4" className="flex-1 overflow-auto">
        {loadingBody ? (
          <VStack alignItems="center" justifyContent="center" spacing="8">
            <Icon name={UDSIcons.Loader2} size="lg" className="animate-spin" color="secondary" />
            <Text variant="body1" color="secondary">Loading message content...</Text>
          </VStack>
        ) : bodyError ? (
          <VStack gap="4" alignItems="flex-start" justifyContent="flex-start">
            <Text variant="body1" color="alert">
              {bodyError}
            </Text>
            <Text variant="caption1" color="secondary">
              Showing snippet instead:
            </Text>
            <Text variant="body1" color="primary" style={{ whiteSpace: 'pre-wrap' }}>
              {message.snippet}
            </Text>
          </VStack>
        ) : (
          <VStack gap="4" alignItems="flex-start" justifyContent="flex-start">
            {fullBody?.html ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: fullBody.html }}
              />
            ) : fullBody?.text ? (
              <Text variant="body1" color="primary" style={{ whiteSpace: 'pre-wrap' }}>
                {fullBody.text}
              </Text>
            ) : (
              <Text variant="body1" color="primary" style={{ whiteSpace: 'pre-wrap' }}>
                {message.snippet}
              </Text>
            )}
          </VStack>
        )}

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <>
            {message.attachments.map((attachment, index) => (
              <Box
                key={index}
                display="flex"
                flexDirection="row"
                columnGap="3"
                spacing="3"
                borderWidth="thin"
                borderColor="secondary"
                borderRadius="md"
                alignItems="center"
                className="w-fit"
              >
                <Box
                  display="flex"
                  spacing="2"
                  backgroundColor="secondary"
                  borderRadius="sm"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon name={UDSIcons.Paperclip} size="sm" color="secondary" />
                </Box>
                <VStack gap="0" alignItems="flex-start" justifyContent="flex-start">
                  <Text variant="label3" color="primary">
                    {(attachment.filename as string) || `Attachment ${index + 1}`}
                  </Text>
                  <Text variant="caption2" color="secondary">
                    {(attachment.size as string) || 'Unknown size'}
                  </Text>
                </VStack>
              </Box>
            ))}
          </>
        )}
      </Box>

      <Divider variant="secondary" />

      {/* Reply Actions */}
      <Box display="flex" flexDirection="row" columnGap="2" spacing="4">
        <Button
          variant="primary"
          size="md"
          startIcon={PaperPlane}
          onPress={() => onReply?.(message)}
        >
          Reply
        </Button>
        <Button
          variant="secondary"
          size="md"
          onPress={() => onForward?.(message)}
        >
          Forward
        </Button>
      </Box>
    </VStack>
  );
}
