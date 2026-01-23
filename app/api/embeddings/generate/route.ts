import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LocalIndex } from 'vectra';
import { Space } from '@/lib/types/api';
import { embeddingProvider } from '@/lib/utils/embedding-provider';

const YAHOO_API_BASE = 'https://apis.mail.yahoo.com/ws/v3';
const APP_ID = 'YahooMailIosMobile';

// Sanitize filename to prevent path traversal
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_');
}

interface GenerateRequest {
  mailboxId: string;
  accountId: string;
  guid: string;
  space: Space;
}

export async function POST(request: NextRequest) {
  try {
    // Log the embedding provider being used
    console.log('[EMBEDDINGS] Provider:', embeddingProvider.getProvider());
    console.log('[EMBEDDINGS] Expected dimension:', embeddingProvider.getDimension());

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GenerateRequest = await request.json();
    const { mailboxId, accountId, guid, space } = body;

    if (!mailboxId || !accountId || !guid || !space) {
      return NextResponse.json(
        { error: 'Missing required fields: mailboxId, accountId, guid, space' },
        { status: 400 }
      );
    }

    console.log('[EMBEDDINGS] Generating embeddings for space:', space.name);

    // Step 1: Fetch messages for the space
    console.log('[EMBEDDINGS] Step 1: Fetching messages...');

    // Extract parameters from space
    const fromEmails = space.emailSenders?.map(s => s.email) || [];
    const keywords = space.keywords || [];
    const includeKeywords = space.extraData?.includeKeywords !== false;
    const count = space.extraData?.messageCount || 50;

    // Build query (same logic as message-service.ts)
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

    console.log('[EMBEDDINGS] Fetching from:', messagesUrl);

    const messagesResponse = await fetch(messagesUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text();
      console.error('[EMBEDDINGS] Failed to fetch messages:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch messages from Yahoo API', details: errorText },
        { status: messagesResponse.status }
      );
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.result?.messages || [];

    console.log('[EMBEDDINGS] Fetched', messages.length, 'messages');

    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No messages found for this space',
          messageCount: 0,
          embeddingCount: 0,
          filename: '',
        },
        { status: 400 }
      );
    }

    // Step 2: Prepare texts and message IDs for embedding
    console.log('[EMBEDDINGS] Step 2: Preparing texts...');

    const texts: string[] = [];
    const messageIds: string[] = [];

    messages.forEach((msg: any) => {
      const subject = msg.headers?.subject || '';
      const snippet = msg.snippet || '';
      texts.push(`${subject} ${snippet}`.trim());
      messageIds.push(msg.id);
    });

    // Step 3: Generate embeddings using configured provider
    console.log('[EMBEDDINGS] Step 3: Generating embeddings...');

    const embeddingResult = await embeddingProvider.generateEmbeddings(texts);
    const allEmbeddings = embeddingResult.embeddings;
    const dimension = embeddingResult.dimension;

    console.log('[EMBEDDINGS] Generated', allEmbeddings.length, 'embeddings');
    console.log('[EMBEDDINGS] Model:', embeddingResult.model);

    // Step 4: Create Vectra index
    console.log('[EMBEDDINGS] Step 4: Creating Vectra index...');

    const baseFilename = `${guid}_${accountId}_${sanitizeName(space.name)}`;
    const indexDir = join(process.cwd(), 'data', 'embeddings', baseFilename);

    // Ensure directory exists
    mkdirSync(indexDir, { recursive: true });

    const index = new LocalIndex(indexDir);
    await index.createIndex();

    // Add all vectors to index
    for (let i = 0; i < allEmbeddings.length; i++) {
      await index.insertItem({
        id: messageIds[i],
        vector: allEmbeddings[i],
        metadata: {
          messageId: messageIds[i],
          spaceName: space.name,
          accountId,
          guid
        }
      });
    }

    console.log('[EMBEDDINGS] Added', allEmbeddings.length, 'vectors to index');

    // Step 5: Save metadata
    console.log('[EMBEDDINGS] Step 5: Saving metadata...');

    const metadataFilename = `${baseFilename}.json`;
    const metadata = {
      messageIds,
      spaceName: space.name,
      accountId,
      guid,
      createdAt: new Date().toISOString(),
      messageCount: messages.length,
      embeddingDimension: dimension,
    };
    const metadataFilepath = join(process.cwd(), 'data', 'embeddings', metadataFilename);
    writeFileSync(metadataFilepath, JSON.stringify(metadata, null, 2));
    console.log('[EMBEDDINGS] Saved metadata to:', metadataFilepath);

    return NextResponse.json({
      success: true,
      filename: baseFilename,
      metadataFilename,
      messageCount: messages.length,
      embeddingCount: allEmbeddings.length,
    });
  } catch (error) {
    console.error('[EMBEDDINGS] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate embeddings',
        details: errorMessage,
        filename: '',
        messageCount: 0,
        embeddingCount: 0,
      },
      { status: 500 }
    );
  }
}
