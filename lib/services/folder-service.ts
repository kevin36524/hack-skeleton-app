import { gmail } from './gmail-client';

class FolderService {
  async getLabels() {
    const response = await gmail.users.labels.list();
    return response.labels || [];
  }

  async getFolders() {
    const labels = await this.getLabels();

    // Filter out hidden labels and categories
    return labels.filter((label: any) =>
      label.labelListVisibility !== 'labelHide' &&
      !label.id?.startsWith('CATEGORY_')
    );
  }

  async getFoldersByType() {
    const folders = await this.getFolders();

    return {
      inbox: folders.find((f: any) => f.id === 'INBOX'),
      sent: folders.find((f: any) => f.id === 'SENT'),
      draft: folders.find((f: any) => f.id === 'DRAFT'),
      trash: folders.find((f: any) => f.id === 'TRASH'),
      starred: folders.find((f: any) => f.id === 'STARRED'),
      spam: folders.find((f: any) => f.id === 'SPAM'),
      userFolders: folders.filter((f: any) => f.type === 'user'),
    };
  }

  getFolderIcon(label: any): string {
    const iconMap: Record<string, string> = {
      'INBOX': '📥',
      'SENT': '📤',
      'DRAFT': '📝',
      'TRASH': '🗑️',
      'SPAM': '⚠️',
      'STARRED': '⭐',
      'IMPORTANT': '❗',
    };
    return iconMap[label.id || ''] || '📁';
  }
}

export const folderService = new FolderService();
