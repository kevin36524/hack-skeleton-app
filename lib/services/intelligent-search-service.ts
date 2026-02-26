import { mastra } from '@/src/mastra';
import {
  withImap,
  buildGmailMetadata,
  gmailQueryToImapSearch,
} from '@/lib/imap/client';
import { type MailProvider, getProviderConfig } from '@/lib/imap/providers';

/**
 * Intelligent Search Service
 *
 * Uses the Gmail Search Agent to convert natural language queries into IMAP
 * search criteria and then executes the search using imapflow.
 *
 * All functions are stateless — credentials are passed per-call.
 * No module-level or instance-level state is kept between requests.
 */

export interface IntelligentSearchResult {
  query: string;
  labelIds: string[];
  explanation: string;
  detectedParams: {
    from?: string;
    to?: string;
    subject?: string;
    folder?: string;
    hasAttachment?: boolean;
    isUnread?: boolean;
    isStarred?: boolean;
    dateRange?: string;
    keywords?: string[];
  };
  messages: any[];
}

async function executeSearch(
  query: string,
  labelIds: string[],
  maxResults: number,
  email: string,
  password: string,
  provider: MailProvider = 'gmail'
): Promise<any[]> {
  const { labelToImap, imapToLabel } = getProviderConfig(provider);
  const labelId = labelIds[0] || 'INBOX';
  const folderPath = labelToImap[labelId] ?? labelToImap['INBOX'] ?? 'INBOX';
  const folderLabel = imapToLabel[folderPath] ?? labelId;
  const criteria = gmailQueryToImapSearch(query);

  return withImap(email, password, async (client) => {
    const lock = await client.getMailboxLock(folderPath, { readonly: true });
    try {
      const uids = (await client.search(criteria, { uid: true })) as number[];
      const recentUids = uids.slice(-maxResults).reverse();
      if (recentUids.length === 0) return [];

      const messages: any[] = [];
      for await (const msg of client.fetch(
        recentUids,
        { uid: true, envelope: true, flags: true, internalDate: true },
        { uid: true }
      )) {
        messages.push(
          buildGmailMetadata(msg.uid, msg.envelope, msg.flags, msg.internalDate, folderPath, folderLabel)
        );
      }
      return messages;
    } finally {
      lock.release();
    }
  }, provider);
}

function extractQueryFromText(text: string): string {
  const queryMatch = text.match(/query[:\s]+([^\n]+)/i);
  if (queryMatch) return queryMatch[1].trim();

  const operators = [
    'from:', 'to:', 'subject:', 'in:', 'is:', 'has:', 'filename:',
    'after:', 'before:', 'newer_than:', 'older_than:',
  ];
  for (const op of operators) {
    if (text.includes(op)) {
      const opMatch = text.match(new RegExp(`(?:^|[\\s"'])(${op}[^\\s"'\n]+)`, 'i'));
      if (opMatch) return opMatch[1].trim();
    }
  }

  return text.trim().substring(0, 200);
}

export async function search(
  naturalLanguageQuery: string,
  maxResults: number = 30,
  email: string,
  password: string,
  provider: MailProvider = 'gmail'
): Promise<IntelligentSearchResult> {
  console.log('[INTELLIGENT SEARCH] Processing query:', naturalLanguageQuery);

  const agent = mastra.getAgent('gmailSearchAgent');

  const agentResponse = await agent.generate(
    `Convert this natural language search request into a Gmail API query string.

User request: "${naturalLanguageQuery}"

Return ONLY a JSON object with this exact structure:
{
  "query": "the Gmail query string",
  "labelIds": ["INBOX"],
  "explanation": "explanation of the query construction",
  "detectedParams": {
    "from": "sender if detected",
    "to": "recipient if detected",
    "subject": "subject keywords if detected",
    "folder": "folder name if detected",
    "hasAttachment": true/false,
    "isUnread": true/false,
    "isStarred": true/false,
    "dateRange": "date range if detected",
    "keywords": ["other", "keywords"]
  }
}

Return ONLY the JSON object, no markdown, no code blocks.`,
    {
      memory: {
        resource: 'intelligent-search',
        thread: 'search-session',
      },
    }
  );

  let searchConfig: {
    query: string;
    labelIds?: string[];
    explanation?: string;
    detectedParams?: any;
  };

  try {
    const responseText = agentResponse.text || agentResponse.toString();
    const jsonMatch =
      responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/```\s*([\s\S]*?)\s*```/) ||
      [null, responseText];
    const jsonStr = jsonMatch[1] || responseText;
    searchConfig = JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error('[INTELLIGENT SEARCH] Failed to parse agent response:', error);
    const fallbackQuery = extractQueryFromText(
      agentResponse.text || agentResponse.toString()
    );
    searchConfig = {
      query: fallbackQuery,
      labelIds: [],
      explanation: 'Fallback extraction from agent response',
      detectedParams: {},
    };
  }

  console.log('[INTELLIGENT SEARCH] Generated query:', searchConfig.query);

  const messages = await executeSearch(
    searchConfig.query,
    searchConfig.labelIds || [],
    maxResults,
    email,
    password,
    provider
  );

  return {
    query: searchConfig.query,
    labelIds: searchConfig.labelIds || [],
    explanation: searchConfig.explanation || 'Query generated by Gmail Search Agent',
    detectedParams: searchConfig.detectedParams || {},
    messages,
  };
}

export async function quickSearch(
  naturalLanguageQuery: string,
  maxResults: number = 30,
  email: string,
  password: string,
  provider: MailProvider = 'gmail'
): Promise<IntelligentSearchResult> {
  console.log('[INTELLIGENT SEARCH] Quick search for:', naturalLanguageQuery);

  const detectedParams: IntelligentSearchResult['detectedParams'] = {};
  const queryParts: string[] = [];
  const labelIds: string[] = [];

  const query = naturalLanguageQuery.toLowerCase();

  const fromMatch = query.match(/from\s+([\w.@]+)|emails?\s+(?:from|by)\s+([\w.@]+)/i);
  if (fromMatch) {
    const sender = fromMatch[1] || fromMatch[2];
    detectedParams.from = sender;
    queryParts.push(`from:${sender}`);
  }

  const toMatch = query.match(/to\s+([\w.@]+)|sent\s+to\s+([\w.@]+)/i);
  if (toMatch) {
    const recipient = toMatch[1] || toMatch[2];
    detectedParams.to = recipient;
    queryParts.push(`to:${recipient}`);
  }

  const subjectMatch = query.match(
    /(?:about|subject|regarding)\s+["']?([^"']+?)["']?(?:\s+(?:from|in|with|has|is)\s+|\s*$)/i
  );
  if (subjectMatch) {
    const subject = subjectMatch[1].trim();
    detectedParams.subject = subject;
    queryParts.push(`subject:${subject}`);
  }

  const folderMatch = query.match(
    /in\s+(?:my\s+)?(?:primary\s+)?(inbox|sent|drafts?|spam|trash|important|starred|archive)/i
  );
  if (folderMatch) {
    const folder = folderMatch[1].toLowerCase();
    detectedParams.folder = folder;
    if (folder === 'inbox') {
      queryParts.push('in:inbox');
      labelIds.push('INBOX');
    } else if (folder === 'sent') {
      queryParts.push('in:sent');
    } else if (folder === 'draft' || folder === 'drafts') {
      queryParts.push('in:draft');
    } else if (folder === 'spam') {
      queryParts.push('in:spam');
    } else if (folder === 'trash') {
      queryParts.push('in:trash');
    } else if (folder === 'important') {
      queryParts.push('in:important');
      labelIds.push('IMPORTANT');
    } else if (folder === 'starred') {
      queryParts.push('is:starred');
      detectedParams.isStarred = true;
    }
  }

  if (query.includes('unread')) {
    queryParts.push('is:unread');
    detectedParams.isUnread = true;
  }

  if (query.includes('starred') || query.includes('favorite')) {
    queryParts.push('is:starred');
    detectedParams.isStarred = true;
  }

  const attachmentMatch = query.match(/(?:with|has|have)\s+(?:an?\s+)?attachment|attached/i);
  if (attachmentMatch) {
    queryParts.push('has:attachment');
    detectedParams.hasAttachment = true;
  }

  const lastWeekMatch = query.match(/last\s+week/i);
  if (lastWeekMatch) {
    queryParts.push('newer_than:7d');
    detectedParams.dateRange = 'last 7 days';
  }
  const lastMonthMatch = query.match(/last\s+month/i);
  if (lastMonthMatch) {
    queryParts.push('newer_than:30d');
    detectedParams.dateRange = 'last 30 days';
  }

  const keywords: string[] = [];
  const stopWords = [
    'emails', 'email', 'from', 'to', 'in', 'my', 'with', 'has', 'have', 'is', 'are',
    'the', 'a', 'an', 'about', 'show', 'me', 'search', 'find', 'get', 'all', 'any',
  ];
  for (const word of query.split(/\s+/)) {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (
      cleanWord.length > 2 &&
      !stopWords.includes(cleanWord) &&
      !queryParts.some((p) => p.includes(cleanWord))
    ) {
      keywords.push(cleanWord);
    }
  }
  if (keywords.length > 0) {
    detectedParams.keywords = keywords;
    const uniqueKw = keywords.filter(
      (kw) => !queryParts.some((p) => p.toLowerCase().includes(kw.toLowerCase()))
    );
    if (uniqueKw.length > 0) queryParts.push(uniqueKw.join(' '));
  }

  const finalQuery = queryParts.join(' ') || naturalLanguageQuery;

  const messages = await executeSearch(finalQuery, labelIds, maxResults, email, password, provider);

  return {
    query: finalQuery,
    labelIds,
    explanation: `Rule-based query: ${finalQuery}`,
    detectedParams,
    messages,
  };
}
