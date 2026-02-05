'use client';

import { useEffect, useState, useRef } from 'react';
import { accountService } from '@/lib/services/account-service';
import { Account } from '@/lib/types/api';
import { Box, HStack, VStack, Text, Icon, Badge, Button } from '@yahoo/uds';
import { UDSIcons } from '@/lib/uds-icons-map';
import { HoverableListItem, CardBox } from '@/components/uds-utils';

interface AccountSwitcherProps {
  mailboxId: string;
  selectedAccountId?: string;
  onAccountSelected?: (account: Account) => void;
}

export function AccountSwitcher({
  mailboxId,
  selectedAccountId,
  onAccountSelected
}: AccountSwitcherProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('AccountSwitcher: mailboxId:', mailboxId);
    if (mailboxId) {
      console.log('AccountSwitcher: Loading accounts...');
      loadAccounts();
    }
  }, [mailboxId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      console.log('AccountSwitcher: Calling accountService.getEnabledAccounts for mailboxId:', mailboxId);
      const enabledAccounts = await accountService.getEnabledAccounts(mailboxId);
      console.log('AccountSwitcher: Got accounts:', enabledAccounts.length);
      setAccounts(enabledAccounts);

      // Select primary account or first enabled account
      const primaryAccount = enabledAccounts.find(acc => acc.isPrimary) || enabledAccounts[0];
      if (primaryAccount) {
        console.log('AccountSwitcher: Auto-selecting account:', primaryAccount.id);
        setSelectedAccount(primaryAccount);
        if (onAccountSelected) {
          onAccountSelected(primaryAccount);
        }
      }
    } catch (err) {
      setError('Failed to load accounts');
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setIsOpen(false);
    if (onAccountSelected) {
      onAccountSelected(account);
    }
  };

  if (loading) {
    return (
      <Box className="h-10 w-48 bg-[var(--color-bg-secondary)] animate-pulse rounded-md" />
    );
  }

  if (error) {
    return (
      <Text variant="caption1" color="alert">
        {error}
      </Text>
    );
  }

  if (accounts.length === 0) {
    return (
      <Text variant="caption1" color="secondary">
        No accounts available
      </Text>
    );
  }

  if (accounts.length === 1) {
    return (
      <HStack gap="2" alignItems="center">
        <Text variant="label2" color="primary">
          {selectedAccount?.email || accounts[0].email}
        </Text>
      </HStack>
    );
  }

  return (
    <Box position="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        endIcon={isOpen ? UDSIcons.ChevronUp : UDSIcons.ChevronDown}
        className="w-full justify-between"
      >
        <Text variant="label2" className="max-w-[200px] truncate">
          {selectedAccount?.email || 'Select account'}
        </Text>
      </Button>

      {isOpen && (
        <Box position="absolute" className="top-full left-0 right-0 mt-1 z-50">
          <CardBox>
            <VStack gap="1" spacing="1">
              {accounts.map((account) => (
                <HoverableListItem
                  key={account.id}
                  isActive={account.id === selectedAccount?.id}
                  onClick={() => handleAccountSelect(account)}
                >
                  <HStack gap="2" alignItems="center" justifyContent="space-between" spacing="2" className="w-full">
                    <VStack gap="0">
                      <Text variant="label2" color="primary">{account.email}</Text>
                      {account.description && (
                        <Text variant="caption2" color="secondary">{account.description}</Text>
                      )}
                    </VStack>
                    {account.isPrimary && (
                      <Badge variant="brand" size="sm">Primary</Badge>
                    )}
                  </HStack>
                </HoverableListItem>
              ))}
            </VStack>
          </CardBox>
        </Box>
      )}
    </Box>
  );
}