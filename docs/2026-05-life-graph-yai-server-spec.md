# Life Graph Cold-Start — YAI Server Implementation Spec

**Audience:** YAI server team (Fastify, Node.js, backend-only)
**Date:** 2026-05-05
**Status:** Implementation handoff for the simplified two-endpoint cold-start API

The Next.js facade has been collapsed to two endpoints plus a status poll. When `LIFE_GRAPH_BACKEND=yai` is set, the Next.js layer just proxies; the YAI server owns all Yahoo API calls, LLM calls, and Firestore writes. This document is the contract + behaviour spec for that work.

The YAI server is expected to mirror the local implementation that lives under `src/lib/life-graph/` in the Next.js repo. Where this spec is silent, treat that code as the source of truth.

### Context for the YAI implementation

- **Runtime:** Fastify, Node.js. No UI work; only HTTP routes + background work + Firestore writes.
- **Existing base path:** mount new routes under `/yai/life-graph-agent` (already registered by the Next.js HTTP client `yaiLifeGraphPost` / `yaiLifeGraphGet`). Routes inherit the existing auth middleware that validates the Yahoo bearer token + the `X-App-Token` HMAC header.
- **What to port from the Next.js repo:** the *logic* under `src/lib/life-graph/` is the canonical reference. The route handlers themselves use `NextResponse` / Web `Request` and are not directly portable — re-express them as Fastify route handlers (`fastify.post('/backfill/start', { schema, handler })`). The phase implementations and the Mastra agents underneath are framework-agnostic and can be lifted as-is.
- **Background jobs:** `runDeepExtraction` returns 202 and continues work after the response is sent. Either run in-process (a fire-and-forget async function — fine for a single-instance server) or hand off to a worker queue if the YAI server is multi-instance / autoscaled. The status endpoint is the only progress channel, so as long as the worker writes to Firestore, the UI is happy.
- **Firestore:** use the Admin SDK with the same project / namespace the Next.js side uses (`users/{uid}/...`). Both servers read and write the same docs.
- **LLM provider:** Mastra is one option; if the YAI server doesn't already use Mastra, call the underlying Gemini API directly with the prompts in §5 and §6. Model id and prompt text are what matter — the SDK choice is yours.

---

## 1. Endpoint surface

All endpoints are mounted under the existing YAI base path `/yai/life-graph-agent`. Auth: pass-through `Authorization: Bearer <yahoo-token>` header + `X-App-Token` HMAC header (already established).

| Method | Path | Sync? | Purpose |
|---|---|---|---|
| `POST` | `/backfill/start` | **Synchronous** | Init profile + run phase 0 structural scan. Returns ranked candidates. |
| `POST` | `/backfill/runDeepExtraction` | **Async (202)** | Take user-approved senders, run phase 1 + phase 2 in the background. |
| `GET`  | `/backfill/status/{jobId}` | Sync | Poll progress: phase, status, cost, per-sender LLM results, per-entity progress. |

There is **no separate** profile-init, approve, or run endpoint anymore. The browser invokes `/backfill/start`, presents the candidates with the top 10 pre-selected, then invokes `/backfill/runDeepExtraction` once with the approved set.

### 1.1 `POST /backfill/start`

Request:
```json
{ "accountId": "180001" }
```

Behaviour (synchronous, expect 5–30s wall time depending on mailbox size):
1. Resolve `uid = guid_accountId` from the bearer token.
2. Resolve account `email` via `GET /mailboxes/@.id==<mailboxId>/accounts` (the call already used by the existing `/whoami` route).
3. Upsert the user profile doc at `users/{uid}/profile/main` with the schema in §3.
4. Create a new ingest job doc at `users/{uid}/ingestJobs/{jobId}` (schema in §3) with `status: "running"`, `phase: 0`, `costBudget: $LIFE_GRAPH_COLD_START_BUDGET_USD` (default `10`).
5. Run **Phase 0 — Structural Scan** (§4) and accumulate `JobCall` log entries.
6. Persist the top-200 candidates onto the job (`phase0Candidates`), set `status: "pending"`, flush call log.
7. Return.

Success response (200):
```json
{
  "jobId": "uuid",
  "uid": "guid_accountId",
  "email": "owner@yahoo.com",
  "candidates": [
    {
      "email": "alice@stripe.com",
      "name": "Alice Chen",
      "score": 290,
      "signals": { "sentTo": true, "starCount": 3, "threadCount": 5, "openWithDwellCount": 12 }
    }
  ]
}
```

Errors: `400` missing `accountId`, `401` missing token, `500` other. Already-existing profile is fine (idempotent upsert; patch missing email if backfilled).

### 1.2 `POST /backfill/runDeepExtraction`

Request:
```json
{
  "accountId": "180001",
  "jobId": "uuid-from-start",
  "approvedEmails": ["alice@stripe.com", "bob@gmail.com"]
}
```

Behaviour (returns immediately, work continues in background):
1. Validate inputs. Reject if `approvedEmails` is empty or none of them match `phase0Candidates` on the job.
2. Resolve `userEmail` (from profile, or fall back to `/mailboxes/.../accounts`).
3. Update the job: `status: "running"`, `phase: 1`, `approvedCandidateEmails: <list>`.
4. Return 202 to the client.
5. **In the background**:
   - Run **Phase 1 — Sender Profiling** (§5) on the approved subset of `phase0Candidates`. Persist `phase1EntityIds` onto the job.
   - Run **Phase 2 — Deep Extraction** (§6) on those entityIds. Includes the consolidation pass.
   - On normal completion, set `status: "completed"`, `completedAt: now`.
   - If cost cap hit during phase 1 or 2, leave `status: "capped"` (set by the cost-cap logic itself).
   - On uncaught error, set `status: "failed"`.

Success response (202):
```json
{ "jobId": "uuid", "accepted": 10 }
```

The **status endpoint** is the only progress channel — there is no streaming response.

### 1.3 `GET /backfill/status/{jobId}?accountId=180001`

Read-through of the ingest job doc. Response shape:
```json
{
  "phase": 2,
  "status": "running",
  "costSpent": 0.0731,
  "errorCount": 0,
  "calls": [ { "ts": 1778007204498, "method": "GET", "url": "...", "status": 200 } ],
  "callCount": 44,
  "phase1SenderResults": [ /* see §5 */ ],
  "phase2EntityProgress": [ /* see §6 */ ],
  "phase2Consolidation": { "stubsMerged": 2, "duplicatesMerged": 0, "participantsResolved": 1 }
}
```

Polled every 5s by the UI. `calls` is capped at the first 500 entries, `callCount` is the true total.

---

## 2. Job state machine

```
created → running         (start: phase 0 in progress)
running → pending         (start: phase 0 done, awaiting runDeepExtraction)
pending → running         (runDeepExtraction: phase 1+2 kicking off)
running → completed       (phase 2 finished cleanly)
running → capped          (cost cap hit during phase 1 or 2)
running → failed          (uncaught error)
```

`phase` advances monotonically: 0 (start of /start) → 1 (after phase 0) → 2 (after phase 1) → 3 (after phase 2). The number is informational; the UI renders progress against `min(phase, 2)` since phases 3/4 are dropped.

---

## 3. Firestore schema

All paths are namespaced under `users/{uid}/`.

### `profile/main`
```ts
{
  uid: string;
  email: string;
  timezone: "UTC";
  backfillWindowMonths: 12;            // env LIFE_GRAPH_BACKFILL_WINDOW_MONTHS
  backfillStatus: { phase: 0|1|2|3|4; progress: 0..1; completedAt: Timestamp|null; costSpent: number };
  pinnedEntityIds: string[];
  consentScope: { digest: "never"; triage: "never"; reply: "never" };
  digestLastDeliveredAt: Timestamp|null;
}
```

### `ingestJobs/{jobId}`
```ts
{
  id: string;
  kind: "cold_start";
  phase: 0|1|2|3|4;
  windowStart: Timestamp;              // now - backfillWindowMonths
  windowEnd: Timestamp;                // now
  costBudget: number;                  // dollars, default 10
  costSpent: number;
  status: "pending"|"running"|"completed"|"failed"|"capped";
  errorCount: number;
  processedMessageIds: string[];
  calls: JobCall[];                    // capped at 500
  callCount: number;                   // FieldValue.increment

  // Phase 0 outputs
  phase0Candidates?: Array<{ email; name; score; signals: {sentTo,starCount,threadCount,openWithDwellCount} }>;

  // runDeepExtraction inputs / Phase 1 outputs
  approvedCandidateEmails?: string[];
  phase1EntityIds?: string[];
  phase1SenderResults?: SenderProfilingResult[];

  // Phase 2 outputs
  phase2EntityProgress?: Phase2EntityProgress[];
  phase2Consolidation?: { stubsMerged; duplicatesMerged; participantsResolved };

  createdAt: Timestamp;
  completedAt: Timestamp|null;
  token?: string;
}
```

### `entities/{entityId}` and `notes/{noteId}`
Identical to the local Next.js types — see `src/lib/life-graph/types.ts`. The YAI server writes these exactly the same way; the Next.js graph viewer reads them directly.

---

## 4. Phase 0 — Structural Scan

**Goal:** rank all senders the user actually engages with (no LLM, pure heuristics over Yahoo API metadata) and return the top 200.

**Window:** last 12 months (`backfillWindowMonths`). Messages outside the window are filtered by `internalDate`.

### Yahoo API calls

All calls use base `/mailboxes/@.id==<mailboxId>` after resolving `mailboxId` from `getMailboxId(token)`.

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | `GET` | `/folders` | Find SENT and INBOX folder ids for the account. |
| 2 | `GET` | `/messages/@.select==q?q=folderId:<sent>+groupBy:conversationId+offset:0+count:200&responseTransform=btd_lm_ios` | Sent folder: outbound recipients + thread participation. |
| 3 | `GET` | `/messages/@.select==q?q=folderId:<inbox>+groupBy:conversationId+offset:0+count:500&responseTransform=btd_lm_ios` | Inbox: star + read + thread signals. |
| 4 | `GET` | `/messages/@.select==q?q=is:flagged+acctId:<accountId>+count:200&responseTransform=btd_lm_ios` | Starred (account-scoped, catches stars outside the inbox window). |
| 5 | `GET` | `/messages/@.select==q?q=acctId:<accountId>+is:read+count:200&responseTransform=btd_lm_ios` | Read messages (broader engagement). |

Total: **5 Yahoo calls per backfill start**, regardless of mailbox size.

### Sender filtering

Bulk senders are excluded *before* scoring. A sender is bulk if its email matches either:
- `BULK_LOCAL_PART` regex against the local-part: `/^(no[_.-]?reply|noreply|donotreply|do-not-reply|notifications?|alerts?|mailer|bounce|auto|newsletter|deals?|offers?|promotions?|marketing|info|hello|support|subscriptions?)$/i`
- `BULK_DOMAIN_PART` regex against the domain: `/\b(groupon|livingsocial|woot|dealhack|retailmenot|slickdeals|sendgrid|mailchimp|klaviyo|constantcontact|exacttarget|marketo|eloqua|responsys|salesforce\.email|em\..*|e\.[a-z]+\.|r\.[a-z]+\.|click\.[a-z]+\.|link\.[a-z]+\.|track\.[a-z]+\.|email\.[a-z]+\.|mail\.[a-z]+\.)\b/i`

### Per-sender accumulators

Build a `Map<email, SenderData>` where `SenderData = { name, lastSentMs, starCount, threadedConvIds: Set<convId>, openWithDwellCount }`.

- **Sent folder messages**: for each `to` recipient, update `lastSentMs = max(lastSentMs, internalDate)`. If the conversation has >1 message (read off `resp.conversations[].messageIds`), add the convId to `threadedConvIds`.
- **Inbox messages**: for each message's `from`, increment `starCount` if `flags.flagged`, else increment `openWithDwellCount` if `flags.read`. If conversation has >1 message, add convId to `threadedConvIds`.
- **Starred**: for each `from`, increment `starCount`.
- **Read**: for each `from` whose message is not flagged, increment `openWithDwellCount`.

Thread credit is **per unique conversation**, not per message — this prevents reply-chain inflation.

### Scoring

```
compositeScore =
    sentScore(lastSentMs)          // recency-tiered: <30d=120, <90d=100, <180d=70, ≤365d=40, never=0
  + starCount         * 30
  + threadedConvIds.size * 20
  + openWithDwellCount * 5
```

Sort descending, slice top 500 internally, return top 200 in the API response. Signals object ships with each candidate so the UI can show why it ranked.

At end of phase: set job `phase: 1`, profile `backfillStatus.phase: 1`.

**No LLM calls in phase 0.** No cost increment.

---

## 5. Phase 1 — Sender Profiling

**Goal:** for each approved sender, fetch a sample of their emails and have an LLM classify them. Each accepted sender becomes an entity in the people_orgs drawer.

Cap: top 200 of the approved list (typically the user approves ~10, so this is a soft ceiling).

### Yahoo API calls

For **each** approved sender:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/messages/@.select==q?q=from:<email>+offset:0+count:10` | Pull up to 10 recent messages for sample subjects/snippets. |

So with 10 approved senders, phase 1 makes **10 Yahoo calls** (one per sender).

### LLM call: `lifeGraphClassifierAgent`

- **Model:** `google/gemini-3.1-flash-lite-preview`
- **Mode:** single-turn `generate(promptText)` per sender. JSON output, no markdown fences.
- **Cost accounting:** `$0.001` per sender (incremented after each classification).
- **Cap check:** every 10 senders, reload the job and abort if `costSpent ≥ costBudget`.

#### System instructions (verbatim)

```
You are classifying an email sender for a personal assistant. Given a sample of recent emails from one sender, return a JSON object with these exact fields:
- entityType: "person" | "organization"
- relationshipClass: "family" | "work" | "school" | "doctor" | "vendor" | "service" | "newsletter" | "unknown"
- roleLabel: short human label, e.g. "Boss at Stripe", "Kid's school", "Amazon orders"
- senderTier: "important" | "conditional" | "junk"
- confidence: 0.0 to 1.0

Respond with only valid JSON, no markdown fences.
```

#### User prompt template

```
Mailbox owner: {{userEmail}}
Sender: {{name}} <{{email}}>

Recent emails:
- {{subject1}}: {{snippet1_first_120_chars}}
- {{subject2}}: {{snippet2_first_120_chars}}
…
```

If message fetch failed, the body is `(could not fetch messages)`.

### Result handling

For each sender, build a `SenderProfilingResult`:
```ts
{
  email; name; compositeScore;
  emailSamples: Array<{ subject; snippet }>;  // first 5 only
  promptText;            // capped at ~600 chars in storage (use full when calling LLM)
  llmResponse;           // raw text
  decision: "accepted" | "rejected" | "failed";
  rejectReason?: "fetch_failed"|"json_parse_failed"|"llm_error"|"confidence_too_low";
  errorMessage?: string;
  profile?: { entityType; relationshipClass; roleLabel; senderTier; confidence };
}
```

**Decision rule:** accept iff fetch succeeded AND JSON parsed AND `confidence ≥ 0.5`. Otherwise reject with the matching reason.

**On accept:** create an Entity (`drawer: "people_orgs"`, `type: profile.entityType`, `label: profile.roleLabel`, `aliases: [sender.name]`, `emailAddresses: [sender.email]`, `senderClass: profile.senderTier`, `senderClassConfidence: profile.confidence`). Push the entity id into the returned `entityIds` array.

**Persistence cadence:** flush `phase1SenderResults` to Firestore in batches of 10 (via `arrayUnion`), and again at the end. The UI streams these into the "Phase 1 — Sender Profiling Log" panel.

At end of phase: job `phase: 2`, profile `backfillStatus.phase: 2`.

---

## 6. Phase 2 — Deep Extraction

**Goal:** for each entity created in phase 1, pull a deep sample of their email history, run a two-step LLM pipeline (note → extractor) to populate dossier, relationships, events, and commitments.

Hard cap: **`LIFE_GRAPH_PHASE2_MAX_ENTITIES`** (default `50`) entities per job.

Cost reserve: phase 2 stops when `costSpent ≥ costBudget`. The consolidation pass below still runs even on cost-cap exit.

### Per-entity Yahoo API calls

For **each** entity (one whose phase 1 result was accepted):

1. **Conversation search (1 call):**
   `GET /messages/@.select==q?q=from:<senderEmail>+groupBy:conversationId+offset:0+count:20&responseTransform=btd_lm_ios`
   Yields representative messages + conversations with their `messageIds[]`. Take the union: representative ids ∪ last 3 message ids per conversation. De-dupe.

2. **Batch message fetch (1 call per 20 ids):**
   `GET /messages/@.select==q?q=id:(<id1>%20<id2>%20…)&responseTransform=btd_lm_ios`
   Filter messages older than `cutoff = now - backfillWindowMonths * 30 days`.

So per entity: roughly **2–4 Yahoo calls** (search + 1–3 batches).

### LLM call A: `lifeGraphNoteAgent`

- **Model:** `google/gemini-3.1-flash-lite-preview`
- **Mode:** single-shot per entity, all messages packed into one prompt.

#### System instructions (verbatim)

```
You are a research analyst reviewing email(s) for a personal assistant's knowledge graph. Each email in the input is labelled with a message id like "[msg id: msg_xxx]" and an ISO date.

Write a concise free-form summary covering:
1. Who the sender is — name, role, organization, relationship to the mailbox owner
2. Stable facts — job title, company, relationship type, preferences, contact details
3. Other people, organizations, properties or assets referenced — kids, spouse, school, doctor, realtor, address, etc.
4. Meetings or events — topic, specific date/time, location, participants, whether it is recurring (and the recurrence pattern)
5. Commitments / action items — what is owed, by whom, to whom, by when
6. Active topics, threads, or ongoing situations

Rules:
- Be specific with dates, times, locations.
- Resolve relative references ("next Thursday", "tomorrow") against the email date shown in brackets.
- If multiple emails contradict each other (e.g. a rescheduled meeting), note the most recent value and flag the change.
- **Annotate every claim with the message id(s) it came from in square brackets.** Example:
    "Niti Patel is the mailbox owner's spouse [msg_123]. She works at Twilio (nitpatel@twilio.com) [msg_124, msg_125]."
    "Anvay's 5th birthday is on May 3 at the Hiller Aviation Museum, San Carlos [msg_126]."
    "Hriyaan has weekly soccer at the Irvington Community Center, Saturdays 8-9am, April 18 – May 17 2026 [msg_127]."
- Use the literal message id strings as they appear in the input — do not invent ids.
- Write in plain prose or bullets. **Do not output JSON.** A downstream structured extractor consumes your prose.
```

#### User prompt template

Messages are grouped by conversationId before formatting:
```
Mailbox owner: {{userEmail}}
Sender: {{entity.label}} <{{senderEmail}}>

=== Thread ({{N}} messages) ===
[msg id: {{m.id}} | {{YYYY-MM-DD}}] From: {{m.from.name}} <{{m.from.email}}>
Subject: {{m.subject}}
{{m.snippet}}

[msg id: ...]
...

=== Thread (1 message) ===
...
```

The output is free prose with inline `[msg_xxx]` citations. Persist as a `Note` doc:
- `id = phase2_<entityId>`
- `from = { name: entity.label, email: senderEmail }`
- `subject = "Phase 2 analysis — <entity.label>"`
- `notesText = LLM output`
- `messageRecords = [{ id, deliveryTime } for each source msg]`
- `deliveryTime = max(messageRecords[].deliveryTime)`
- `contentTier = "two_stage"`
- `stageBStatus = noteText ? "pending" : "failed"`

### LLM call B: `lifeGraphExtractorAgent` (Stage B)

Runs immediately after the note is persisted. Reads the prose and emits structured updates.

- **Model:** `google/gemini-3.1-flash-lite-preview`
- **Mode:** single-shot per entity-note. JSON output, no markdown fences.
- **Cost accounting:** `$0.004` (note step) + `$0.003` (Stage B) per entity = **$0.007 per entity** (debited via `incrementIngestJobCost`).

#### System instructions (verbatim)

```
You are a structured-data extractor for a personal assistant's Life Graph.
You receive a free-form prose analysis of emails. Each claim is annotated inline with the message id(s) it came from in square brackets, e.g. "[msg_123]" or "[msg_124, msg_125]". You must propagate these ids onto every structured item you produce, in a "sourceMessageIds" array.

The input may also include the existing "dossier" (markdown) for the primary entity and other entities the system already knows about. When that is present, your "dossier" output for those entities must be the COMPLETE updated dossier — preserve every dated claim and every [msg_xxx] citation from the existing dossier verbatim unless the new prose contradicts it. If the new prose contradicts an existing claim, keep both with their dates and let the reader pick the latest. Do not silently drop information.

Return a JSON object with the shape:
{
  "entityUpdates": [...],
  "newEntities": [...],
  "relationships": [...],
  "events": [...],
  "commitments": [...]
}
```

(Full schema with examples is in `src/mastra/agents/life-graph.ts` lines 79–168 — keep verbatim. Includes the rules block on `entityUpdates`, `newEntities`, `dossier`, `relationships`, `events`, `commitments`.)

#### User prompt template

```
Mailbox owner: {{userEmail}}
Primary entity: {{entity.label}} <{{entity.emailAddresses[0]}}>

Existing dossier for {{entity.label}}:           ← only if entity.dossier exists
{{entity.dossier}}

Email analysis:
[note {{n.sourceMessageId}} | {{YYYY-MM-DD}} | from {{n.from.name}} <{{n.from.email}}>]
{{n.notesText}}
```

#### Output handling

Parse JSON. On parse failure, mark note `stageBStatus: "failed"` and skip. On success:

1. **Entity resolution + creation** (for each entry in `entityUpdates ∪ newEntities`):
   - Try to find by email; fall back to find by label/alias.
   - If found, **patch** (add new email to `emailAddresses`, set `relationshipClass` if missing, append unseen label to `aliases`, union `sourceMessageIds`, clear `isStub` if previously stubbed, replace `dossier` if non-empty and changed).
   - Otherwise **create** with the LLM-supplied fields. Set `drawer = "commitments"` for type `event`/`commitment`, `"life_threads"` for `life_thread`, `"top_of_mind_prefs"` for `preference`, else `"people_orgs"`.

2. **Relationships**: for each `{ fromEntityLabel, slot, toEntityLabel, sourceMessageIds }`, resolve both labels (creating stubs with `isStub: true` if not seen), then upsert a `RelationshipEdge` on the from-entity. Idempotent on `(slot, toEntityId)` — refresh `lastVerified` and union `sourceMessageIds`.

3. **Events**: try to resolve an existing event via `resolveEvent(uid, label, startDate, participantEmails)` (composite query on `type=event` + `startTime` window — needs a Firestore index; fall through and create on lookup error). If new: resolve `participantEmails` to `participantIds` where possible (leave unresolved emails on `participantEmails`); set `isRecurring`/`recurrenceRule`/`nextOccurrence`/`seriesEndDate` for recurring events.

4. **Commitments**: counterparty resolution — if `owedToEntityLabel` matches the user (literal `"kevin"`, `"you"`, `"the user"`, `"mailbox owner"`, or matches `userEmail`/`userName`), use `uid`; otherwise resolve as a stub. Then set `owedBy`/`owedTo` based on `owedByUser`.

5. Mark all source notes `stageBStatus: "processed"`.

Per-entity progress is appended to `phase2EntityProgress`:
```ts
{
  entityId; email; label;
  msgsFetched; notesProduced; relationshipsProduced;
  status: "running"|"done"|"error"; errorMessage?;
  apiCalls: JobCall[];           // per-entity Yahoo calls
  llmCalls: Phase2LlmCall[];     // [{ agent: "noteAgent", batch: 1, promptText, responseText }, { agent: "extractorAgent", ... }]
}
```

### 6.1 Consolidation pass (always runs, even on cost-cap)

After the loop, run `consolidateGraph(uid)` — programmatic, no LLM. Three steps:
1. **Stub merging**: any entity with `isStub: true` whose label/email matches a non-stub entity is merged into the canonical one, rewriting any inbound relationship/`owedBy`/`owedTo` references and deleting the stub.
2. **Duplicate dedupe**: collapse entities with the same email or `(label, type)` pair.
3. **Event participants**: for any event with unresolved `participantEmails`, look them up and move into `participantIds`.

Result is stored on the job as `phase2Consolidation: { stubsMerged, duplicatesMerged, participantsResolved }`.

The reference implementation is `src/lib/life-graph/cold-start/consolidation.ts`.

---

## 7. Cost cap

- `costBudget` is the dollar cap on a single job. Default `$10`. Override via env `LIFE_GRAPH_COLD_START_BUDGET_USD`.
- `costSpent` is incremented at:
  - **Phase 1**: `+$0.001` per sender classification.
  - **Phase 2**: `+$0.004` after the noteAgent call, `+$0.003` after the extractorAgent call. Total `$0.007` per entity processed.
- Cap checks: every 10 senders in phase 1, after every entity in phase 2. When `costSpent ≥ costBudget`, set `status: "capped"` and break out of the loop. Consolidation still runs.

---

## 8. Logging conventions

- `JobCall { ts: epochMs, method: "GET"|"POST", url: <yahoo-path>, status: number|"err" }` — every Yahoo HTTP call is recorded. Buffer in memory and `arrayUnion`-flush at phase boundaries to avoid per-call writes; the first 500 are persisted, but `callCount` is the true total via `FieldValue.increment`.
- `Phase2LlmCall { agent, batch, promptText, responseText }` — both LLM calls per entity are persisted on the entity's progress entry so the UI can drill down.
- `phase1SenderResults` — flushed in batches of 10 via `arrayUnion`.

These logs are consumed by the dev console at `app/life-graph/page.tsx` (the Pipeline tab). Don't truncate `promptText`/`responseText` below ~600 chars; the UI shows them in full.

---

## 9. Environment variables

| Var | Default | Purpose |
|---|---|---|
| `LIFE_GRAPH_COLD_START_BUDGET_USD` | `10` | Per-job cost cap (dollars). |
| `LIFE_GRAPH_BACKFILL_WINDOW_MONTHS` | `12` | History window for phase 0 + phase 2. |
| `LIFE_GRAPH_PHASE2_MAX_ENTITIES` | `50` | Hard cap on entities processed in phase 2. |

---

## 10. What is *not* in scope

Phases 3 (thread sweep) and 4 (top-of-mind seeding) from the original `/backfill/run` flow are **dropped**. The matching summaries (`phase3Summary`, `phase4Summary`) and the `lifeGraphTopOfMindAgent` are no longer invoked. They can be added back later behind separate endpoints if/when implemented for real.

The `/profile/init`, `/backfill/run`, `/backfill/approve` endpoints on the YAI server should be removed once the new shape is live and the Next.js layer has cut over.

---

## 11. Reference files in the Next.js repo

| Concern | File |
|---|---|
| Endpoint contracts (proxy) | `app/api/life-graph/backfill/start/route.ts`, `app/api/life-graph/backfill/runDeepExtraction/route.ts`, `app/api/life-graph/backfill/status/[jobId]/route.ts` |
| Phase 0 implementation | `src/lib/life-graph/cold-start/phase0-structural.ts` |
| Phase 1 implementation | `src/lib/life-graph/cold-start/phase1-sender-profiling.ts` |
| Phase 2 implementation | `src/lib/life-graph/cold-start/phase2-deep-extraction.ts` |
| Stage B (extractor) | `src/lib/life-graph/extraction/stage-b.ts` |
| Identity resolution | `src/lib/life-graph/extraction/identity-resolution.ts` |
| Consolidation | `src/lib/life-graph/cold-start/consolidation.ts` |
| LLM agents + prompts | `src/mastra/agents/life-graph.ts` |
| Firestore schema (types) | `src/lib/life-graph/types.ts` |
| Firestore helpers | `src/lib/life-graph/db.ts` |
| Yahoo API helper | `src/mastra/helpers/yahoo-api.ts` |
| YAI HTTP client (proxy side) | `src/lib/life-graph/yai-life-graph-client.ts` |
