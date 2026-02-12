/**
 * Gmail API Adapter
 *
 * This file contains functions to convert between Gmail API format
 * and the app's internal data structures.
 */

import { Message, Conversation, Folder, Mailbox } from '@/lib/types/api';

// Gmail API Types
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailMessagePart;
  internalDate: string;
  historyId: string;
  sizeEstimate: number;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers: GmailHeader[];
  body: GmailMessagePartBody;
  parts?: GmailMessagePart[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePartBody {
  attachmentId?: string;
  size: number;
  data?: string; // base64url encoded
}

export interface GmailThread {
  id: string;
  snippet: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility?: 'show' | 'hide';
  labelListVisibility?: 'labelShow' | 'labelHide' | 'labelShowIfUnread';
  type?: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
  threadsTotal?: number;
  threadsUnread?: number;
  color?: {
    textColor?: string;
    backgroundColor?: string;
  };
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

/**
 * Helper function to get header value from Gmail message
 */
export function getHeader(headers: GmailHeader[], name: string): string | undefined {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value;
}

/**
 * Helper function to extract email address from "Name <email>" format
 */
export function extractEmail(emailString: string): string {
  const match = emailString.match(/<(.+?)>/);
  return match ? match[1] : emailString;
}

/**
 * Helper function to extract name from "Name <email>" format
 */
export function extractName(emailString: string): string {
  const match = emailString.match(/^(.+?)\s*</);
  if (match) return match[1].replace(/"/g, '');
  return emailString;
}

/**
 * Convert Gmail message to app Message type
 */
export function gmailMessageToMessage(gmailMsg: GmailMessage): Message {
  const headers = gmailMsg.payload?.headers || [];

  const from = getHeader(headers, 'From') || '';
  const to = getHeader(headers, 'To') || '';
  const cc = getHeader(headers, 'Cc') || '';
  const subject = getHeader(headers, 'Subject') || '(no subject)';
  const internalDate = gmailMsg.internalDate;
  const primaryLabel = getPrimaryLabel(gmailMsg.labelIds || []);

  return {
    id: gmailMsg.id,
    conversationId: gmailMsg.threadId,
    snippet: gmailMsg.snippet,
    folder: {
      id: primaryLabel,
      name: primaryLabel,
      types: [primaryLabel],
      unread: gmailMsg.labelIds?.includes('UNREAD') ? 1 : 0,
      total: 1,
      acctId: 'primary',
      highestModSeq: 0,
    },
    flags: {
      read: !gmailMsg.labelIds?.includes('UNREAD'),
      flagged: gmailMsg.labelIds?.includes('STARRED') || false,
      ham: !gmailMsg.labelIds?.includes('SPAM'),
      recent: false,
    },
    headers: {
      subject,
      from: from ? [{
        name: extractName(from),
        email: extractEmail(from),
      }] : [],
      to: to ? to.split(',').map(addr => ({
        name: extractName(addr.trim()),
        email: extractEmail(addr.trim()),
      })) : [],
      ...(cc && {
        cc: cc.split(',').map(addr => ({
          name: extractName(addr.trim()),
          email: extractEmail(addr.trim()),
        }))
      }),
      internalDate,
      messageIdRfc822: getHeader(headers, 'Message-ID'),
    },
    decos: [],
    attachments: [],
    dedupId: 0,
    modSeq: 0,
  };
}

/**
 * Check if message has attachments
 */
function hasAttachments(payload: GmailMessagePart): boolean {
  if (payload.filename && payload.body.attachmentId) {
    return true;
  }
  if (payload.parts) {
    return payload.parts.some(part => hasAttachments(part));
  }
  return false;
}

/**
 * Get primary label/folder from label list
 */
function getPrimaryLabel(labelIds: string[]): string {
  const priorityLabels = ['INBOX', 'SENT', 'DRAFT', 'TRASH', 'SPAM'];
  for (const label of priorityLabels) {
    if (labelIds.includes(label)) return label;
  }
  return labelIds[0] || 'INBOX';
}

/**
 * Convert Gmail thread to app Conversation type
 */
export function gmailThreadToConversation(thread: GmailThread): Conversation {
  const messages = thread.messages.map(gmailMessageToMessage);

  // Get all unique folder IDs from messages in the thread
  const folderIds = Array.from(new Set(messages.map(m => m.folder.id)));

  return {
    id: thread.id,
    messageIds: thread.messages.map(m => m.id),
    folderIds,
  };
}

/**
 * Convert Gmail label to app Folder type
 */
export function gmailLabelToFolder(label: GmailLabel): Folder {
  return {
    id: label.id,
    name: label.name,
    types: [mapLabelToFolderType(label.id)],
    unread: label.messagesUnread || 0,
    total: label.messagesTotal || 0,
    size: 0,
    uidNext: 0,
    uidValidity: 0,
    acctId: '',
    highestModSeq: 0,
    link: {
      type: 'gmail',
      href: '',
    },
    bidi: [],
  };
}

/**
 * Map Gmail label ID to folder type
 */
function mapLabelToFolderType(labelId: string): string {
  const typeMap: Record<string, string> = {
    'INBOX': 'inbox',
    'SENT': 'sent',
    'DRAFT': 'draft',
    'TRASH': 'trash',
    'SPAM': 'spam',
    'STARRED': 'starred',
    'IMPORTANT': 'important',
    'CATEGORY_PERSONAL': 'personal',
    'CATEGORY_SOCIAL': 'social',
    'CATEGORY_PROMOTIONS': 'promotions',
    'CATEGORY_UPDATES': 'updates',
    'CATEGORY_FORUMS': 'forums',
  };
  return typeMap[labelId] || 'folder';
}

/**
 * Get folder icon/symbol
 */
function getFolderSymbol(labelId: string): string {
  const symbolMap: Record<string, string> = {
    'INBOX': '📥',
    'SENT': '📤',
    'DRAFT': '📝',
    'TRASH': '🗑️',
    'SPAM': '⚠️',
    'STARRED': '⭐',
    'IMPORTANT': '❗',
    'CATEGORY_PERSONAL': '👤',
    'CATEGORY_SOCIAL': '👥',
    'CATEGORY_PROMOTIONS': '🏷️',
    'CATEGORY_UPDATES': '🔔',
    'CATEGORY_FORUMS': '💬',
  };
  return symbolMap[labelId] || '📁';
}

/**
 * Convert Gmail profile to app Mailbox type
 */
export function gmailProfileToMailbox(profile: GmailProfile): Mailbox {
  return {
    id: 'primary',
    email: profile.emailAddress,
    isPrimary: true,
    isSelected: true,
    link: {
      type: 'gmail',
      href: '',
    },
    state: 'active',
    type: 'gmail',
  };
}

/**
 * Extract message body from Gmail message payload
 */
export function extractMessageBody(payload: GmailMessagePart): { html: string; plain: string } {
  let html = '';
  let plain = '';

  function traverse(part: GmailMessagePart) {
    if (part.mimeType === 'text/html' && part.body.data) {
      html = decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/plain' && part.body.data) {
      plain = decodeBase64Url(part.body.data);
    }

    if (part.parts) {
      part.parts.forEach(traverse);
    }
  }

  traverse(payload);

  return { html, plain };
}

/**
 * Decode base64url encoded string
 */
export function decodeBase64Url(data: string): string {
  // Convert base64url to base64
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');

  // Decode base64
  try {
    return atob(base64);
  } catch (error) {
    console.error('Failed to decode base64:', error);
    return '';
  }
}

/**
 * Encode string to base64url
 */
export function encodeBase64Url(data: string): string {
  // Encode to base64
  const base64 = btoa(data);

  // Convert to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Create RFC822 email format for sending
 */
export function createRFC822Email(
  to: string,
  subject: string,
  body: string,
  from?: string,
  cc?: string,
  bcc?: string
): string {
  const lines: string[] = [];

  if (from) lines.push(`From: ${from}`);
  lines.push(`To: ${to}`);
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push(`Subject: ${subject}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/html; charset=UTF-8');
  lines.push('');
  lines.push(body);

  return lines.join('\r\n');
}

/**
 * Convert app message to Gmail send format
 */
export function messageToGmailSendFormat(
  to: string,
  subject: string,
  body: string,
  from?: string
): { raw: string } {
  const email = createRFC822Email(to, subject, body, from);
  return {
    raw: encodeBase64Url(email),
  };
}
