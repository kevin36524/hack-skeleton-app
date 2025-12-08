'use client';

import { useEffect, useState } from 'react';
import { accountService } from '@/lib/services/account-service';
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AccountSwitcher: mailboxId:', mailboxId);
    if (mailboxId) {
      console.log('AccountSwitcher: Loading accounts...');
      loadAccounts();
    }
  }, [mailboxId]);

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