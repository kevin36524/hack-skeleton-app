/**
 * Slim types for Mastra agent context
 *
 * These types contain only the essential information the agent needs for triage,
 * reducing token usage compared to full API payloads.
 */

import type { Message, Folder } from '../../lib/types/api';

/**
 * Minimal message representation for agent context
 */
export interface SlimMessage {
  id: string;
  conversationId: string;
  subject: string;
  from: string; // "John Doe <john@example.com>" — single string
  to: string; // "jane@example.com" — single string
  date: string; // ISO 8601 human-readable
  snippet: string; // first ~100 chars of body
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  folderName: string;
}

/**
 * Minimal folder representation for agent context
 */
export interface SlimFolder {
  id: string;
  name: string;
  type: string; // "INBOX" | "SENT" | "DRAFT" | "TRASH" | etc.
  unreadCount: number;
}

/**
 * Convert full API Message → SlimMessage
 */
export function toSlimMessage(msg: Message): SlimMessage {
  // Format sender as "Name <email>" or just "email"
  const from = msg.headers.from?.[0]
    ? msg.headers.from[0].name
      ? `${msg.headers.from[0].name} <${msg.headers.from[0].email}>`
      : msg.headers.from[0].email
    : 'Unknown';

  // Format primary recipient
  const to = msg.headers.to?.[0]
    ? msg.headers.to[0].name
      ? `${msg.headers.to[0].name} <${msg.headers.to[0].email}>`
      : msg.headers.to[0].email
    : 'Unknown';

  // Parse date to ISO string
  const date = msg.headers.internalDate || new Date().toISOString();

  return {
    id: msg.id,
    conversationId: msg.conversationId,
    subject: msg.headers.subject || '(No subject)',
    from,
    to,
    date,
    snippet: msg.snippet || '',
    isRead: msg.flags.read ?? false,
    isStarred: msg.flags.flagged ?? false,
    hasAttachments: (msg.attachments?.length ?? 0) > 0,
    folderName: msg.folder.name,
  };
}

/**
 * Convert full API Folder → SlimFolder
 */
export function toSlimFolder(folder: Folder): SlimFolder {
  // Determine folder type from types array
  const type = folder.types?.[0] || 'FOLDER';

  return {
    id: folder.id,
    name: folder.name,
    type,
    unreadCount: folder.unread || 0,
  };
}
