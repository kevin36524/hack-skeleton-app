import {
  ApiResponse,
  ListConversationsApiResponse,
  SearchMessagesApiResponse,
  SaveMessageRequest,
  SaveMessageResponse,
  UpdateMessageRequest,
  UpdateMessageResponse,
  DeleteMessageResponse,
  Message,
  Conversation,
  TriageRequest,
  TriageResponse,
  MoveMessagesRequest,
  MoveMessagesResponse,
  FullMessageBodyResponse
} from '@/lib/types/api';
import { apiClient } from './api-client';

class MessageService {
  async getMessages(
    mailboxId: string,
    folderId: string,
    offset = 0,
    count = 30,
    decoId?: string
  ): Promise<ListConversationsApiResponse> {
    try {
      let query = `folderId:${folderId}+groupBy:conversationId+offset:${offset}+count:${count}`;
      if (decoId) {
        query += `+decoId:${decoId}`;
      }

      const response = await apiClient.get<ApiResponse<ListConversationsApiResponse>>(
        `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios`
      );
      return response.result;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  async getConversations(mailboxId: string, folderId: string): Promise<{
    messages: Message[];
    conversations: Conversation[];
  }> {
    try {
      const data = await this.getMessages(mailboxId, folderId);

      return {
        messages: data.messages,
        conversations: data.conversations
      };
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
  }

  async getConversationsForFolder(mailboxId: string, folderId: string): Promise<{
    messages: Message[];
    conversations: Conversation[];
  }> {
    return this.getConversations(mailboxId, folderId);
  }

  async getMessagesBySearch(
    mailboxId: string,
    query: string,
    offset = 0,
    count = 30
  ): Promise<SearchMessagesApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse<SearchMessagesApiResponse>>(
        `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}+offset:${offset}+count:${count}`
      );
      return response.result;
    } catch (error) {
      console.error('Failed to search messages:', error);
      throw error;
    }
  }

  async getMessagesByConversation(
    mailboxId: string,
    folderId: string,
    conversationId: string
  ): Promise<Message[]> {
    try {
      const data = await this.getMessages(mailboxId, folderId);

      const conversation = data.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return [];
      }

      return data.messages.filter(message =>
        conversation.messageIds.includes(message.id)
      );
    } catch (error) {
      console.error('Failed to fetch messages by conversation:', error);
      throw error;
    }
  }

  async markAsRead(
    mailboxId: string,
    messageIds: string[],
    read = true
  ): Promise<TriageResponse> {
    try {
      const request: TriageRequest = {
        batch: messageIds.map((id, index) => ({
          id: `mark-read-${index}`,
          method: 'PUT',
          uri: `/mailboxes/@.id==${mailboxId}/messages/@.id==${id}`,
          entity: {
            message: {
              id,
              flags: {
                read: read ? 1 : 0
              }
            }
          }
        }))
      };

      const response = await apiClient.post<ApiResponse<TriageResponse>>(
        '/batch',
        request
      );
      return response.result;
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw error;
    }
  }

  async toggleStar(
    mailboxId: string,
    messageIds: string[],
    starred = true
  ): Promise<TriageResponse> {
    try {
      const request: TriageRequest = {
        batch: messageIds.map((id, index) => ({
          id: `toggle-star-${index}`,
          method: 'PUT',
          uri: `/mailboxes/@.id==${mailboxId}/messages/@.id==${id}`,
          entity: {
            message: {
              id,
              flags: {
                flagged: starred ? 1 : 0
              }
            }
          }
        }))
      };

      const response = await apiClient.post<ApiResponse<TriageResponse>>(
        '/batch',
        request
      );
      return response.result;
    } catch (error) {
      console.error('Failed to toggle star on messages:', error);
      throw error;
    }
  }

  async moveMessages(
    mailboxId: string,
    messageIds: string[],
    targetFolderId: string
  ): Promise<MoveMessagesResponse> {
    try {
      const request: MoveMessagesRequest = {
        responseType: "json",
        requests: messageIds.map((id, index) => ({
          id: `UnifiedUpdateMessage_${index}`,
          exportResponse: false,
          uri: `/ws/v3/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=id%3A(${id})`,
          method: "POST",
          requests: [],
          filters: {},
          payload: {
            message: {
              folder: {
                id: targetFolderId
              }
            }
          },
          suppressResponse: false
        }))
      };

      const response = await apiClient.post<ApiResponse<MoveMessagesResponse>>(
        '/batch',
        request
      );
      return response.result;
    } catch (error) {
      console.error('Failed to move messages:', error);
      throw error;
    }
  }

  async saveMessage(
    mailboxId: string,
    folderId: string,
    options: {
      html?: string;
      text?: string;
      subject?: string;
      from?: { email: string; name?: string };
      csid?: string;
      to?: Array<{ email: string; name?: string }>;
      schemaOrgPayload?: any;
      flags?: {
        spam?: string;
        read?: string;
      };
      actions?: {
        responseMessage?: boolean;
        applyAntispam?: boolean;
        applySaveFromAddressCheck?: boolean;
        generateCardConversationId?: boolean;
      };
    } = {}
  ): Promise<SaveMessageResponse> {
    try {
      const request: SaveMessageRequest = {
        message: {
          newMessage: true,
          folder: {
            id: folderId
          },
          csid: options.csid,
          flags: {
            spam: options.flags?.spam || "false",
            read: options.flags?.read || "true"
          },
          headers: {
            from: options.from ? [options.from] : [{ email: "spaces@iosmail.yahoo.com" }],
            ...(options.to && { to: options.to }),
            ...(options.subject && { subject: options.subject })
          },
          decos: [],
          schemaOrg: options.schemaOrgPayload ? [
            {
              schema: options.schemaOrgPayload
            }
          ] : [],
          attachments: []
        },
        actions: {
          responseMessage: options.actions?.responseMessage ?? true,
          applyAntispam: options.actions?.applyAntispam ?? false,
          applySaveFromAddressCheck: options.actions?.applySaveFromAddressCheck ?? false,
          generateCardConversationId: options.actions?.generateCardConversationId ?? true
        },
        simpleBody: {
          text: ""
        }
      };

      const response = await apiClient.post<ApiResponse<SaveMessageResponse>>(
        `/mailboxes/@.id==${mailboxId}/messages`,
        request
      );
      return response.result;
    } catch (error) {
      console.error('Failed to save message:', error);
      throw error;
    }
  }

  async updateMessage(
    mailboxId: string,
    messageId: string,
    updates: {
      folderId?: string;
      html?: string;
      text?: string;
      subject?: string;
      from?: { email: string; name?: string };
      to?: Array<{ email: string; name?: string }>;
      schemaOrgPayload?: any;
      flags?: {
        spam?: string;
        read?: string;
        flagged?: string;
      };
    } = {}
  ): Promise<UpdateMessageResponse> {
    try {
      const request: UpdateMessageRequest = {
        message: {
          ...(updates.folderId && {
            folder: { id: updates.folderId }
          }),
          ...(updates.schemaOrgPayload && {
            schemaOrg: [
              {
                schema: updates.schemaOrgPayload
              }
            ]
          }),
          ...(updates.html || updates.text) && {
            body: {
              ...(updates.html && { html: updates.html }),
              ...(updates.text && { text: updates.text })
            }
          }
        }
      };
      console.log('[MESSAGE SERVICE] updateMessage request payload:', JSON.stringify(request, null, 2));

      const encodedMessageId = encodeURIComponent(`id:(${messageId})`);
      await apiClient.post(
        `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${encodedMessageId}&appid=YMailNorrin`,
        request
      );

      // Return 204 status as specified
      return { status: 204 };
    } catch (error) {
      console.error('Failed to update message:', error);
      throw error;
    }
  }

  async deleteMessage(
    mailboxId: string,
    messageId: string
  ): Promise<DeleteMessageResponse> {
    try {
      const encodedMessageId = encodeURIComponent(`id:(${messageId})`);
      await apiClient.delete(
        `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${encodedMessageId}&appid=YMailNorrin`
      );

      // Return 204 status as specified
      return { status: 204 };
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  async getFullMessageBody(
    mailboxId: string,
    messageId: string
  ): Promise<FullMessageBodyResponse> {
    try {
      const response = await apiClient.get<ApiResponse<FullMessageBodyResponse>>(
        `/mailboxes/@.id==${mailboxId}/messages/@.id==${messageId}/content/simplebody/full`
      );
      return response.result;
    } catch (error) {
      console.error('Failed to fetch full message body:', error);
      throw error;
    }
  }

  formatMessageDate(internalDate: string): string {
    const date = new Date(parseInt(internalDate) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // This week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      // Older
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  getMessageParticipants(message: Message): string {
    if (message.headers.from.length > 0) {
      const from = message.headers.from[0];
      return from.name || from.email;
    }
    return 'Unknown Sender';
  }

  isMessageRead(message: Message): boolean {
    return message.flags.read === true;
  }

  isMessageStarred(message: Message): boolean {
    return message.flags.flagged === true;
  }
}

export const messageService = new MessageService();
