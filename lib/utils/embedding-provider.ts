import OpenAI from 'openai';

export type EmbeddingProvider = 'openai' | 'qwen3';

interface EmbeddingResult {
  embeddings: number[][];
  dimension: number;
  model: string;
}

interface Qwen3Response {
  embeddings: number[][];
  count: number;
  dimensions: number;
  model: string;
}

export class EmbeddingProviderService {
  private provider: EmbeddingProvider;
  private openaiApiKey?: string;
  private qwen3ApiUrl?: string;

  constructor() {
    const provider = process.env.EMBEDDING_PROVIDER?.toLowerCase() || 'openai';

    if (provider !== 'openai' && provider !== 'qwen3') {
      console.warn(`[EMBEDDINGS] Invalid EMBEDDING_PROVIDER: ${provider}. Defaulting to 'openai'`);
      this.provider = 'openai';
    } else {
      this.provider = provider as EmbeddingProvider;
    }

    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.qwen3ApiUrl = process.env.QWEN3_EMBEDDING_API_URL;

    console.log(`[EMBEDDINGS] Using provider: ${this.provider}`);
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult> {
    if (this.provider === 'qwen3') {
      return this.generateQwen3Embeddings(texts);
    } else {
      return this.generateOpenAIEmbeddings(texts);
    }
  }

  private async generateOpenAIEmbeddings(texts: string[]): Promise<EmbeddingResult> {
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured in environment');
    }

    const openai = new OpenAI({ apiKey: this.openaiApiKey });
    const batchSize = 100;
    const allEmbeddings: number[][] = [];
    const model = 'text-embedding-3-small';

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, Math.min(i + batchSize, texts.length));
      console.log(`[EMBEDDINGS] OpenAI - Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

      const response = await openai.embeddings.create({
        model,
        input: batch,
        encoding_format: 'float',
      });

      const embeddings = response.data.map(d => d.embedding);
      allEmbeddings.push(...embeddings);
    }

    return {
      embeddings: allEmbeddings,
      dimension: 1536, // text-embedding-3-small dimension
      model,
    };
  }

  private async generateQwen3Embeddings(texts: string[]): Promise<EmbeddingResult> {
    if (!this.qwen3ApiUrl) {
      throw new Error('QWEN3_EMBEDDING_API_URL not configured in environment');
    }

    console.log(`[EMBEDDINGS] Qwen3 - Processing ${texts.length} texts`);

    const response = await fetch(this.qwen3ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emails: texts,
        normalize: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qwen3 API error: ${response.status} - ${errorText}`);
    }

    const data: Qwen3Response = await response.json();

    if (!data.embeddings || data.embeddings.length === 0) {
      throw new Error('Qwen3 API returned no embeddings');
    }

    console.log(`[EMBEDDINGS] Qwen3 - Generated ${data.count} embeddings with dimension ${data.dimensions}`);

    return {
      embeddings: data.embeddings,
      dimension: data.dimensions,
      model: data.model,
    };
  }

  getProvider(): EmbeddingProvider {
    return this.provider;
  }

  getDimension(): number {
    return this.provider === 'qwen3' ? 896 : 1536;
  }
}

export const embeddingProvider = new EmbeddingProviderService();
