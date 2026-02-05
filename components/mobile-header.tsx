'use client';

import { Box, HStack, VStack, Text, Icon, IconButton, Button } from '@yahoo/uds';
import { UDSIcons } from '@/lib/uds-icons-map';
import { MailboxSelector } from './mailbox-selector';
import { AccountSwitcher } from './account-switcher';
import { ThemeToggle } from './theme-toggle';
import { Account } from '@/lib/types/api';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onMailboxSelected: (id: string) => void;
  onAccountSelected: (account: Account) => void;
  mailboxId: string;
  onLogout: () => void;
  onRefresh: () => void;
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
  activeTab = 'mail',
  onTabChange,
}: MobileHeaderProps) {
  return (
    <Box
      backgroundColor="primary"
      borderBottomWidth="thin"
      borderColor="secondary"
      className="md:hidden"
    >
      <VStack gap="3" spacing="4">
        {/* Top bar with menu and actions */}
        <HStack gap="3" alignItems="center" justifyContent="space-between">
          <HStack gap="3" alignItems="center">
            <IconButton
              name={sidebarOpen ? UDSIcons.Close : UDSIcons.Menu}
              variant="tertiary"
              size="sm"
              onClick={onToggleSidebar}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            />
            <HStack gap="2" alignItems="center">
              <Icon name={UDSIcons.Mail} size="md" color="brand" />
              <Text variant="title3" color="brand">
                Yahoo Mail
              </Text>
            </HStack>
          </HStack>

          <HStack gap="2" alignItems="center">
            <ThemeToggle size="sm" />
            <IconButton
              name={UDSIcons.Refresh}
              variant="tertiary"
              size="sm"
              onClick={onRefresh}
              aria-label="Refresh"
            />
            <IconButton
              name={UDSIcons.Close}
              variant="tertiary"
              size="sm"
              onClick={onLogout}
              aria-label="Sign out"
            />
          </HStack>
        </HStack>

        {/* Tab selector */}
        <Box
          backgroundColor="secondary"
          borderRadius="md"
          spacing="1"
          className="flex items-center"
        >
          <Button
            variant={activeTab === 'mail' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => onTabChange?.('mail')}
            startIcon={UDSIcons.Mail}
            className="flex-1"
          >
            Mail
          </Button>
          <Button
            variant={activeTab === 'digest' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => onTabChange?.('digest')}
            className="flex-1"
          >
            Digest
          </Button>
          <Button
            variant={activeTab === 'autopilot' ? 'primary' : 'tertiary'}
            size="sm"
            onClick={() => onTabChange?.('autopilot')}
            className="flex-1"
          >
            Autopilot
          </Button>
        </Box>

        {/* Account selectors */}
        <VStack gap="2">
          <MailboxSelector onMailboxSelected={onMailboxSelected} />
          {mailboxId && (
            <AccountSwitcher
              mailboxId={mailboxId}
              onAccountSelected={onAccountSelected}
            />
          )}
        </VStack>
      </VStack>
    </Box>
  );
}