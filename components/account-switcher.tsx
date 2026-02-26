'use client';

import { useEffect, useState } from 'react';
import { useAccounts } from '@/lib/hooks/use-yahoo-mail';
import { Account } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, User } from 'lucide-react';

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
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { data, isLoading: loading, error: queryError } = useAccounts(mailboxId);
  const accounts: Account[] = data?.accounts || [];
  const error = queryError ? ((queryError as Error).message || 'Failed to load accounts') : null;

  // Auto-select primary account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const primaryAccount = accounts.find(acc => acc.isPrimary) || accounts[0];
      if (primaryAccount) {
        console.log('[AccountSwitcher] Auto-selecting account:', primaryAccount.id, 'mailboxId:', mailboxId);
        setSelectedAccount(primaryAccount);
        onAccountSelected?.(primaryAccount);
      }
    }
  }, [accounts]);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    if (onAccountSelected) {
      onAccountSelected(account);
    }
  };

  if (loading) {
    return (
      <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md" />
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No accounts available
      </div>
    );
  }

  if (accounts.length === 1) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <User className="h-4 w-4" />
        <span>{selectedAccount?.email || accounts[0].email}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="max-w-[200px] truncate">
            {selectedAccount?.email || 'Select account'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => handleAccountSelect(account)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{account.email}</span>
              {account.description && (
                <span className="text-xs text-gray-500">{account.description}</span>
              )}
            </div>
            {account.isPrimary && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Primary
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}