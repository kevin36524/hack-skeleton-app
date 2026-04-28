import { Timestamp } from 'firebase-admin/firestore';

export type EntityType =
  | 'person'
  | 'organization'
  | 'household'
  | 'life_thread'
  | 'event'
  | 'commitment'
  | 'preference'
  | 'asset'
  | 'alert'
  | 'alert_rule'
  | 'external_system_alert';

export type Drawer =
  | 'people_orgs'        // Phase 1 ✓
  | 'life_threads'       // Phase 2
  | 'commitments'        // Phase 1 ✓
  | 'top_of_mind_prefs'; // Phase 2

export type FactType = 'stable' | 'time_sensitive' | 'reminder' | 'relationship';
export type Authority = 'explicit_remember' | 'correction' | 'ambient' | 'email_derived';
export type SenderTier = 'important' | 'conditional' | 'junk';
export type ContentTier = 'skip' | 'direct_to_schema' | 'two_stage';

export interface Profile {
  uid: string;
  email: string;
  timezone: string;
  backfillWindowMonths: 1 | 3 | 6 | 12;
  backfillStatus: {
    phase: 0 | 1 | 2 | 3 | 4;
    progress: number; // 0..1
    completedAt: Timestamp | null;
    costSpent: number;
  };
  pinnedEntityIds: string[];
  consentScope: {
    digest: 'never' | 'session' | 'always';
    triage: 'never' | 'session' | 'always';
    reply: 'never' | 'session' | 'always';
  };
  digestLastDeliveredAt: Timestamp | null;
}

export interface Entity {
  id: string;
  type: EntityType;
  drawer: Drawer;
  label: string;
  aliases: string[];
  emailAddresses: string[];
  sourceMessageIds: string[];
  firstSeen: Timestamp;
  lastUpdated: Timestamp;
  pinned: boolean;
  pinnedAt: Timestamp | null;
  entryClock: Timestamp | null;
  decayClock: Timestamp | null;
  relationshipClass?: 'family' | 'work' | 'school' | 'doctor' | 'vendor' | 'service' | 'newsletter' | 'unknown';
  startTime?: Timestamp;
  endTime?: Timestamp;
  participantIds?: string[];
  dueDate?: Timestamp;
  resolvedAt?: Timestamp | null;
  owedBy?: string;
  owedTo?: string;
  lifeThreadStatus?: 'active' | 'upcoming' | 'dormant' | 'closed';
  lastActivityAt?: Timestamp;
  payload: Record<string, unknown>;
  schemaVersion: number;
}

export interface Fact {
  id: string;
  entityId: string;
  slot: string;
  factType: FactType;
  value: unknown;
  status: 'current' | 'superseded';
  authority: Authority;
  confidence: number;
  sourceMessageIds: string[];
  firstSeen: Timestamp;
  lastVerified: Timestamp;
  effectiveTime: Timestamp;
  supersededBy: string | null;
  supersedes: string | null;
  drawer: Drawer;
}

export interface Note {
  id: string;
  sourceMessageId: string;
  deliveryTime: Timestamp;
  from: { name: string; email: string };
  subject: string;
  notesText: string;
  signals: string[];
  contentTier: ContentTier;
  stageBStatus: 'pending' | 'processed' | 'failed';
  stageBProcessedAt: Timestamp | null;
  producedFactIds: string[];
}

export interface JobCall {
  ts: number;          // epoch ms
  method: 'GET' | 'POST';
  url: string;         // Yahoo API path, truncated to 150 chars
  status: number | 'err';
}

export interface IngestJob {
  id: string;
  kind: 'cold_start' | 'warm_batch' | 'retroactive_boost' | 'manual';
  phase: 0 | 1 | 2 | 3 | 4;
  windowStart: Timestamp;
  windowEnd: Timestamp;
  costBudget: number;
  costSpent: number;
  status: 'pending' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'capped';
  errorCount: number;
  processedMessageIds: string[];
  calls: JobCall[];
  callCount: number;
  phase0Candidates?: Array<{
    email: string;
    name: string;
    score: number;
    signals?: { sentTo: boolean; starCount: number; threadCount: number; openWithDwellCount: number };
  }>;
  approvedCandidateEmails?: string[];
  phase1EntityIds?: string[];
  createdAt: Timestamp;
  completedAt: Timestamp | null;
  token?: string;
}
