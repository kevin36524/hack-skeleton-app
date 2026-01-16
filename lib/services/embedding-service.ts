import {
  EmbeddingRequest,
  EmbeddingResponse,
  EmbeddingCheckResponse,
  GeneratePhrasesRequest,
  GeneratePhrasesResponse,
} from '@/lib/types/embedding';

class EmbeddingService {
  async checkExists(
    guid: string,
    accountId: string,
    spaceName: string
  ): Promise<EmbeddingCheckResponse> {
    try {
      const params = new URLSearchParams({
        guid,
        accountId,
        spaceName,
      });

      const response = await fetch(`/api/embeddings/check?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to check embeddings: ${response.statusText}`);
      }

      const data: EmbeddingCheckResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking embedding existence:', error);
      throw error;
    }
  }

  async generateEmbeddings(
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    try {
      const response = await fetch('/api/embeddings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate embeddings: ${response.statusText}`
        );
      }

      const data: EmbeddingResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async generateAllowlistedPhrases(
    request: GeneratePhrasesRequest
  ): Promise<GeneratePhrasesResponse> {
    try {
      const response = await fetch('/api/embeddings/generate-phrases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate phrases: ${response.statusText}`
        );
      }

      const data: GeneratePhrasesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating allowlisted phrases:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();
