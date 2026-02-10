import { gmail } from './gmail-client';

class AccountService {
  async getAccounts() {
    // Gmail only has one account - the authenticated user
    const profile: any = await gmail.users.getProfile();

    return {
      accounts: [{
        id: 'primary',
        email: profile.emailAddress,
        isPrimary: true,
        status: 'ENABLED',
      }],
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
