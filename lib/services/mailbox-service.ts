import {
  ApiResponse,
  GetMailBoxApiResponse
} from '@/lib/types/api';
import { apiClient } from './api-client';

class MailboxService {
  async getMailbox(): Promise<GetMailBoxApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetMailBoxApiResponse>>('/mailboxes');
      return response.result;
    } catch (error) {
      console.error('Failed to fetch mailbox:', error);
      throw error;
    }
  }

  async getPrimaryMailbox(): Promise<GetMailBoxApiResponse> {
    const mailboxData = await this.getMailbox();

    // Find primary and selected mailbox
    const primaryMailbox = mailboxData.mailboxes.find(
      mailbox => mailbox.isPrimary && mailbox.isSelected
    );

    if (!primaryMailbox) {
      throw new Error('No primary mailbox found');
    }

    return {
      ...mailboxData,
      mailboxes: [primaryMailbox]
    };
  }

  getMailboxId(mailboxData: GetMailBoxApiResponse): string {
    const primaryMailbox = mailboxData.mailboxes.find(
      mailbox => mailbox.isPrimary && mailbox.isSelected
    );

    if (!primaryMailbox) {
      throw new Error('No primary mailbox found');
    }

    return primaryMailbox.id;
  }
}

export const mailboxService = new MailboxService();
