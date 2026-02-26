import { ImapFlow } from 'imapflow';
import { type MailProvider, getProviderConfig } from './providers';

// Re-export for consumers that import from this file
export type { MailProvider };
export { getProviderConfig };

// ── Credentials ──────────────────────────────────────────────────────────────

/**
 * Decode the `Authorization: Bearer <base64(email:appPassword)>` header
 * that the frontend sends for every API request.
 */
export function getImapCredentials(authHeader: string): { email: string; password: string } {
  const raw = authHeader.replace(/^Bearer\s+/i, '').replace(/^Basic\s+/i, '').trim();
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf-8');
    const colonIdx = decoded.indexOf(':');
    if (colonIdx === -1) throw new Error('no colon');
    return { email: decoded.slice(0, colonIdx), password: decoded.slice(colonIdx + 1) };
  } catch {
    const e: any = new Error('Invalid authorization credentials. Expected base64(email:appPassword).');
    e.status = 401;
    throw e;
  }
}

// ── IMAP connection ───────────────────────────────────────────────────────────

export async function createImapClient(
  email: string,
  password: string,
  provider: MailProvider = 'gmail'
): Promise<ImapFlow> {
  const config = getProviderConfig(provider);
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
  });
  try {
    await client.connect();
    return client;
  } catch (error: any) {
    const msg = (error.message || '').toLowerCase();
    if (
      msg.includes('authentication') ||
      msg.includes('credentials') ||
      msg.includes('invalid') ||
      msg.includes('login')
    ) {
      const e: any = new Error('IMAP authentication failed. Check your email and app password.');
      e.status = 401;
      throw e;
    }
    throw error;
  }
}

export async function withImap<T>(
  email: string,
  password: string,
  fn: (client: ImapFlow) => Promise<T>,
  provider: MailProvider = 'gmail'
): Promise<T> {
  const client = await createImapClient(email, password, provider);
  try {
    return await fn(client);
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }
}

/** Read the mail provider from the X-Mail-Provider request header. */
export function getProviderFromHeader(request: { headers: { get(name: string): string | null } }): MailProvider {
  const h = request.headers.get('x-mail-provider');
  return (h === 'yahoo' ? 'yahoo' : 'gmail') as MailProvider;
}

// ── Folder mappings ───────────────────────────────────────────────────────────

// Kept for backward compatibility – prefer getProviderConfig(provider).labelToImap
export const GMAIL_LABEL_TO_IMAP = getProviderConfig('gmail').labelToImap;
export const IMAP_TO_GMAIL_LABEL = getProviderConfig('gmail').imapToLabel;

// ── Message ID encoding ───────────────────────────────────────────────────────

const SEP = '\x00';

export function encodeMessageId(folder: string, uid: number): string {
  return Buffer.from(`${folder}${SEP}${uid}`).toString('base64url');
}

export function decodeMessageId(id: string): { folder: string; uid: number } {
  try {
    const decoded = Buffer.from(id, 'base64url').toString('utf-8');
    const idx = decoded.indexOf(SEP);
    if (idx === -1) throw new Error('bad id');
    return { folder: decoded.slice(0, idx), uid: parseInt(decoded.slice(idx + 1), 10) };
  } catch {
    return { folder: 'INBOX', uid: 0 };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function imapFlagsToLabelIds(flags: Set<string>, folderLabel: string): string[] {
  const labels = [folderLabel];
  if (!flags.has('\\Seen')) labels.push('UNREAD');
  if (flags.has('\\Flagged')) labels.push('STARRED');
  if (flags.has('\\Draft')) labels.push('DRAFT');
  return labels;
}

export function formatAddress(
  addrs: { name?: string; address?: string }[] | null | undefined
): string {
  if (!addrs || addrs.length === 0) return '';
  return addrs
    .map((a) => (a.name && a.address ? `${a.name} <${a.address}>` : a.address || a.name || ''))
    .join(', ');
}

// ── Gmail query → IMAP search criteria ───────────────────────────────────────

export function gmailQueryToImapSearch(q: string): Record<string, any> {
  if (!q) return { all: true };

  const criteria: Record<string, any> = {};
  const textTerms: string[] = [];
  const tokens = q.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  for (const token of tokens) {
    if (token.startsWith('from:')) {
      criteria.from = token.slice(5).replace(/"/g, '');
    } else if (token.startsWith('to:')) {
      criteria.to = token.slice(3).replace(/"/g, '');
    } else if (token.startsWith('subject:')) {
      criteria.subject = token.slice(8).replace(/"/g, '');
    } else if (token === 'is:unread') {
      criteria.unseen = true;
    } else if (token === 'is:read') {
      criteria.seen = true;
    } else if (token === 'is:starred') {
      criteria.flagged = true;
    } else if (token.startsWith('newer_than:')) {
      const m = token.match(/newer_than:(\d+)([dmy])/i);
      if (m) {
        const d = new Date();
        const n = parseInt(m[1]);
        if (m[2] === 'd') d.setDate(d.getDate() - n);
        else if (m[2] === 'm') d.setMonth(d.getMonth() - n);
        else if (m[2] === 'y') d.setFullYear(d.getFullYear() - n);
        criteria.since = d;
      }
    } else if (token.startsWith('older_than:')) {
      const m = token.match(/older_than:(\d+)([dmy])/i);
      if (m) {
        const d = new Date();
        const n = parseInt(m[1]);
        if (m[2] === 'd') d.setDate(d.getDate() - n);
        else if (m[2] === 'm') d.setMonth(d.getMonth() - n);
        else if (m[2] === 'y') d.setFullYear(d.getFullYear() - n);
        criteria.before = d;
      }
    } else if (!token.includes(':') && !token.startsWith('-')) {
      textTerms.push(token.replace(/"/g, ''));
    }
  }

  if (textTerms.length > 0) criteria.text = textTerms.join(' ');
  return Object.keys(criteria).length > 0 ? criteria : { all: true };
}

// ── RFC822 email parser ───────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeBodyPart(body: string, encoding: string): string {
  const enc = encoding.toLowerCase().trim();
  if (enc === 'base64') {
    try {
      return Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf-8');
    } catch {
      return body;
    }
  }
  if (enc === 'quoted-printable') {
    return body
      .replace(/=\r\n/g, '')
      .replace(/=\n/g, '')
      .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return body;
}

function parseHeaders(section: string): Array<{ name: string; value: string }> {
  const headers: Array<{ name: string; value: string }> = [];
  let current = '';
  for (const line of section.split(/\r\n|\n/)) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && current) {
      current += ' ' + line.trim();
    } else {
      if (current) {
        const ci = current.indexOf(':');
        if (ci >= 0)
          headers.push({ name: current.slice(0, ci).trim(), value: current.slice(ci + 1).trim() });
      }
      current = line;
    }
  }
  if (current) {
    const ci = current.indexOf(':');
    if (ci >= 0)
      headers.push({ name: current.slice(0, ci).trim(), value: current.slice(ci + 1).trim() });
  }
  return headers;
}

export interface ParsedEmail {
  headers: Array<{ name: string; value: string }>;
  textBody: string;
  htmlBody: string;
  snippet: string;
  attachments: Array<{ filename: string; mimeType: string; size: number }>;
}

export function parseEmailSource(raw: string | Buffer): ParsedEmail {
  const rawStr = Buffer.isBuffer(raw) ? raw.toString('utf-8') : raw;

  // Split at the first blank line
  const splitIdx = rawStr.search(/\r\n\r\n|\n\n/);
  const headerSection = splitIdx >= 0 ? rawStr.slice(0, splitIdx) : rawStr;
  const bodyStr = splitIdx >= 0 ? rawStr.slice(splitIdx).replace(/^\r\n\r\n|\n\n/, '') : '';

  const headers = parseHeaders(headerSection);
  const getH = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const contentType = getH('content-type');
  let textBody = '';
  let htmlBody = '';
  const attachments: Array<{ filename: string; mimeType: string; size: number }> = [];

  if (contentType.toLowerCase().startsWith('multipart/')) {
    const bm = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/i);
    if (bm) {
      const boundary = bm[1] || bm[2];
      const delimiter = '--' + boundary;
      const parts = bodyStr.split(new RegExp(escapeRegex(delimiter) + '(?:--)?(?:\r\n|\n|$)'));

      for (const part of parts) {
        const ps = part.search(/\r\n\r\n|\n\n/);
        if (ps < 0) continue;
        const ph = part.slice(0, ps);
        const pb = part.slice(ps).replace(/^\r\n\r\n|\n\n/, '').trimEnd();
        const pHeaders = parseHeaders(ph);
        const getPH = (n: string) =>
          pHeaders.find((h) => h.name.toLowerCase() === n.toLowerCase())?.value || '';
        const pCt = getPH('content-type').split(';')[0].trim().toLowerCase();
        const pEnc = getPH('content-transfer-encoding');
        const pDisp = getPH('content-disposition');
        const pFilename = pDisp.match(/filename=(?:"([^"]+)"|([^\s;]+))/i)?.[1] || '';

        if (pCt === 'text/plain' && !textBody) {
          textBody = decodeBodyPart(pb, pEnc);
        } else if (pCt === 'text/html' && !htmlBody) {
          htmlBody = decodeBodyPart(pb, pEnc);
        } else if (pFilename) {
          attachments.push({ filename: pFilename, mimeType: pCt, size: pb.length });
        }
      }
    }
  } else if (contentType.toLowerCase().startsWith('text/html')) {
    htmlBody = decodeBodyPart(bodyStr, getH('content-transfer-encoding'));
  } else {
    textBody = decodeBodyPart(bodyStr, getH('content-transfer-encoding'));
  }

  const snippet = (textBody || htmlBody.replace(/<[^>]+>/g, ''))
    .slice(0, 200)
    .replace(/\s+/g, ' ')
    .trim();

  return { headers, textBody, htmlBody, snippet, attachments };
}

// ── IMAP message → Gmail API format ──────────────────────────────────────────

export function buildGmailMetadata(
  uid: number,
  envelope: any,
  flags: Set<string>,
  internalDate: Date | undefined,
  folderPath: string,
  folderLabel: string,
  snippet = ''
) {
  const msgId = encodeMessageId(folderPath, uid);
  const labelIds = imapFlagsToLabelIds(flags ?? new Set(), folderLabel);

  const headers: Array<{ name: string; value: string }> = [];
  if (envelope?.from?.length) headers.push({ name: 'From', value: formatAddress(envelope.from) });
  if (envelope?.to?.length) headers.push({ name: 'To', value: formatAddress(envelope.to) });
  if (envelope?.cc?.length) headers.push({ name: 'Cc', value: formatAddress(envelope.cc) });
  if (envelope?.subject) headers.push({ name: 'Subject', value: envelope.subject });
  if (envelope?.date) headers.push({ name: 'Date', value: envelope.date.toUTCString() });
  if (envelope?.messageId) headers.push({ name: 'Message-ID', value: envelope.messageId });

  return {
    id: msgId,
    threadId: msgId,
    labelIds,
    snippet,
    internalDate: internalDate ? internalDate.getTime().toString() : Date.now().toString(),
    payload: {
      headers,
      mimeType: 'text/plain',
      body: { size: 0 },
    },
  };
}

export function buildGmailFull(
  uid: number,
  envelope: any,
  flags: Set<string>,
  internalDate: Date | undefined,
  folderPath: string,
  folderLabel: string,
  parsed: ParsedEmail
) {
  const base = buildGmailMetadata(uid, envelope, flags, internalDate, folderPath, folderLabel, parsed.snippet);

  // Merge parsed headers (may include extra headers not in envelope)
  const envelopeHeaderNames = new Set(base.payload.headers.map((h) => h.name.toLowerCase()));
  for (const h of parsed.headers) {
    if (!envelopeHeaderNames.has(h.name.toLowerCase())) {
      base.payload.headers.push(h);
    }
  }

  const parts: any[] = [];
  if (parsed.textBody) {
    parts.push({
      mimeType: 'text/plain',
      body: { data: Buffer.from(parsed.textBody).toString('base64url'), size: parsed.textBody.length },
    });
  }
  if (parsed.htmlBody) {
    parts.push({
      mimeType: 'text/html',
      body: { data: Buffer.from(parsed.htmlBody).toString('base64url'), size: parsed.htmlBody.length },
    });
  }
  for (const att of parsed.attachments) {
    parts.push({
      mimeType: att.mimeType,
      filename: att.filename,
      body: { size: att.size },
    });
  }

  return {
    ...base,
    payload: {
      ...base.payload,
      mimeType: parts.length > 1 ? 'multipart/mixed' : (parts[0]?.mimeType ?? 'text/plain'),
      parts: parts.length > 0 ? parts : undefined,
      body: parts.length === 1 ? parts[0].body : { size: 0 },
    },
  };
}
