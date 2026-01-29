/**
 * Server-side utilities for processing spaces
 * These functions are called directly without HTTP overhead
 */

import { Space } from '@/lib/types/api';
import { mastra } from '@/src/mastra';
import { embeddingProvider } from '@/lib/utils/embedding-provider';

const YAHOO_API_BASE = 'https://apis.mail.yahoo.com/ws/v3';
const APP_ID = 'YahooMailIosMobile';

// Helper function to calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper function to find top-k similar vectors
function findTopK(queryVector: number[], vectors: number[][], k: number): number[] {
  const similarities = vectors.map((vec, idx) => ({
    idx,
    similarity: cosineSimilarity(queryVector, vec)
  }));

  // Sort by similarity (descending) and take top k
  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, k).map(s => s.idx);
}

/**
 * Generates allowlisted phrases for a space using Mastra AI agent
 */
export async function generateAllowlistedPhrases(
  space: Space,
  guid: string,
  accountId: string
): Promise<string[]> {
  console.log('[SPACES-PROCESSING] Generating allowlisted phrases for space:', space.name);

  const phraseGeneratorAgent = mastra.getAgent('phraseGenerator');

  // Prepare space context for the agent
  const spaceContext = {
    name: space.name,
    justification: space.justification,
    keywords: space.keywords,
    emailSenders: space.emailSenders.map(s => ({
      name: s.name,
      email: s.email,
    })),
  };

  const agentPrompt = `Generate email search phrases for this space:

${JSON.stringify(spaceContext, null, 2)}`;

  const agentResponse = await phraseGeneratorAgent.generate(agentPrompt);

  let responseText = agentResponse.text || '{}';

  // Strip markdown code blocks if present
  responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  let parsedResponse;

  try {
    parsedResponse = JSON.parse(responseText);
  } catch (error) {
    console.error('[SPACES-PROCESSING] Failed to parse agent response:', responseText);
    throw new Error('Failed to parse AI response');
  }

  // Extract phrases from response
  const phrases: string[] = parsedResponse.phrases || [];

  if (!Array.isArray(phrases) || phrases.length === 0) {
    throw new Error('No phrases generated');
  }

  console.log('[SPACES-PROCESSING] Generated', phrases.length, 'phrases');
  return phrases;
}

/**
 * Finds semantically similar emails for a space using embeddings
 */
export async function findSimilarEmails(
  space: Space,
  mailboxId: string,
  accountId: string,
  authHeader: string
): Promise<{
  filteredMessageIds: string[];
  allowlistedMessageIds: string[];
  blocklistedMessageIds: string[];
}> {
  console.log('[SPACES-PROCESSING] Finding similar emails for space:', space.name);

  // Check if phrases exist
  const allowlistedPhrases = space.extraData?.allowlistedPhrases || [];
  if (allowlistedPhrases.length === 0) {
    throw new Error('No allowlisted phrases found');
  }

  console.log('[SPACES-PROCESSING] Allowlisted phrases:', allowlistedPhrases.length);
  console.log('[SPACES-PROCESSING] Blocklisted phrases:', space.extraData?.blocklistedPhrases?.length || 0);

  // Step 1: Fetch messages for the space
  console.log('[SPACES-PROCESSING] Step 1: Fetching messages...');

  // Extract parameters from space
  const fromEmails = space.emailSenders?.map(s => s.email) || [];
  const keywords = space.keywords || [];
  const includeKeywords = space.extraData?.includeKeywords !== false;
  const count = space.extraData?.messageCount || 50;

  // Build query
  const fromEmailQuery = fromEmails.length > 0
    ? `fromEmail:(${fromEmails.map(email => encodeURIComponent(email)).join('%20OR%20')})`
    : '';

  const keywordQuery = includeKeywords && keywords.length > 0
    ? `keyword:(${keywords.map(kw => encodeURIComponent(kw)).join('%20OR%20')})`
    : '';

  let query = `acctId:(${accountId})+offset:0+count:${count}`;

  if (fromEmailQuery && keywordQuery) {
    query += `+${fromEmailQuery}+AND+${keywordQuery}`;
  } else if (fromEmailQuery) {
    query += `+${fromEmailQuery}`;
  } else if (keywordQuery) {
    query += `+${keywordQuery}`;
  }

  // Add folder type filters
  query += '+-foldertype:BULK+-foldertype:TRASH+-foldertype:DRAFT+-foldertype:ARCHIVE+-foldertype:EXTERNAL_ALL';

  const messagesUrl = `${YAHOO_API_BASE}/mailboxes/${mailboxId}/messages/@.select==q?q=${query}&responseTransform=btd_lm_ios&appid=${APP_ID}`;

  console.log('[SPACES-PROCESSING] Fetching from:', messagesUrl);

  const messagesResponse = await fetch(messagesUrl, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!messagesResponse.ok) {
    const errorText = await messagesResponse.text();
    console.error('[SPACES-PROCESSING] Failed to fetch messages:', errorText);
    throw new Error(`Failed to fetch messages: ${errorText}`);
  }

  const messagesData = await messagesResponse.json();
  const messages = messagesData.result?.messages || [];

  console.log('[SPACES-PROCESSING] Fetched', messages.length, 'messages');

  if (messages.length === 0) {
    return {
      filteredMessageIds: [],
      allowlistedMessageIds: [],
      blocklistedMessageIds: []
    };
  }

  // Step 2: Prepare texts and message IDs for embedding
  console.log('[SPACES-PROCESSING] Step 2: Preparing texts...');

  const texts: string[] = [];
  const messageIds: string[] = [];

  messages.forEach((msg: any) => {
    const subject = msg.headers?.subject || '';
    const snippet = msg.snippet || '';
    texts.push(`${subject} ${snippet}`.trim());
    messageIds.push(msg.id);
  });

  // Step 3: Generate embeddings IN MEMORY
  console.log('[SPACES-PROCESSING] Step 3: Generating embeddings in memory...');

  const embeddingResult = await embeddingProvider.generateEmbeddings(texts);
  const allEmbeddings = embeddingResult.embeddings;

  console.log('[SPACES-PROCESSING] Generated', allEmbeddings.length, 'embeddings');
  console.log('[SPACES-PROCESSING] Model:', embeddingResult.model);

  // Step 4: Generate embeddings for allowlisted phrases
  console.log('[SPACES-PROCESSING] Step 4: Generating phrase embeddings...');

  const allowEmbeddingResult = await embeddingProvider.generateEmbeddings(allowlistedPhrases);
  const allowPhraseVectors = allowEmbeddingResult.embeddings;

  console.log('[SPACES-PROCESSING] Generated', allowPhraseVectors.length, 'allowlist phrase embeddings');

  // Step 5: Search for similar messages using allowlisted phrases
  console.log('[SPACES-PROCESSING] Step 5: Finding similar messages...');

  const k = 10; // Top 10 matches per phrase
  const allowlistedMessageIds = new Set<string>();

  for (let i = 0; i < allowPhraseVectors.length; i++) {
    const queryVector = allowPhraseVectors[i];

    // Find top-k similar vectors
    const topIndices = findTopK(queryVector, allEmbeddings, k);

    // Add matching message IDs
    for (const idx of topIndices) {
      if (idx >= 0 && idx < messageIds.length) {
        allowlistedMessageIds.add(messageIds[idx]);
      }
    }
  }

  console.log('[SPACES-PROCESSING] Found', allowlistedMessageIds.size, 'allowlisted messages');

  // Step 6: Handle blocklisted phrases (if any)
  const blocklistedPhrases = space.extraData?.blocklistedPhrases || [];
  const blocklistedMessageIdsSet = new Set<string>();
  let finalMessageIds = Array.from(allowlistedMessageIds);

  if (blocklistedPhrases.length > 0) {
    console.log('[SPACES-PROCESSING] Step 6: Processing blocklisted phrases...');

    const blockEmbeddingResult = await embeddingProvider.generateEmbeddings(blocklistedPhrases);
    const blockPhraseVectors = blockEmbeddingResult.embeddings;

    console.log('[SPACES-PROCESSING] Generated', blockPhraseVectors.length, 'blocklist phrase embeddings');

    for (let i = 0; i < blockPhraseVectors.length; i++) {
      const queryVector = blockPhraseVectors[i];

      // Find top-k similar vectors
      const topIndices = findTopK(queryVector, allEmbeddings, k);

      // Add matching message IDs
      for (const idx of topIndices) {
        if (idx >= 0 && idx < messageIds.length) {
          blocklistedMessageIdsSet.add(messageIds[idx]);
        }
      }
    }

    console.log('[SPACES-PROCESSING] Found', blocklistedMessageIdsSet.size, 'blocklisted messages');

    // Remove blocklisted messages from allowlisted
    finalMessageIds = finalMessageIds.filter(mid => !blocklistedMessageIdsSet.has(mid));

    console.log('[SPACES-PROCESSING] After filtering:', finalMessageIds.length, 'messages remain');
  }

  console.log('[SPACES-PROCESSING] Final result:', finalMessageIds.length, 'matching messages');

  return {
    filteredMessageIds: finalMessageIds,
    allowlistedMessageIds: Array.from(allowlistedMessageIds),
    blocklistedMessageIds: Array.from(blocklistedMessageIdsSet),
  };
}
