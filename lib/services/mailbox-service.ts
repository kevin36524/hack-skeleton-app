import { gmail } from './gmail-client';

class MailboxService {
  async getProfile() {
    return gmail.users.getProfile();
  }

  async getMailbox() {
    const profile: any = await this.getProfile();

    // Return in expected format with all fields
    return {
      mailboxes: [{
        id: 'primary',
        email: profile.emailAddress,
        isPrimary: true,
        isSelected: true,
        state: 'active',
        type: 'FREE',
        link: {
          type: 'profile',
          href: '/users/me/profile',
        },
      }],
      guid: 'primary',
      cpAttributes: {
        consentEvents: {},
        accountCreationTime: new Date().toISOString(),
      },
      state: 'active',
      shardId: '0',
      namespace: 'gmail',
      oauth: {
        scopes: ['gmail.readonly', 'gmail.modify'],
      },
    };
  }
}

export const mailboxService = new MailboxService();
