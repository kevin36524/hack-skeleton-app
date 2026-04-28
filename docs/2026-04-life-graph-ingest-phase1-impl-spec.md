# Life Graph — Phase 1 Ingestion Implementation Spec

**Date:** 2026-04-28
**Author:** Kevin Patel (patelkev@yahooinc.com)
**Status:** Implementation Spec — ready to build
**Milestone:** Milestone 1 (Approach B, drawers 1 + 3 only)
**Parents:**
- [2026-04-life-graph-strategy.md](./2026-04-life-graph-strategy.md)
- [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md)
- [2026-04-life-graph-ingest-pipeline-design.md](./2026-04-life-graph-ingest-pipeline-design.md)

---

## Scope

Phase 1 covers **ingestion only** — getting emails into the Life Graph in Firestore. It does not include wiki_agent, digest read path, or reasoning/alerts (those are Phase 2+).

**Drawers in scope:** `people_orgs` (drawer 1) + `commitments` (drawer 3).
**Drawers deferred:** `life_threads` (drawer 2) + `top_of_mind_prefs` (drawer 4) — Milestone 2.

**What ships at the end of Phase 1:**
- Firestore `life-graph` DB populated with Person/Org entities and Commitment/Event entities from the user's mailbox.
- Fact records for stable slots (job, relationship class, sender_class) and time-sensitive slots (meeting.time, deadline.date).
- Free-form notes as source-of-truth in `notes/` collection.
- A running IngestJob tracking cold-start phases.
- An ongoing ingest API endpoint that processes new emails as they arrive.

---

## Infrastructure Context

- **Cloud Run service:** `ymail-agent` (us-central1, project `twiliotest-8d802`)
- **Firestore:** database ID `life-graph`, us-central1, Enterprise, Google-managed encryption
- **Service account key:** `twiliotest-admin-key.json` (root of repo)
- **Mail source:** Yahoo Mail API (`apis.mail.yahoo.com/ws/v3`) — existing helpers in `src/mastra/helpers/yahoo-api.ts`
- **LLM:** Google Gemini Flash 2.0 (default, cheap) + Claude Sonnet 4.6 for Stage B batching (higher quality)
- **Framework:** Next.js 16 + Mastra + TypeScript

---

## Work Unit Index

| Done | ID    | Name                                                 | Group             | Depends on                 |
| ---- | ----- | ---------------------------------------------------- | ----------------- | -------------------------- |
| [ ]  | WU-01 | Firestore client singleton                           | A: Infrastructure | —                          |
| [ ]  | WU-02 | TypeScript types for Life Graph                      | A: Infrastructure | —                          |
| [ ]  | WU-03 | Collection helpers (CRUD + merge)                    | A: Infrastructure | WU-01, WU-02               |
| [ ]  | WU-04 | Supersedes-chain transaction writer                  | A: Infrastructure | WU-03                      |
| [ ]  | WU-05 | Profile init API                                     | A: Infrastructure | WU-03                      |
| [ ]  | WU-06 | IngestJob create / update helpers                    | B: Cold-Start     | WU-03                      |
| [ ]  | WU-07 | Cold-Start Phase 0 — structural pass                 | B: Cold-Start     | WU-06                      |
| [ ]  | WU-08 | Cold-Start Phase 1 — sender profiling (LLM)          | B: Cold-Start     | WU-07                      |
| [ ]  | WU-09 | Stage A — free-form note extraction                  | B: Cold-Start     | WU-03                      |
| [ ]  | WU-10 | Stage B — structured fact extraction (batched LLM)   | B: Cold-Start     | WU-04, WU-09               |
| [ ]  | WU-11 | Entity identity resolution                           | B: Cold-Start     | WU-03                      |
| [ ]  | WU-12 | Cold-Start Phase 2 — deep extraction orchestrator    | B: Cold-Start     | WU-08, WU-09, WU-10, WU-11 |
| [ ]  | WU-13 | Cold-Start Phase 3 — thread sweep (notes-only)       | B: Cold-Start     | WU-09                      |
| [ ]  | WU-14 | Cold-Start Phase 4 — top-of-mind seeding             | B: Cold-Start     | WU-10                      |
| [ ]  | WU-15 | Backfill trigger API + Cloud Run job endpoint        | B: Cold-Start     | WU-06                      |
| [ ]  | WU-16 | Ongoing ingest — Step 1 dictionary lookup            | C: Ongoing Ingest | WU-03                      |
| [ ]  | WU-17 | Ongoing ingest — Steps 2–3 content escalation & gate | C: Ongoing Ingest | WU-16                      |
| [ ]  | WU-18 | Ongoing ingest — Steps 4–9 deep ingest pipeline      | C: Ongoing Ingest | WU-09, WU-10, WU-17        |
| [ ]  | WU-19 | Ongoing ingest — Step 10 retroactive boost hook      | C: Ongoing Ingest | WU-18                      |
| [ ]  | WU-20 | Firestore composite indexes                          | D: Validation     | WU-02                      |
| [ ]  | WU-21 | Integration test script                              | D: Validation     | WU-15, WU-18               |

---

## Group A — Infrastructure

---

### WU-01: Firestore Client Singleton `[ ]`

**Output file:** `src/lib/life-graph/firestore-client.ts`

**What:** Initialize `firebase-admin` using `twiliotest-admin-key.json` and return a Firestore instance pointed at the `life-graph` database. Export a singleton so every module shares one connection.

**Steps:**
1. Add dependency: `pnpm add firebase-admin`.
2. Create `src/lib/life-graph/firestore-client.ts`:
   ```ts
   import { initializeApp, getApps, cert } from 'firebase-admin/app';
   import { getFirestore } from 'firebase-admin/firestore';
   import serviceAccount from '../../../twiliotest-admin-key.json';

   const app = getApps().length
     ? getApps()[0]
     : initializeApp({ credential: cert(serviceAccount as any) });

   export const db = getFirestore(app, 'life-graph');
   ```
3. Verify: `db.collection('test').doc('ping').get()` returns without error in a quick script.

**Notes:**
- `twiliotest-admin-key.json` is in `.gitignore`; confirm before first commit.
- `getApps().length` guard prevents double-init in Next.js hot-reload.

---

### WU-02: TypeScript Types for Life Graph `[ ]`

**Output file:** `src/lib/life-graph/types.ts`

**What:** Define all TypeScript interfaces matching the data model doc exactly. This file is the single source of truth for schema shape — all other modules import from here.

**Contents** (abbreviated; implement the full interfaces from the data model doc):

```ts
import { Timestamp } from 'firebase-admin/firestore';

export type EntityType =
  | 'person' | 'organization' | 'household'
  | 'life_thread'
  | 'event' | 'commitment' | 'preference'
  | 'asset'
  | 'alert' | 'alert_rule' | 'external_system_alert';

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
    reply:  'never' | 'session' | 'always';
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
  // Person/Org hot fields
  relationshipClass?: 'family' | 'work' | 'school' | 'doctor' | 'vendor' | 'service' | 'newsletter' | 'unknown';
  // Event hot fields
  startTime?: Timestamp;
  endTime?: Timestamp;
  participantIds?: string[];
  // Commitment hot fields
  dueDate?: Timestamp;
  resolvedAt?: Timestamp | null;
  owedBy?: string;
  owedTo?: string;
  // LifeThread hot fields
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
  effectiveTime: Timestamp; // source email delivery time
  supersededBy: string | null;
  supersedes:   string | null;
  drawer: Drawer;
}

export interface Note {
  id: string;                     // == sourceMessageId
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

export interface IngestJob {
  id: string;
  kind: 'cold_start' | 'warm_batch' | 'retroactive_boost' | 'manual';
  phase: 0 | 1 | 2 | 3 | 4;
  windowStart: Timestamp;
  windowEnd: Timestamp;
  costBudget: number;
  costSpent: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'capped';
  errorCount: number;
  processedMessageIds: string[];
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}
```

**Notes:**
- Phase 1 only writes to `people_orgs` and `commitments` drawers. `life_threads` and `top_of_mind_prefs` drawer values exist in the type but are not written.
- `schemaVersion` starts at `1` for all entities.

---

### WU-03: Collection Helpers (CRUD + Merge) `[ ]`

**Output file:** `src/lib/life-graph/db.ts`

**What:** Thin wrappers over `db` from WU-01 for each collection. Handles path construction, serialization, and basic merge logic. No LLM calls here — pure storage.

**Exports:**
```ts
// Profile
getProfile(uid: string): Promise<Profile | null>
setProfile(uid: string, profile: Profile): Promise<void>
updateProfileBackfillStatus(uid: string, update: Partial<Profile['backfillStatus']>): Promise<void>

// Entities
getEntity(uid: string, eid: string): Promise<Entity | null>
upsertEntity(uid: string, entity: Entity): Promise<void>
findEntityByEmail(uid: string, email: string): Promise<Entity | null>
listEntitiesByDrawer(uid: string, drawer: Drawer): Promise<Entity[]>

// Facts
getFact(uid: string, fid: string): Promise<Fact | null>
getCurrentFact(uid: string, entityId: string, slot: string): Promise<Fact | null>
insertFact(uid: string, fact: Fact): Promise<void>
appendSourceMessageId(uid: string, fid: string, messageId: string): Promise<void>

// Notes
getNote(uid: string, nid: string): Promise<Note | null>
insertNote(uid: string, note: Note): Promise<void>
markNoteStageB(uid: string, nid: string, status: Note['stageBStatus'], producedFactIds: string[]): Promise<void>
listPendingStageBNotes(uid: string, limit: number): Promise<Note[]>

// IngestJobs
createIngestJob(uid: string, job: IngestJob): Promise<void>
updateIngestJob(uid: string, jid: string, update: Partial<IngestJob>): Promise<void>
getIngestJob(uid: string, jid: string): Promise<IngestJob | null>
```

**Implementation notes:**
- All paths are `/users/{uid}/collection/{docId}`.
- `upsertEntity` does a `merge: true` set so hot-field updates don't wipe cold payload.
- `findEntityByEmail` queries `where('emailAddresses', 'array-contains', email)` with `limit(1)`.
- All reads/writes use `Timestamp.now()` only when creating `firstSeen`/`createdAt` — never for `effectiveTime`, which must come from the source email's delivery time (shared invariant from pipeline doc).

---

### WU-04: Supersedes-Chain Transaction Writer `[ ]`

**Output file:** `src/lib/life-graph/supersedes.ts`

**What:** Atomic Firestore transaction that implements R4 fact-update semantics. Called by Stage B whenever a new time-sensitive fact is extracted.

**Signature:**
```ts
async function writeOrSupersedeFact(
  uid: string,
  newFact: Omit<Fact, 'id' | 'supersedes' | 'supersededBy'>,
): Promise<string> // returns new fact ID
```

**Logic:**
1. Inside a Firestore transaction:
   a. Query `facts` for `entityId + slot + status='current'` (use the composite index from WU-20).
   b. If no existing fact: insert `newFact` with `status='current', supersedes=null, supersededBy=null`. Return new ID.
   c. If existing fact's `effectiveTime` is **older** than `newFact.effectiveTime` (delivery-time ordering):
      - Update existing fact: `status='superseded', supersededBy=<newFactId>`.
      - Insert new fact: `status='current', supersedes=<existingFactId>, supersededBy=null`.
      - Return new fact ID.
   d. If existing fact's `effectiveTime` is **newer** (out-of-order arrival, e.g. late re-ingest of old email):
      - Insert new fact with `status='superseded'`, linked via `supersededBy` to the already-current fact.
      - Return new fact ID (it's archived immediately).
2. For `stable` facts: overwrite `value` in-place on the existing fact + append `sourceMessageId`. No chain.
3. For `reminder` facts: append `sourceMessageId` to the existing current fact, update `lastVerified`. No new fact doc.

**Why a transaction:** The two writes (mark old superseded + insert new current) must be atomic. A crash between them would leave the graph with two "current" facts for the same slot.

---

### WU-05: Profile Init API `[ ]`

**Output file:** `app/api/life-graph/profile/init/route.ts`

**What:** POST endpoint that creates or resets the user's profile doc. Called once at enrollment.

**Request:** `Authorization: Bearer <yahoo-token>` header (same pattern as existing API routes).

**Response:**
```json
{ "uid": "...", "created": true }
```

**Logic:**
1. Extract user identity from the Yahoo token (call `getMailboxId` helper, which resolves to a stable Yahoo account ID — use this as `uid`).
2. Check if profile already exists. If it does, return `{ created: false }`.
3. Write a new `Profile` document with:
   - `backfillStatus.phase = 0`, `progress = 0`, `completedAt = null`, `costSpent = 0`
   - `backfillWindowMonths = 12` (Premium default)
   - `consentScope = { digest: 'never', triage: 'never', reply: 'never' }`
   - `pinnedEntityIds = []`
   - `digestLastDeliveredAt = null`
4. Return `{ uid, created: true }`.

**Notes:**
- `uid` for Yahoo users: the Yahoo mailbox ID (`mailboxId` returned from `getMailboxId`) is stable and serves as the graph namespace. Do not use email address as uid (can change).

---

## Group B — Cold-Start Backfill

---

### WU-06: IngestJob Create / Update Helpers `[ ]`

**Already covered by WU-03** (`createIngestJob`, `updateIngestJob`). This WU adds one additional helper:

**Output file:** addition to `src/lib/life-graph/db.ts`

```ts
async function incrementIngestJobCost(uid: string, jid: string, dollarDelta: number): Promise<void>
async function appendProcessedMessageId(uid: string, jid: string, messageId: string): Promise<void>
async function checkCostCap(uid: string, jid: string): Promise<boolean> // returns true if cap exceeded
```

`checkCostCap` reads `costBudget` and `costSpent` atomically and sets `status='capped'` if exceeded. Cold-start callers check this after every Phase 2 extraction batch.

**Hard cap defaults (Phase 1):**
- Cold-start: `$10` total budget.
- Warm-batch: `$0.50` per batch.

These are env vars: `LIFE_GRAPH_COLD_START_BUDGET_USD` and `LIFE_GRAPH_WARM_BATCH_BUDGET_USD`.

---

### WU-07: Cold-Start Phase 0 — Structural Pass `[ ]`

**Output file:** `src/lib/life-graph/cold-start/phase0-structural.ts`

**What:** Metadata-only scan of the user's mailbox. No LLM. Builds a scored candidate-sender list.

**Inputs:** `uid: string`, `token: string`, `windowMonths: number`

**Output:** `CandidateSender[]`
```ts
interface CandidateSender {
  email: string;
  name: string;
  compositeScore: number;
  signals: {
    sentTo: boolean;          // appears in sent folder
    replyCount: number;       // user replied to this sender
    starCount: number;        // user starred their emails
    openWithDwellCount: number;
    curatedFolderCount: number;
  };
}
```

**Steps:**
1. Call `listMessages` tool (via Yahoo API) on the **Sent** folder — collect unique recipient email addresses. Mark `sentTo = true` for each. Use `count=200` + pagination up to `windowMonths`.
2. Call `listMessages` on **Inbox** with `count=500` — collect senders. Score:
   - `replyCount`: check if any message in thread has `from` matching the user's own email.
   - `starCount`: `isStarred === true`.
   - `openWithDwellCount`: not available from list API — approximate by `isRead === true && !isStarred` (lower weight).
3. Walk user-created folders (from `listFolders`; skip system folders): increment `curatedFolderCount` for senders whose messages appear there.
4. Compute `compositeScore = (sentTo ? 100 : 0) + replyCount*40 + starCount*20 + curatedFolderCount*15 + openWithDwellCount*5`.
5. Sort descending. Write an IngestJob doc: `kind='cold_start', phase=0, status='running'`.
6. Return top 500 candidates (Phase 1 caps at this before Phase 1 sender profiling).

**Notes:**
- No LLM calls. This phase should complete in < 30 seconds.
- Update `Profile.backfillStatus.phase = 1` after completion.

---

### WU-08: Cold-Start Phase 1 — Sender Profiling (LLM) `[ ]`

**Output file:** `src/lib/life-graph/cold-start/phase1-sender-profiling.ts`

**What:** For each candidate sender (top 200 from Phase 0), fetch 5–10 recent emails and run a single cheap LLM call to classify the sender entity.

**LLM model:** Gemini Flash 2.0 (cheap; one call per sender).

**Prompt template** (system):
```
You are classifying an email sender for a personal assistant. Given a sample of recent emails
from one sender, return a JSON object with these exact fields:
- entityType: "person" | "organization"
- relationshipClass: "family" | "work" | "school" | "doctor" | "vendor" | "service" | "newsletter" | "unknown"
- roleLabel: short human label, e.g. "Boss at Stripe", "Kid's school", "Amazon orders"
- senderTier: "important" | "conditional" | "junk"
- confidence: 0.0 to 1.0

Respond with only valid JSON, no markdown fences.
```

**Steps per sender:**
1. Fetch 5–10 message metadata (subject, snippet, date) for the sender using `searchMessages` or `listMessages` filtered by sender email.
2. Build a compact prompt: sender name/email + 5-10 subject lines + snippets.
3. Call LLM. Parse JSON response.
4. If `confidence < 0.5`, mark sender `pending` — do not write entity yet.
5. For `confidence >= 0.5`:
   a. Upsert an `Entity` doc (`type = entityType`, `drawer = 'people_orgs'`, `relationshipClass`, `label = roleLabel`, `emailAddresses = [senderEmail]`).
   b. Write a `Fact` doc: `slot = 'sender_class'`, `factType = 'stable'`, `value = senderTier`, `authority = 'email_derived'`, `confidence = LLM confidence`.
6. Accumulate LLM cost estimate (`~0.001` USD per call at Gemini Flash pricing). Call `incrementIngestJobCost`.
7. Check cost cap after every 10 senders. If capped, stop and set job `status = 'capped'`.

**Output:** List of entity IDs created, ranked by composite score from Phase 0.

**Update:** `Profile.backfillStatus.phase = 2` after last sender processed.

---

### WU-09: Stage A — Free-Form Note Extraction `[ ]`

**Output file:** `src/lib/life-graph/extraction/stage-a.ts`

**What:** Given a single email's metadata + body text, produce a free-form prose note and write it to `notes/`. Reused by both cold-start and ongoing ingest.

**Signature:**
```ts
async function stageA(
  uid: string,
  message: {
    id: string;
    deliveryTime: Date;
    from: { name: string; email: string };
    subject: string;
    body: string;
  }
): Promise<{ noteId: string; contentTier: ContentTier }>
```

**Content-tier classification (before LLM call):**

Classify synchronously using regex — no LLM:

```ts
const SKIP_PATTERNS = [
  /one.?time.?passcode|otp|\bverification code\b|\bsecurity code\b/i,
  /your order has shipped|delivery confirmation|tracking number/i,
  /unsubscribe.*click here/i,
];
const DIRECT_TO_SCHEMA_PATTERNS = [
  /(?:flight|itinerary|boarding pass|reservation|booking confirmation)/i,
  /(?:calendar invite|event invitation|you're invited to)/i,
  /(?:order receipt|payment received|invoice #)/i,
];
```

- Matches `SKIP_PATTERNS` → `contentTier = 'skip'`. Do not call LLM. Write note with `notesText = ''`, `signals = []`.
- Matches `DIRECT_TO_SCHEMA_PATTERNS` → `contentTier = 'direct_to_schema'`. Still run Stage A LLM for signals, but Stage B will use a tighter schema-extraction prompt.
- Everything else → `contentTier = 'two_stage'`.

**LLM call (Gemini Flash, skip-classified emails skip this):**

System prompt:
```
You are taking notes on an email for a personal assistant. Write a compact prose note (2-5 sentences)
capturing what matters: who, what, when, where, any action items or changes to existing plans.
Then list 1-5 short signal tags (snake_case) capturing the email's nature.

Respond as JSON:
{ "notes": "<prose>", "signals": ["signal1", "signal2", ...] }
```

User content: `From: {name} <{email}>\nSubject: {subject}\n\n{body truncated to 1500 chars}`

**Write to Firestore:**
```ts
const note: Note = {
  id: message.id,
  sourceMessageId: message.id,
  deliveryTime: Timestamp.fromDate(message.deliveryTime),
  from: message.from,
  subject: message.subject,
  notesText: llmResult.notes,
  signals: llmResult.signals,
  contentTier,
  stageBStatus: contentTier === 'skip' ? 'processed' : 'pending',
  stageBProcessedAt: contentTier === 'skip' ? Timestamp.now() : null,
  producedFactIds: [],
};
await insertNote(uid, note);
```

**Return:** `{ noteId: message.id, contentTier }`

---

### WU-10: Stage B — Structured Fact Extraction (Batched LLM) `[ ]`

**Output file:** `src/lib/life-graph/extraction/stage-b.ts`

**What:** Takes 10–20 notes for the same entity/sender, produces typed Entity facts. Writes entities and facts to Firestore. Reused by cold-start Phase 2 and ongoing ingest warm path.

**Signature:**
```ts
async function stageB(
  uid: string,
  entityId: string,            // the Person/Org entity these notes are about
  noteIds: string[],           // batch of 10-20 note IDs (must all be stageBStatus='pending')
): Promise<{ factIds: string[] }>
```

**LLM model:** Claude Sonnet 4.6 (higher quality than Flash for structured extraction).

**System prompt:**
```
You are a structured-data extractor for a personal assistant's Life Graph.
Given a batch of notes about one person or organization, extract facts in JSON.

Return a JSON object with:
{
  "stableFactUpdates": [
    { "slot": "job", "value": "Staff Engineer @ Stripe" },
    { "slot": "birthday", "value": "1989-06-12" }
  ],
  "timeSensitiveFacts": [
    { "slot": "meeting.time", "value": "2026-04-30T10:00:00", "sourceNoteId": "msg_xxx" },
    { "slot": "meeting.location", "value": "Starbucks on Market St", "sourceNoteId": "msg_xxx" }
  ],
  "commitments": [
    {
      "label": "Send Q2 report to Sarah",
      "dueDate": "2026-05-01",
      "owedByUser": true,
      "owedToEntityLabel": "Sarah Chen"
    }
  ],
  "events": [
    {
      "label": "Starbucks meeting with Sarah",
      "startTime": "2026-04-30T10:00:00",
      "participantEmails": ["sarah@stripe.com"]
    }
  ]
}

Rules:
- All datetimes must be ISO 8601 strings. Resolve relative references ("next Thursday")
  against each note's deliveryTime.
- Only include facts you are confident about. Omit uncertain ones.
- Slot names: home_address, birthday, food_preference, school_name, job, sender_class,
  meeting.time, meeting.location, flight.time, deadline.date, parent_of, spouse_of, employs, attends.
- Return only valid JSON, no markdown.
```

**User content:** concatenation of `noteText` from each note with headers:
```
[Note msg_123 | 2026-04-28 | From: Sarah Chen <sarah@stripe.com>]
Sarah wants to move Thursday's Starbucks meeting from 10am to 12pm.
signals: [meeting_reschedule, work_context]

[Note msg_124 | 2026-04-29 | From: Sarah Chen <sarah@stripe.com>]
...
```

**After LLM response:**
1. For each `stableFactUpdate`: call `writeOrSupersedeFact` (WU-04) with `factType='stable'`.
2. For each `timeSensitiveFact`: call `writeOrSupersedeFact` with `factType='time_sensitive'`, `effectiveTime` from the source note's `deliveryTime`.
3. For each `commitment`: upsert a new Entity of type `commitment` in drawer `commitments`.
4. For each `event`: upsert a new Entity of type `event` in drawer `commitments`.
5. Mark all processed notes: `markNoteStageB(uid, noteId, 'processed', factIds)`.
6. Accumulate and return all produced `factIds`.

**Cost tracking:** estimate `~$0.003` per batch call. Call `incrementIngestJobCost` if inside a cold-start job.

---

### WU-11: Entity Identity Resolution `[ ]`

**Output file:** `src/lib/life-graph/extraction/identity-resolution.ts`

**What:** Before writing any new entity, check if an equivalent entity already exists. Prevents duplicate Person/Org entities. Phase 1 covers the straightforward cases.

**Signature:**
```ts
async function resolvePersonOrOrg(
  uid: string,
  email: string,
  label: string,
): Promise<string | null> // returns existing entityId or null
```

**Logic:**
1. `findEntityByEmail(uid, email)` — exact email address match. If found, return `entity.id`.
2. If email is unknown (e.g., name-only reference), return `null` — Stage B creates a new entity with a generated ID. Name-based dedup is Phase 2 (needs LLM semantic matching).

**Event dedup:**
```ts
async function resolveEvent(
  uid: string,
  label: string,
  startTime: Date,
  participantEmails: string[],
): Promise<string | null>
```
Phase 1: dedup only by `startTime` window ± 30 minutes AND participant email overlap ≥ 1. Full subject-clustering identity is Phase 2.

---

### WU-12: Cold-Start Phase 2 — Deep Extraction Orchestrator `[ ]`

**Output file:** `src/lib/life-graph/cold-start/phase2-deep-extraction.ts`

**What:** Orchestrates Stage A + Stage B over the top 30–50 entities from Phase 1, pulling up to 80 emails per entity.

**Steps:**
1. Load ranked entity list (from Phase 1 output, sorted by Phase 0 composite score).
2. Slice to top 50 (or stop when cost cap is approached — reserve 20% budget for Phases 3 + 4).
3. For each entity:
   a. Look up sender email from the entity's `emailAddresses[0]`.
   b. Fetch up to 80 messages from that sender within `backfillWindowMonths` using `searchMessages` (Yahoo search API, query: `from:{email}`).
   c. For each message: fetch body via `getMessageBody`, run Stage A (WU-09).
   d. After Stage A completes for all messages: batch notes into groups of 15, run Stage B (WU-10) per group.
   e. Check cost cap. If capped: set `status='capped'`, stop, return.
4. Update `Profile.backfillStatus.phase = 3, progress` after each entity.
5. On completion: `phase = 4`.

**Concurrency:** Process entities sequentially (not in parallel) to avoid thundering-herd on the LLM API and to keep cost estimation accurate.

**Retry policy:** If Stage A or Stage B throws on a single message, log and continue (don't fail the whole batch). Increment `IngestJob.errorCount`.

---

### WU-13: Cold-Start Phase 3 — Thread Sweep (Notes-Only) `[ ]`

**Output file:** `src/lib/life-graph/cold-start/phase3-thread-sweep.ts`

**What:** Scan for threads with ≥ 3 emails that are **not** already covered by Phase 2 entities. In Phase 1, write Stage A notes only — no Stage B structuring. These notes are available for Phase 2 upgrade (when drawer 2 / life_threads ships).

**Steps:**
1. Fetch inbox messages from the backfill window (paginated, up to 2000 messages).
2. Group by `conversationId`. Filter groups with ≥ 3 messages.
3. For each thread group: exclude threads whose primary sender email matches a Phase 2 entity `emailAddresses`.
4. For remaining threads: run Stage A (WU-09) on each message. Do not run Stage B. Set `stageBStatus = 'pending'` — these will be picked up when Phase 2 life_threads drawer ships.
5. No entity creation in this phase.

**Cost:** Stage A only — approximately `$0.0005` per note. Phase 3 is bounded to 200 such messages (env var `LIFE_GRAPH_PHASE3_MAX_MESSAGES`).

---

### WU-14: Cold-Start Phase 4 — Top-of-Mind Seeding `[ ]`

**Output file:** `src/lib/life-graph/cold-start/phase4-topofmind.ts`

**What:** Time-boxed pass over the last 14 days of important-scored mail to bootstrap the commitments drawer with hot, imminent items.

**Steps:**
1. Fetch all inbox messages from the last 14 days (use `listMessages` with pagination).
2. Classify each via content-tier regex (WU-09 logic). Skip `contentTier = 'skip'` messages.
3. Run Stage A for all non-skip messages.
4. Run Stage B in batches of 15, with a special instruction in the prompt: *"Focus only on commitments (deadlines, action items, meetings) due within the next 30 days."*
5. For each commitment/event entity written, compute clocks:
   - `entryClock = now` (already within 14-day window — immediately top-of-mind eligible).
   - `decayClock = event.startTime + 2 days` (for events) or `commitment.dueDate + 3 days` (for deadlines).
   - Leave `entryClock/decayClock = null` for entities with no known date.
6. Set `Profile.backfillStatus.phase = 4, completedAt = now`.

**Notes:**
- Phase 4 intentionally re-processes some messages that Phase 2 already processed. Delivery-time semantics (shared invariant) ensure idempotency — Stage B will find the existing facts and perform reminder appends rather than duplicating.
- Top-of-mind filtering (entryClock/decayClock queries) is consumed by the wiki_agent in Phase 2 of the product. For Phase 1, the clocks are written but not yet used.

---

### WU-15: Backfill Trigger API + Cloud Run Job Endpoint `[ ]`

**Output files:**
- `app/api/life-graph/backfill/start/route.ts` — public Next.js API route
- `app/api/life-graph/backfill/run/route.ts` — internal Cloud Run job endpoint (protected by service account)

**`/api/life-graph/backfill/start` (POST):**
1. Auth via Bearer token (Yahoo user token).
2. Verify profile exists (WU-05 must have run).
3. Create an IngestJob (`kind='cold_start', phase=0, status='pending'`).
4. Kick off Cloud Run job by making an authenticated POST to the Cloud Run service URL at `/api/life-graph/backfill/run` with the `uid` and `jobId`.
   - Use `GOOGLE_APPLICATION_CREDENTIALS` (set to `twiliotest-admin-key.json` path in Cloud Run env) to get an ID token for the service-to-service call.
5. Return `{ jobId }`.

**`/api/life-graph/backfill/run` (POST, internal):**
1. Verify request comes from the service account (check the `Authorization` header for a valid Google ID token for the service account `calproxy-service-account@twiliotest-8d802.iam.gserviceaccount.com`).
2. Extract `uid`, `jobId` from body.
3. Run phases 0 → 1 → 2 → 3 → 4 in sequence, calling each phase function (WU-07 through WU-14).
4. After each phase: update `IngestJob.phase`, `Profile.backfillStatus`.
5. On completion: `IngestJob.status = 'completed'`, `IngestJob.completedAt = now`.
6. On error: `IngestJob.status = 'failed'`, increment `errorCount`.

**Progress polling endpoint:**
`GET /api/life-graph/backfill/status/[jobId]` — reads IngestJob doc and returns `{ phase, progress, status, costSpent }`.

**Note on Yahoo token:** The backfill job needs the user's Yahoo Bearer token to call the Yahoo Mail API. The token must be included in the `/backfill/run` POST body (encrypted or passed as a short-lived secret). Phase 1 stores the token in the IngestJob doc in Firestore (encrypted at rest by Google-managed key per Firestore config). Rotate / revoke handling is deferred to Phase 2.

---

## Group C — Ongoing Ingest

---

### WU-16: Ongoing Ingest — Step 1 Dictionary Lookup `[ ]`

**Output file:** `src/lib/life-graph/ingest/dictionary-lookup.ts`

**What:** Given a sender email address, return the sender's tier from the graph. If unknown, run Phase 1 sender profiling on the fly and write the result.

**Signature:**
```ts
async function lookupSenderTier(
  uid: string,
  token: string,
  senderEmail: string,
  senderName: string,
): Promise<{ tier: SenderTier; entityId: string | null; confidence: number }>
```

**Logic:**
1. `findEntityByEmail(uid, senderEmail)` → if found, `getCurrentFact(uid, entityId, 'sender_class')`.
2. If `fact.status === 'current'` and `fact.confidence >= 0.5`: return `{ tier: fact.value, entityId, confidence }`.
3. If no entity or `confidence < 0.5` or fact missing:
   a. Fetch 5 recent messages from this sender (Yahoo search API).
   b. Run the Phase 1 single-sender profiling prompt (same as WU-08).
   c. Upsert entity + sender_class fact.
   d. Return inferred tier.
4. If the LLM call fails or returns low confidence: default to `tier = 'conditional'`.

---

### WU-17: Ongoing Ingest — Steps 2–3 Content Escalation & Gate `[ ]`

**Output file:** `src/lib/life-graph/ingest/content-gate.ts`

**What:** Decides whether a message goes to deep ingest. No LLM — cheap regex cascade.

**Signature:**
```ts
function evaluateIngestGate(
  tier: SenderTier,
  subject: string,
  snippet: string,
): { decision: 'deep_ingest' | 'skip'; reason: string }
```

**Logic:**
```
important → deep_ingest (always)
junk      → skip (always)
conditional:
  1. Transactional keyword match in subject → deep_ingest
     Pattern: /confirmation|booking|reservation|receipt|shipped|delivered|
               ticket|itinerary|your trip|flight|payment|invoice/i
  2. Promotional blocklist match in subject → skip
     Pattern: /% off|\bsale\b|\bdeal\b|limited time|exclusive offer|last chance/i
  3. Fallback: skip (conservative default; retroactive boost catches false negatives)
```

**Return:** `{ decision, reason }` — `reason` is a short string for logging (e.g., `'transactional_keyword'`, `'promotional_blocklist'`, `'tier_important'`).

---

### WU-18: Ongoing Ingest — Steps 4–9 Deep Ingest Pipeline `[ ]`

**Output file:** `src/lib/life-graph/ingest/deep-ingest.ts`

**What:** Core ongoing-ingest function. Runs for every new email that passes the gate (WU-17). Reuses Stage A (WU-09), Stage B (WU-10), identity resolution (WU-11).

**Signature:**
```ts
async function deepIngest(
  uid: string,
  token: string,
  message: {
    id: string;
    conversationId: string;
    deliveryTime: Date;
    from: { name: string; email: string };
    subject: string;
    isRead: boolean;
    isStarred: boolean;
  },
  options: { path: 'hot' | 'warm' }
): Promise<{ noteId: string; factIds: string[] }>
```

**Steps (mirrors pipeline doc Part 2):**

**Step 4 — Stage A:**
1. Fetch full message body via `getMessageBody`.
2. If body is short (< 200 chars) and no quote marker detected: fetch prior message in thread and append.
3. Run Stage A → write note. If `contentTier = 'skip'`: return early, no further processing.

**Step 5 — Stage B (latency-tiered):**
- `hot` path: run Stage B immediately after Stage A.
  - Trigger condition: `message.from.email` matches a `important`-tier entity OR message contains an active commitment keyword (`tomorrow|today|urgent|asap|deadline`).
- `warm` path: set `stageBStatus = 'pending'` and return. A background warm-batch job (triggered every 10 minutes via cron or Cloud Run job) picks up pending notes.

**Step 6 — Merge with identity resolution:**
- Before writing entities from Stage B output, run `resolvePersonOrOrg` and `resolveEvent` (WU-11).
- Reuse existing entities where found; create new ones where not.

**Step 7 — Sensitivity routing (Phase 1 stub):**
- Scan fact values for regex patterns indicating sensitivity (financial account numbers, health keywords, passwords). If matched, skip writing to `facts/` and write to `sensitiveFacts/` instead.
- Phase 1 uses a simple blocklist. Full classification model is Phase 2.
- Sensitivity blocklist patterns:
  ```
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/  // card number
  /\bSSN\b|social security/i
  /\b(password|passwd|secret|token)\s*[:=]/i
  /\b(OTP|one.?time.?pass)/i
  ```

**Step 8 — Top-of-mind clock update:**
- For events: `entryClock = max(now, startTime - 14 days)`, `decayClock = startTime + 2 days`.
- For commitments: `entryClock = max(now, dueDate - 14 days)`, `decayClock = dueDate + 3 days`.
- If no date: skip clock assignment.

**Returns:** `{ noteId, factIds }`.

**API endpoint:** `POST /api/life-graph/ingest/message` — wraps `deepIngest`. Called from the mail client whenever a new email lands. Request body: `{ messageId, conversationId, deliveryTime, from, subject, isRead, isStarred }`.

---

### WU-19: Ongoing Ingest — Step 10 Retroactive Boost Hook `[ ]`

**Output file:** `src/lib/life-graph/ingest/retroactive-boost.ts`

**What:** Re-processes a previously-skipped email when the user engages with it.

**Signature:**
```ts
async function retroactiveBoost(
  uid: string,
  token: string,
  messageId: string,
): Promise<void>
```

**Logic:**
1. Check if `notes/{messageId}` exists:
   - If exists and `contentTier !== 'skip'`: already ingested. Return.
   - If exists and `contentTier === 'skip'`: upgrade to `two_stage` and continue.
   - If not exists: run from scratch.
2. Run `deepIngest` with `path = 'hot'` (elevated authority — equivalent to manual user-add).
3. The delivery-time invariant ensures this produces correct supersedes ordering even if other facts have been written since.

**Trigger:** Called from the `POST /api/life-graph/ingest/message` endpoint when `{ trigger: 'retroactive', messageId }` is in the request body. This is invoked by the frontend when the user stars, flags, or replies to a message (via the existing star/mark-read action hooks in the mail UI).

---

## Group D — Validation

---

### WU-20: Firestore Composite Indexes `[ ]`

**Output file:** `firestore.indexes.json` (at repo root, used by `firebase deploy --only firestore:indexes`)

**What:** Define all composite indexes needed for Phase 1 hot query paths.

```json
{
  "indexes": [
    {
      "collectionGroup": "facts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "entityId", "order": "ASCENDING" },
        { "fieldPath": "slot",     "order": "ASCENDING" },
        { "fieldPath": "status",   "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "entities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "emailAddresses", "arrayConfig": "CONTAINS" },
        { "fieldPath": "type",           "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "entities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type",      "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "entities",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type",       "order": "ASCENDING" },
        { "fieldPath": "resolvedAt", "order": "ASCENDING" },
        { "fieldPath": "dueDate",    "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "stageBStatus", "order": "ASCENDING" },
        { "fieldPath": "deliveryTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "ingestJobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "kind",   "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Deploy:** `firebase use twiliotest-8d802 && firebase deploy --only firestore:indexes`

**Notes:** Firestore automatically creates single-field indexes. Only composite indexes need explicit declaration. The 6 above are well within the 200-per-database limit.

---

### WU-21: Integration Test Script `[ ]`

**Output file:** `scripts/test-life-graph-ingest.ts`

**What:** End-to-end smoke test for the full Phase 1 pipeline using a real Yahoo token.

**Steps the script runs:**
1. Load `YAHOO_TEST_TOKEN` from `.env`.
2. `POST /api/life-graph/profile/init` → verify profile doc in Firestore.
3. `POST /api/life-graph/backfill/start` → receive `jobId`.
4. Poll `GET /api/life-graph/backfill/status/{jobId}` every 5 seconds until `status` is `completed` or `capped` (timeout: 10 minutes).
5. Query Firestore directly (using the admin SDK) and assert:
   - At least 5 entities in `people_orgs` drawer.
   - At least 1 entity in `commitments` drawer.
   - At least 1 current fact with `slot = 'sender_class'`.
   - At least 1 note with `stageBStatus = 'processed'`.
   - No entity has both `status = 'current'` facts for the same `entityId + slot` (uniqueness invariant).
6. Send a test `POST /api/life-graph/ingest/message` for a known message ID.
7. Verify a note was written for that message ID.
8. Print a summary report.

**Run:** `YAHOO_TEST_TOKEN=<token> pnpm tsx scripts/test-life-graph-ingest.ts`

---

## Build Order

Sequential — each group depends on the previous:

```
Group A (WU-01 → WU-05)         ~2–3 days
  ↓
Group B (WU-06 → WU-15)         ~5–7 days
  ↓
Group C (WU-16 → WU-19)         ~3–4 days
  ↓
Group D (WU-20 → WU-21)         ~1 day
```

Within Group B, WU-09 (Stage A) and WU-11 (identity resolution) can be built in parallel with WU-07/WU-08 since they have no inter-dependency.

**Estimated total:** 11–15 engineering days for one engineer.

---

## Environment Variables Required

Add to `env.yaml` (Cloud Run) and `.env` (local):

```yaml
# Firestore / GCP
GOOGLE_APPLICATION_CREDENTIALS: /path/to/twiliotest-admin-key.json  # set automatically in Cloud Run
FIRESTORE_DATABASE_ID: life-graph

# Life Graph cost caps
LIFE_GRAPH_COLD_START_BUDGET_USD: "10"
LIFE_GRAPH_WARM_BATCH_BUDGET_USD: "0.5"
LIFE_GRAPH_PHASE3_MAX_MESSAGES: "200"

# Backfill
LIFE_GRAPH_BACKFILL_WINDOW_MONTHS: "12"
LIFE_GRAPH_PHASE2_MAX_ENTITIES: "50"
LIFE_GRAPH_PHASE2_MAX_MESSAGES_PER_ENTITY: "80"
```

---

## Phase 1 Non-Goals (Deferred to Phase 2)

- `wiki_agent` service — consumers read graph directly via Firestore admin SDK in Phase 1 tests.
- Drawer 2 (`life_threads`) and drawer 4 (`top_of_mind_prefs`) writes.
- Full sensitivity classifier (Phase 1 uses regex blocklist).
- Time-based decay / pin / gardener agent.
- Multi-account support.
- AlertRule / Alert / ExternalSystemAlert entity types.
- User-write layered paths (explicit-remember, ambient, corrections).
- Retroactive boost sender-pattern learning loop.
- Name-based entity identity resolution (Phase 1 uses email-address dedup only).

---

## Cross-References

- [2026-04-life-graph-strategy.md](./2026-04-life-graph-strategy.md) — R1–R10 requirements this spec implements.
- [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md) — Firestore schema used throughout.
- [2026-04-life-graph-ingest-pipeline-design.md](./2026-04-life-graph-ingest-pipeline-design.md) — pipeline lifecycle this spec translates to code.
