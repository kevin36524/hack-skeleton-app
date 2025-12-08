import {
  ApiResponse,
  GetFoldersApiResponse,
  Folder
} from '@/lib/types/api';
import { apiClient } from './api-client';

class FolderService {
  async getFolders(mailboxId: string): Promise<GetFoldersApiResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetFoldersApiResponse>>(
        `/mailboxes/@.id==${mailboxId}/folders`
      );
      return response.result;
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      throw error;
    }
  }

  async getFoldersByType(mailboxId: string, accountId: string): Promise<{
    inbox: Folder | undefined;
    sent: Folder | undefined;
    draft: Folder | undefined;
    trash: Folder | undefined;
    archive: Folder | undefined;
    userCard: Folder | undefined;
    userFolders: Folder[];
  }> {
    try {
      const foldersData = await this.getFolders(mailboxId);

      const inbox = foldersData.folders.find(folder =>
        folder.types.includes('INBOX') && folder.acctId === accountId
      );

      const sent = foldersData.folders.find(folder =>
        folder.types.includes('SENT') && folder.acctId === accountId
      );

      const draft = foldersData.folders.find(folder =>
        folder.types.includes('DRAFT') && folder.acctId === accountId
      );

      const trash = foldersData.folders.find(folder =>
        folder.types.includes('TRASH') && folder.acctId === accountId
      );

      const archive = foldersData.folders.find(folder =>
        folder.types.includes('ARCHIVE') && folder.acctId === accountId
      );

      const userCard = foldersData.folders.find(folder =>
        folder.types.includes('USER') && folder.types.includes('CARD') && folder.acctId === accountId
      );

      const userFolders = foldersData.folders.filter(folder =>
        folder.types.includes('USER') && !folder.types.includes('INVISIBLE') && folder.acctId === accountId
      );

      return {
        inbox,
        sent,
        draft,
        trash,
        archive,
        userCard,
        userFolders
      };
    } catch (error) {
      console.error('Failed to organize folders by type:', error);
      throw error;
    }
  }

  async getFolderById(mailboxId: string, folderId: string): Promise<Folder | undefined> {
    try {
      const foldersData = await this.getFolders(mailboxId);
      return foldersData.folders.find(folder => folder.id === folderId);
    } catch (error) {
      console.error('Failed to get folder by ID:', error);
      throw error;
    }
  }

  async getUserCardFolder(mailboxId: string, accountId: string): Promise<Folder | undefined> {
    try {
      const foldersData = await this.getFolders(mailboxId);
      return foldersData.folders.find(folder =>
        folder.types.includes('USER') && folder.types.includes('CARD') && folder.acctId === accountId
      );
    } catch (error) {
      console.error('Failed to get user card folder:', error);
      throw error;
    }
  }

  getFolderIcon(folder: Folder): string {
    if (folder.types.includes('INBOX')) return '📥';
    if (folder.types.includes('SENT')) return '📤';
    if (folder.types.includes('DRAFT')) return '📝';
    if (folder.types.includes('TRASH')) return '🗑️';
    if (folder.types.includes('JUNK')) return '🚫';
    return '📁';
  }
}

export const folderService = new FolderService();
