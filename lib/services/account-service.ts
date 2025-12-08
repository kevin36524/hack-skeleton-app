import {
  ApiResponse,
  GetAccountsApiResponse,
  Account
} from '@/lib/types/api';
import { apiClient } from './api-client';

class AccountService {
  async getAccounts(mailboxId: string): Promise<GetAccountsApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetAccountsApiResponse>>(
        `/mailboxes/@.id==${mailboxId}/accounts`
      );
      return response.result;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  }

  async getEnabledAccounts(mailboxId: string): Promise<Account[]> {
    try {
      const accountsData = await this.getAccounts(mailboxId);

      // Filter for enabled accounts, prioritizing FREE accounts
      return accountsData.accounts.filter(
        account => account.status === 'ENABLED'
      );
    } catch (error) {
      console.error('Failed to fetch enabled accounts:', error);
      throw error;
    }
  }

  async getPrimaryAccount(mailboxId: string): Promise<Account | undefined> {
    try {
      const accountsData = await this.getAccounts(mailboxId);

      return accountsData.accounts.find(
        account => account.isPrimary && account.status === 'ENABLED'
      );
    } catch (error) {
      console.error('Failed to fetch primary account:', error);
      throw error;
    }
  }
}

export const accountService = new AccountService();
