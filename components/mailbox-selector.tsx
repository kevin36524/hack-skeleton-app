'use client';

import { useEffect } from 'react';
import { useMailbox } from '@/lib/hooks/use-yahoo-mail';
import { Box, HStack, VStack, Text, Icon, Badge } from '@yahoo/uds';
import { UDSIcons } from '@/lib/uds-icons-map';

interface MailboxSelectorProps {
  onMailboxSelected?: (mailboxId: string) => void;
}

export function MailboxSelector({ onMailboxSelected }: MailboxSelectorProps) {
  const { data: mailboxData, isLoading: loading, error } = useMailbox();

  useEffect(() => {
    if (mailboxData && onMailboxSelected) {
      // Automatically select primary mailbox once data is loaded
      const primaryMailbox = mailboxData.mailboxes.find(
        mailbox => mailbox.isPrimary && mailbox.isSelected
      );

      if (primaryMailbox) {
        console.log('MailboxSelector: Auto-selecting primary mailbox:', primaryMailbox.id);
        onMailboxSelected(primaryMailbox.id);
      }
    }
  }, [mailboxData]); // Only run when mailboxData changes

  if (loading) {
    return (
      <HStack gap="3" alignItems="center" className="max-w-sm">
        <Box className="animate-pulse flex items-center space-x-2">
          <Box className="h-4 w-4 bg-[var(--color-bg-secondary)] rounded" />
          <Box className="h-4 bg-[var(--color-bg-secondary)] rounded w-16" />
          <Box className="h-3 bg-[var(--color-bg-secondary)] rounded w-20" />
        </Box>
      </HStack>
    );
  }

  if (error) {
    return (
      <HStack gap="2" alignItems="center" className="max-w-sm">
        <Icon name={UDSIcons.Mail} size="sm" color="alert" />
        <Text variant="label2" color="alert" className="truncate">
          Failed to load mailbox
        </Text>
      </HStack>
    );
  }

  if (!mailboxData) {
    return null;
  }

  const primaryMailbox = mailboxData.mailboxes.find(
    mailbox => mailbox.isPrimary && mailbox.isSelected
  );

  return (
    <HStack gap="3" alignItems="center" className="max-w-sm overflow-hidden">
      {primaryMailbox && (
        <>
          <HStack gap="2" alignItems="center" className="flex-shrink-0">
            <Icon name={UDSIcons.Mail} size="sm" color="brand" />
            <Badge variant="brand" size="sm">Primary</Badge>
          </HStack>
          <VStack gap="0" className="min-w-0 flex-1">
            <Text variant="label2" color="primary" className="truncate">
              {primaryMailbox.email}
            </Text>
            <Text variant="caption2" color="secondary" className="truncate">
              Status: {primaryMailbox.state}
            </Text>
            {mailboxData.cpAttributes.accountCreationTime && (
              <Text variant="caption2" color="tertiary" className="truncate">
                Created: {(() => {
                  try {
                    return new Date(mailboxData.cpAttributes.accountCreationTime).toLocaleDateString();
                  } catch (error) {
                    return 'Unknown';
                  }
                })()}
              </Text>
            )}
          </VStack>
        </>
      )}
    </HStack>
  );
}