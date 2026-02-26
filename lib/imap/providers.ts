// ── Mail provider configurations ─────────────────────────────────────────────

export type MailProvider = 'gmail' | 'yahoo';

export interface ProviderConfig {
  name: string;
  host: string;
  port: number;
  labelToImap: Record<string, string>;
  imapToLabel: Record<string, string>;
  isSystemFolder: (path: string) => boolean;
}

function buildReverseMap(forward: Record<string, string>): Record<string, string> {
  const rev: Record<string, string> = {};
  for (const [label, path] of Object.entries(forward)) {
    if (!rev[path]) rev[path] = label;
  }
  return rev;
}

const GMAIL_LABEL_TO_IMAP: Record<string, string> = {
  INBOX: 'INBOX',
  SENT: '[Gmail]/Sent Mail',
  DRAFT: '[Gmail]/Drafts',
  DRAFTS: '[Gmail]/Drafts',
  TRASH: '[Gmail]/Trash',
  SPAM: '[Gmail]/Spam',
  STARRED: '[Gmail]/Starred',
  IMPORTANT: '[Gmail]/Important',
  ALL: '[Gmail]/All Mail',
  CATEGORY_PRIMARY: 'INBOX',
  CATEGORY_SOCIAL: '[Gmail]/Social',
  CATEGORY_PROMOTIONS: '[Gmail]/Promotions',
  CATEGORY_UPDATES: '[Gmail]/Updates',
  CATEGORY_FORUMS: '[Gmail]/Forums',
};

const YAHOO_LABEL_TO_IMAP: Record<string, string> = {
  INBOX: 'Inbox',
  SENT: 'Sent',
  DRAFT: 'Draft',
  DRAFTS: 'Draft',
  TRASH: 'Trash',
  SPAM: 'Bulk Mail',
  ARCHIVE: 'Archive',
  CATEGORY_PRIMARY: 'Inbox',
};

const GMAIL_SYSTEM_FOLDERS = new Set([
  'INBOX',
  '[Gmail]/Sent Mail',
  '[Gmail]/Drafts',
  '[Gmail]/Trash',
  '[Gmail]/Spam',
  '[Gmail]/Starred',
  '[Gmail]/Important',
  '[Gmail]/All Mail',
]);

// Include both 'Inbox' (Yahoo LIST response) and 'INBOX' (IMAP canonical uppercase)
const YAHOO_SYSTEM_FOLDERS = new Set(['INBOX', 'Inbox', 'Sent', 'Draft', 'Trash', 'Bulk Mail', 'Archive']);

export const PROVIDERS: Record<MailProvider, ProviderConfig> = {
  gmail: {
    name: 'Gmail',
    host: 'imap.gmail.com',
    port: 993,
    labelToImap: GMAIL_LABEL_TO_IMAP,
    imapToLabel: buildReverseMap(GMAIL_LABEL_TO_IMAP),
    isSystemFolder: (path) => GMAIL_SYSTEM_FOLDERS.has(path),
  },
  yahoo: {
    name: 'Yahoo Mail',
    host: 'imap.mail.yahoo.com',
    port: 993,
    labelToImap: YAHOO_LABEL_TO_IMAP,
    // Also map 'INBOX' (IMAP canonical uppercase) → 'INBOX' since Yahoo LIST may return it uppercase
    imapToLabel: { ...buildReverseMap(YAHOO_LABEL_TO_IMAP), INBOX: 'INBOX' },
    isSystemFolder: (path) => YAHOO_SYSTEM_FOLDERS.has(path),
  },
};

export function getProviderConfig(provider: string): ProviderConfig {
  return PROVIDERS[(provider as MailProvider)] ?? PROVIDERS.gmail;
}
