import { gmail } from './gmail-client';
import { Account } from '@/lib/types/api';

class AccountService {
  async getAccounts() {
    // Gmail only has one account - the authenticated user
    const profile: any = await gmail.users.getProfile();

    const account: Account = {
      id: 'primary',
      priority: 0,
      email: profile.emailAddress,
      createTime: Date.now(),
      link: {
        type: 'gmail',
        href: '',
      },
      isPrimary: true,
      accountVerified: true,
      status: 'ENABLED' as const,
      signatureActive: false,
      isSending: true,
      isSelected: true,
      checksum: '',
      subscriptionId: '',
      highestModSeq: 0,
      type: 'FREE' as const,
    };

    return {
      accounts: [account],
    };
  }

  async getEnabledAccounts() {
    const accountsData = await this.getAccounts();
    return accountsData.accounts;
  }

  async getPrimaryAccount() {
    const accountsData = await this.getAccounts();
    return accountsData.accounts[0];
  }
}

export const accountService = new AccountService();
