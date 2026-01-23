import { NextRequest, NextResponse } from 'next/server';
import { IndexFlatL2 } from 'faiss-node';
import { Space } from '@/lib/types/api';
import { embeddingProvider } from '@/lib/utils/embedding-provider';

const YAHOO_API_BASE = 'https://apis.mail.yahoo.com/ws/v3';
const APP_ID = 'YahooMailIosMobile';

interface FindSimilarRequest {
  mailboxId: string;
  accountId: string;
  guid: string;
  space: Space;
}

export async function POST(request: NextRequest) {
  try {
    // Log the embedding provider being used
    console.log('[FIND-SIMILAR] Provider:', embeddingProvider.getProvider());
    console.log('[FIND-SIMILAR] Expected dimension:', embeddingProvider.getDimension());

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: FindSimilarRequest = await request.json();
    const { mailboxId, accountId, guid, space } = body;

    if (!mailboxId || !accountId || !guid || !space) {
      return NextResponse.json(
        { error: 'Missing required fields: mailboxId, accountId, guid, space' },
        { status: 400 }
      );
    }

    // Check if phrases exist
    const allowlistedPhrases = space.extraData?.allowlistedPhrases || [];
    if (allowlistedPhrases.length === 0) {
      return NextResponse.json(
        { error: 'No allowlisted phrases found. Please generate phrases first.' },
        { status: 400 }
      );
    }

    console.log('[FIND-SIMILAR] Finding similar emails for space:', space.name);
    console.log('[FIND-SIMILAR] Allowlisted phrases:', allowlistedPhrases.length);
    console.log('[FIND-SIMILAR] Blocklisted phrases:', space.extraData?.blocklistedPhrases?.length || 0);

    // Step 1: Fetch messages for the space
    console.log('[FIND-SIMILAR] Step 1: Fetching messages...');

    // Extract parameters from space
    const fromEmails = space.emailSenders?.map(s => s.email) || [];
    const keywords = space.keywords || [];
    const includeKeywords = space.extraData?.includeKeywords !== false;
    const count = space.extraData?.messageCount || 50;

    // Build query (same logic as generate route)
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

    console.log('[FIND-SIMILAR] Fetching from:', messagesUrl);

    const messagesResponse = await fetch(messagesUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('[FIND-SIMILAR] Failed to fetch messages:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch messages from Yahoo API', details: errorText },
        { status: messagesResponse.status }
      );
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.result?.messages || [];

    console.log('[FIND-SIMILAR] Fetched', messages.length, 'messages');

    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: true,
          filteredMessageIds: [],
          totalMatches: 0,
        }
      );
    }

    // Step 2: Prepare texts and message IDs for embedding
    console.log('[FIND-SIMILAR] Step 2: Preparing texts...');

    const texts: string[] = [];
    const messageIds: string[] = [];

    messages.forEach((msg: any) => {
      const subject = msg.headers?.subject || '';
      const snippet = msg.snippet || '';
      texts.push(`${subject} ${snippet}`.trim());
      messageIds.push(msg.id);
    });

    // Step 3: Generate embeddings IN MEMORY (not saved)
    console.log('[FIND-SIMILAR] Step 3: Generating embeddings in memory...');

    const embeddingResult = await embeddingProvider.generateEmbeddings(texts);
    const allEmbeddings = embeddingResult.embeddings;
    const dimension = embeddingResult.dimension;

    console.log('[FIND-SIMILAR] Generated', allEmbeddings.length, 'embeddings');
    console.log('[FIND-SIMILAR] Model:', embeddingResult.model);

    // Step 4: Create Faiss index IN MEMORY
    console.log('[FIND-SIMILAR] Step 4: Creating Faiss index in memory...');

    const index = new IndexFlatL2(dimension);

    // Flatten embeddings into a regular array
    const flatEmbeddings: number[] = [];
    for (let i = 0; i < allEmbeddings.length; i++) {
      flatEmbeddings.push(...allEmbeddings[i]);
    }

    console.log('[FIND-SIMILAR] Flattened array length:', flatEmbeddings.length, 'Expected:', allEmbeddings.length * dimension);

    // Add all vectors to index at once
    index.add(flatEmbeddings);

    console.log('[FIND-SIMILAR] Added', allEmbeddings.length, 'vectors to index');

    // Step 5: Generate embeddings for allowlisted phrases
    console.log('[FIND-SIMILAR] Step 5: Generating phrase embeddings...');

    const allowEmbeddingResult = await embeddingProvider.generateEmbeddings(allowlistedPhrases);
    const allowPhraseVectors = allowEmbeddingResult.embeddings;

    console.log('[FIND-SIMILAR] Generated', allowPhraseVectors.length, 'allowlist phrase embeddings');

    // Step 6: Search for similar messages using allowlisted phrases
    console.log('[FIND-SIMILAR] Step 6: Finding similar messages...');

    const k = 10; // Top 10 matches per phrase
    const allowlistedMessageIds = new Set<string>();

    for (let i = 0; i < allowPhraseVectors.length; i++) {
      const queryVector = allowPhraseVectors[i];

      // Search index
      const { labels } = index.search(queryVector, k);

      // Add matching message IDs
      for (const idx of labels) {
        if (idx >= 0 && idx < messageIds.length) {
          allowlistedMessageIds.add(messageIds[idx]);
        }
      }
    }

    console.log('[FIND-SIMILAR] Found', allowlistedMessageIds.size, 'allowlisted messages');

    // Step 7: Handle blocklisted phrases (if any)
    const blocklistedPhrases = space.extraData?.blocklistedPhrases || [];
    let finalMessageIds = Array.from(allowlistedMessageIds);

    if (blocklistedPhrases.length > 0) {
      console.log('[FIND-SIMILAR] Step 7: Processing blocklisted phrases...');

      const blockEmbeddingResult = await embeddingProvider.generateEmbeddings(blocklistedPhrases);
      const blockPhraseVectors = blockEmbeddingResult.embeddings;

      console.log('[FIND-SIMILAR] Generated', blockPhraseVectors.length, 'blocklist phrase embeddings');

      const blocklistedMessageIds = new Set<string>();

      for (let i = 0; i < blockPhraseVectors.length; i++) {
        const queryVector = blockPhraseVectors[i];

        // Search index
        const { labels } = index.search(queryVector, k);

        // Add matching message IDs
        for (const idx of labels) {
          if (idx >= 0 && idx < messageIds.length) {
            blocklistedMessageIds.add(messageIds[idx]);
          }
        }
      }

      console.log('[FIND-SIMILAR] Found', blocklistedMessageIds.size, 'blocklisted messages');

      // Remove blocklisted messages from allowlisted
      finalMessageIds = finalMessageIds.filter(mid => !blocklistedMessageIds.has(mid));

      console.log('[FIND-SIMILAR] After filtering:', finalMessageIds.length, 'messages remain');
    }

    console.log('[FIND-SIMILAR] Final result:', finalMessageIds.length, 'matching messages');

    return NextResponse.json({
      success: true,
      filteredMessageIds: finalMessageIds,
      totalMatches: finalMessageIds.length,
    });
  } catch (error) {
    console.error('[FIND-SIMILAR] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find similar emails',
        details: errorMessage,
        filteredMessageIds: [],
        totalMatches: 0,
      },
      { status: 500 }
    );
  }
}
