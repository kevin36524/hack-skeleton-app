import { gmail } from './gmail-client';

class MessageService {
  /**
   * Get messages in a folder (label)
   */
  async getMessages(folderId: string = 'INBOX', maxResults: number = 30) {
    console.log('[MESSAGE SERVICE] Fetching threads for folder:', folderId);

    // Get list of threads
    const threadsResponse: any = await gmail.users.threads.list({
      labelIds: [folderId],
      maxResults,
    });

    const threads = threadsResponse.threads || [];
    console.log('[MESSAGE SERVICE] Found threads:', threads.length);

    if (threads.length === 0) {
      return {
        threads: [],
        messages: [],
      };
    }

    // Fetch full thread details
    const fullThreads = await Promise.all(
      threads.map(async (thread: any) => {
        const response = await gmail.users.threads.get({
          id: thread.id,
          format: 'full',
        });
        return response;
      })
    );

    // Extract all messages from threads
    const allMessages = fullThreads.flatMap((thread: any) => thread.messages || []);

    console.log('[MESSAGE SERVICE] Total messages:', allMessages.length);

    return {
      threads: fullThreads,
      messages: allMessages,
    };
  }

  /**
   * Get conversations (threads) and messages for a folder
   * Transforms Gmail API data into the format expected by the MessageList component
   */
  async getConversationsForFolder(mailboxId: string, folderId: string, maxResults: number = 30) {
    console.log('[MESSAGE SERVICE] Fetching conversations for folder:', folderId);

    // Get threads from Gmail API
    const { threads, messages } = await this.getMessages(folderId, maxResults);

    // Transform messages into expected format
    const transformedMessages = messages.map((msg: any) => {
      const headers = msg.payload?.headers || [];

      // Helper to get header value
      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase());
        return header?.value || '';
      };

      // Parse From header
      const fromHeader = getHeader('from');
      const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [];
      const fromName = fromMatch[1]?.trim().replace(/^["']|["']$/g, '') || '';
      const fromEmail = fromMatch[2]?.trim() || fromHeader.trim();

      // Parse To header
      const toHeader = getHeader('to');
      const toEmails = toHeader.split(',').map((email: string) => {
        const match = email.trim().match(/^(.+?)\s*<(.+?)>$/) || [];
        return {
          name: match[1]?.trim().replace(/^["']|["']$/g, '') || '',
          email: match[2]?.trim() || email.trim(),
        };
      });

      // Check if message is unread
      const isUnread = (msg.labelIds || []).includes('UNREAD');
      const isStarred = (msg.labelIds || []).includes('STARRED');

      // Get attachments
      const attachments: any[] = [];
      const findAttachments = (part: any) => {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size || 0,
          });
        }
        if (part.parts) {
          part.parts.forEach(findAttachments);
        }
      };
      if (msg.payload?.parts) {
        msg.payload.parts.forEach(findAttachments);
      }

      return {
        id: msg.id,
        conversationId: msg.threadId,
        headers: {
          from: [{
            name: fromName,
            email: fromEmail,
          }],
          to: toEmails,
          subject: getHeader('subject'),
          internalDate: Math.floor(parseInt(msg.internalDate || '0') / 1000).toString(), // Convert to seconds
        },
        flags: {
          read: !isUnread,
          flagged: isStarred,
        },
        snippet: msg.snippet || '',
        attachments,
      };
    });

    // Transform threads into conversations format
    const conversations = threads.map((thread: any) => ({
      id: thread.id,
      snippet: thread.snippet || '',
      historyId: thread.historyId,
    }));

    return {
      messages: transformedMessages,
      conversations,
    };
  }

  /**
   * Get a single message by ID
   */
  async getMessage(messageId: string, format: 'full' | 'metadata' | 'minimal' = 'full') {
    return await gmail.users.messages.get({ id: messageId, format });
  }

  /**
   * Get a thread by ID
   */
  async getThread(threadId: string) {
    return await gmail.users.threads.get({ id: threadId, format: 'full' });
  }

  /**
   * Mark messages as read/unread
   */
  async markAsRead(messageIds: string[], read: boolean = true) {
    const results = await Promise.all(
      messageIds.map(async (id) => {
        try {
          await gmail.users.messages.modify({
            id,
            [read ? 'removeLabelIds' : 'addLabelIds']: ['UNREAD'],
          });
          return { id, success: true };
        } catch (error) {
          console.error(`Failed to mark message ${id}:`, error);
          return { id, success: false };
        }
      })
    );

    return results;
  }

  /**
   * Star/unstar messages
   */
  async toggleStar(messageIds: string[], starred: boolean = true) {
    const results = await Promise.all(
      messageIds.map(async (id) => {
        try {
          await gmail.users.messages.modify({
            id,
            [starred ? 'addLabelIds' : 'removeLabelIds']: ['STARRED'],
          });
          return { id, success: true };
        } catch (error) {
          console.error(`Failed to toggle star on message ${id}:`, error);
          return { id, success: false };
        }
      })
    );

    return results;
  }

  /**
   * Move messages to a different folder (label)
   */
  async moveMessages(messageIds: string[], targetFolderId: string) {
    const results = await Promise.all(
      messageIds.map(async (id) => {
        try {
          // Get current message to see labels
          const message: any = await gmail.users.messages.get({
            id,
            format: 'minimal',
          });

          // Remove folder-like labels (INBOX, etc.)
          const labelsToRemove = (message.labelIds || []).filter((label: string) =>
            ['INBOX', 'SENT', 'DRAFT'].includes(label)
          );

          await gmail.users.messages.modify({
            id,
            addLabelIds: [targetFolderId],
            removeLabelIds: labelsToRemove,
          });

          return { id, success: true };
        } catch (error) {
          console.error(`Failed to move message ${id}:`, error);
          return { id, success: false };
        }
      })
    );

    return results;
  }

  /**
   * Delete messages (move to trash)
   */
  async deleteMessage(messageId: string) {
    await gmail.users.messages.trash({ id: messageId });
    return { success: true };
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, maxResults: number = 30) {
    const response: any = await gmail.users.messages.list({
      q: query,
      maxResults,
    });

    const messageIds = response.messages || [];

    if (messageIds.length === 0) {
      return [];
    }

    // Fetch full message details
    const messages = await Promise.all(
      messageIds.map(async (msg: any) => {
        const response = await gmail.users.messages.get({
          id: msg.id,
          format: 'full',
        });
        return response;
      })
    );

    return messages;
  }

  /**
   * Extract message body (HTML or plain text)
   */
  getMessageBody(message: any): { html: string; text: string } {
    const parts = message.payload?.parts || [message.payload];
    let html = '';
    let text = '';

    const findBody = (part: any) => {
      if (part.mimeType === 'text/html' && part.body?.data) {
        html = this.decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/plain' && part.body?.data) {
        text = this.decodeBase64(part.body.data);
      }

      if (part.parts) {
        part.parts.forEach(findBody);
      }
    };

    parts.forEach(findBody);

    return { html, text };
  }

  /**
   * Get header value from message
   */
  getHeader(message: any, headerName: string): string | undefined {
    const headers = message.payload?.headers || [];
    const header = headers.find((h: any) => h.name?.toLowerCase() === headerName.toLowerCase());
    return header?.value;
  }

  /**
   * Decode base64url string
   */
  private decodeBase64(data: string): string {
    try {
      // Convert base64url to base64
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      return atob(padded);
    } catch (error) {
      console.error('Failed to decode base64:', error);
      return '';
    }
  }

  /**
   * Format message date
   */
  formatMessageDate(internalDate: string): string {
    const date = new Date(parseInt(internalDate));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }
}

export const messageService = new MessageService();
