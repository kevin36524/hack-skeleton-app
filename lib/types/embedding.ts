import { Space } from './api';

export interface EmbeddingRequest {
  mailboxId: string;
  accountId: string;
  guid: string;
  space: Space;
}

export interface EmbeddingResponse {
  success: boolean;
  filename: string;
  metadataFilename?: string;
  messageCount: number;
  embeddingCount: number;
  error?: string;
}

export interface EmbeddingCheckResponse {
  exists: boolean;
  filename: string;
}

export interface GeneratePhrasesRequest {
  guid: string;
  accountId: string;
  space: Space;
}

export interface GeneratePhrasesResponse {
  success: boolean;
  phrases: string[];
  filteredMessageIds: string[];
  totalMatches: number;
  originalMessageCount: number;
  error?: string;
  details?: string;
}

export interface GenerateFeedbackPhrasesRequest {
  guid: string;
  accountId: string;
  space: Space;
  userFeedback: string;
  phraseType: 'allowlist' | 'blocklist';
}

export interface GenerateFeedbackPhrasesResponse {
  success: boolean;
  phrases: string[];
  error?: string;
}

export interface FindSimilarEmailsRequest {
  mailboxId: string;
  accountId: string;
  guid: string;
  space: Space;
}

export interface FindSimilarEmailsResponse {
  success: boolean;
  filteredMessageIds: string[];
  allowlistedMessageIds: string[];
  blocklistedMessageIds: string[];
  totalMatches: number;
  allowlistedCount: number;
  blocklistedCount: number;
  error?: string;
}
