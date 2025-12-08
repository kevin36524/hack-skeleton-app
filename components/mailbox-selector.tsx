'use client';

import { useEffect } from 'react';
import { useMailbox } from '@/lib/hooks/use-yahoo-mail';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';

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
      <div className="flex items-center space-x-3 max-w-sm">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 max-w-sm">
        <Mail className="h-4 w-4 text-red-600" />
        <p className="text-red-600 text-sm truncate">Failed to load mailbox</p>
      </div>
    );
  }

  if (!mailboxData) {
    return null;
  }

  const primaryMailbox = mailboxData.mailboxes.find(
    mailbox => mailbox.isPrimary && mailbox.isSelected
  );

  return (
    <div className="flex items-center space-x-3 max-w-sm overflow-hidden">
      {primaryMailbox && (
        <>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Mail className="h-4 w-4 text-purple-600" />
            <Badge variant="default" className="text-xs px-2 py-1">Primary</Badge>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {primaryMailbox.email}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              Status: {primaryMailbox.state}
            </p>
            {mailboxData.cpAttributes.accountCreationTime && (
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                Created: {(() => {
                  try {
                    return new Date(mailboxData.cpAttributes.accountCreationTime).toLocaleDateString();
                  } catch (error) {
                    return 'Unknown';
                  }
                })()}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}