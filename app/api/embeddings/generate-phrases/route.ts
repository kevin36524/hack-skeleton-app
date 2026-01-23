import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IndexFlatL2 } from 'faiss-node';
import { Space } from '@/lib/types/api';
import { mastra } from '@/src/mastra';
import { embeddingProvider } from '@/lib/utils/embedding-provider';

interface GeneratePhrasesRequest {
  guid: string;
  accountId: string;
  space: Space;
}

export async function POST(request: NextRequest) {
  try {
    // Log the embedding provider being used
    console.log('[PHRASES] Provider:', embeddingProvider.getProvider());

    // Parse request body
    const body: GeneratePhrasesRequest = await request.json();
    const { guid, accountId, space } = body;

    if (!guid || !accountId || !space) {
      return NextResponse.json(
        { error: 'Missing required fields: guid, accountId, space' },
        { status: 400 }
      );
    }

    console.log('[PHRASES] Generating allowlisted phrases for space:', space.name);

    // Step 1: Generate phrases using Mastra agent
    console.log('[PHRASES] Step 1: Generating phrases with Mastra agent...');

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
      console.error('[PHRASES] Failed to parse agent response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Extract phrases from response
    const phrases: string[] = parsedResponse.phrases || [];

    if (!Array.isArray(phrases) || phrases.length === 0) {
      return NextResponse.json(
        { error: 'No phrases generated' },
        { status: 500 }
      );
    }

    console.log('[PHRASES] Generated', phrases.length, 'phrases');

    // Step 2: Generate embeddings for phrases
    console.log('[PHRASES] Step 2: Generating phrase embeddings...');

    const embeddingResult = await embeddingProvider.generateEmbeddings(phrases);
    const phraseVectors = embeddingResult.embeddings;

    console.log('[PHRASES] Generated', phraseVectors.length, 'phrase embeddings');
    console.log('[PHRASES] Model:', embeddingResult.model);

    // Step 3: Load existing Faiss index and metadata
    console.log('[PHRASES] Step 3: Loading existing embeddings...');

    const sanitizeName = (name: string) => name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const baseFilename = `${guid}_${accountId}_${sanitizeName(space.name)}`;
    const faissFilename = `${baseFilename}.faiss`;
    const metadataFilename = `${baseFilename}.json`;
    const dataDir = join(process.cwd(), 'data', 'embeddings');

    // Check if files exist
    const faissFilepath = join(dataDir, faissFilename);
    const metadataFilepath = join(dataDir, metadataFilename);

    let index: IndexFlatL2;
    let metadata: any;

    try {
      index = IndexFlatL2.read(faissFilepath);

      const metadataContent = readFileSync(metadataFilepath, 'utf-8');
      metadata = JSON.parse(metadataContent);

      console.log('[PHRASES] Loaded index with', metadata.messageCount, 'vectors');
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Embeddings not found. Please generate embeddings first.',
          details: 'Click "Generate Embeddings" button before creating allowlisted phrases.'
        },
        { status: 400 }
      );
    }

    // Step 4: Search for similar messages
    console.log('[PHRASES] Step 4: Finding similar messages...');

    const k = 10; // Top 10 matches per phrase
    const similarMessageIds = new Set<string>();

    for (let i = 0; i < phraseVectors.length; i++) {
      const queryVector = phraseVectors[i];

      // Search index
      const { labels } = index.search(queryVector, k);

      // Add matching message IDs
      for (const idx of labels) {
        if (idx >= 0 && idx < metadata.messageIds.length) {
          similarMessageIds.add(metadata.messageIds[idx]);
        }
      }
    }

    const filteredMessageIds = Array.from(similarMessageIds);

    console.log('[PHRASES] Found', filteredMessageIds.length, 'unique matching messages');

    return NextResponse.json({
      success: true,
      phrases,
      filteredMessageIds,
      totalMatches: filteredMessageIds.length,
      originalMessageCount: metadata.messageCount,
    });
  } catch (error) {
    console.error('[PHRASES] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate phrases',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
