# Life Graph — Deep Extraction Revised Spec

**Date:** 2026-04-30
**Author:** Kevin Patel (patelkev@yahooinc.com)
**Status:** Revised spec — supersedes deep extraction sections of `2026-04-life-graph-ingest-phase1-impl-spec.md`
**Parent docs:**
- [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md)
- [2026-04-life-graph-ingest-pipeline-design.md](./2026-04-life-graph-ingest-pipeline-design.md)
- [2026-04-life-graph-ingest-phase1-impl-spec.md](./2026-04-life-graph-ingest-phase1-impl-spec.md)

---

## Context

This doc captures architectural decisions made during a review of the Phase 2 deep extraction implementation. It identifies gaps in the original spec and defines the correct behaviour going forward.

---

## Key Architectural Decisions

### 1. Snippets Are Sufficient for Stage A

Full message bodies are not required. The Yahoo API snippet (~150-200 chars) provides enough signal for the note agent to produce high-quality free-form notes. Proven in practice — rich entity profiles (spouse, kids, properties, commitments) are extractable from snippet input alone.

**No change needed to message fetching.**

---

### 2. Entity vs Fact — Clarified Distinction

**Entity** — a *thing* with stable identity that persists over time. Other things reference it by ID.
Examples: Niti Patel (Person), Anvay's Birthday (Event), Water Bill Dispute (Commitment), 169152 Alder (Asset)

**Fact** — a *claim about an entity* that can change over time, needs authority tracking, and benefits from a supersedes chain.
Examples: Niti's job at Twilio (`slot: job`), Hriyaan's food preference (`slot: food_preference`), sender tier (`slot: sender_class`)

**Rule:** If it's a structural property of the entity that you'd query on (time, location, participants, due date) → put it directly on the entity. If it's a claim that genuinely changes and you care about history and authority → make it a fact.

**Dropped: `timeSensitiveFacts` concept.** `meeting.time` and `meeting.location` as orphaned flat facts on a person entity is wrong — they belong as fields directly on the Event entity. The `timeSensitiveFacts` array is removed from the extractor output schema.

---

### 3. Per-Claim Message ID Annotation in Stage A

Stage A (note agent) receives messages with message IDs in the input. The note agent must annotate each claim in the prose with the message ID(s) it came from.

**Example output:**
```
Niti Patel is Kevin's spouse [msg_123]. She works at Twilio (nitpatel@twilio.com) [msg_124, msg_125].
Anvay's 5th Birthday is on May 3 at Hiller Aviation Museum, San Carlos [msg_126].
Hriyaan has weekly soccer at Irvington Comm Center, Saturdays 8-9am [msg_127].
```

This is the mechanism for source grounding. Stage B reads the message IDs from the note and looks up delivery times programmatically — **the LLM does not output delivery times**.

---

### 4. Notes Written Before Stage B Runs

The note must be persisted to Firestore with `stageBStatus: 'pending'` **before** Stage B is invoked. If Stage B fails, crashes, or produces bad output, the note survives and Stage B can be re-run without hitting the email API again.

This is what makes notes the source of truth. The previous implementation wrote the note after extraction and marked it `processed` immediately — collapsing the two stages into one and losing the recovery path.

---

### 5. Delivery Times Looked Up Programmatically

Stage B does not ask the LLM for delivery times. Instead:
- Stage B receives the message records (id → deliveryTime mapping) alongside the note
- Each extracted item carries `sourceMessageIds: string[]` (output by the LLM from the note's inline annotations)
- Stage B looks up `effectiveTime` from the message records using those IDs

Less LLM burden. More reliable than asking the model to transcribe timestamps.

---

### 6. Stage B Discovers and Creates New Entities

Stage B is not limited to writing facts about the primary entity (the sender). During extraction it may discover secondary entities referenced in the emails:
- A child → create a Person entity
- A property → create an Asset entity
- A school, doctor, realtor, etc. → create an Org entity

When a referenced entity doesn't exist yet (e.g. "Richmond American Homes"), Stage B creates a **stub entity** — just label, type, and source message IDs. The stub is enough to hold relationship references and will be enriched if that entity is processed later or encountered again.

---

### 7. Consolidation Pass After All Entities Processed

Once Stage B has run across all entities in Phase 2, a lightweight consolidation pass runs:
- Finds stub entities that now have a match from a fully profiled entity (merge by email or label)
- Resolves `participantEmails` on events that are now linked to real entity IDs
- Deduplicates entities created independently that refer to the same person/org (name + email match)

This pass is **purely programmatic** — no LLM needed.

---

### 8. Commitment `owedBy` / `owedTo` Must Be Entity IDs

The current implementation stores raw strings (UID string or label string like `"Richmond American Homes"`). These must be entity IDs (`Ref<Entity>`) to support graph traversal.

**Fix:** resolve `owedToEntityLabel` to an entity ID via identity resolution before writing the commitment entity. If no matching entity exists, create a stub first, then reference its ID.

---

### 9. Recurring Events — Option A with Dormancy

One entity per recurring series. No per-occurrence entities.

**Entity fields for recurring events:**
- `recurrenceRule: string` — human-readable or structured rule, e.g. "every Saturday 8-9am, April 18 – May 17 2026"
- `nextOccurrence: Timestamp` — next upcoming instance
- `seriesEndDate: Timestamp` — date of the last occurrence extracted from the email
- `lifeThreadStatus: 'active' | 'dormant'` — flips to `dormant` when `nextOccurrence > seriesEndDate`

**Daily reasoning pass** rolls `nextOccurrence` forward after each occurrence passes. If the daily pass misses an update, the next run catches up by rolling from wherever `nextOccurrence` is — **self-healing within 24 hours**.

**Dormancy:** once `nextOccurrence > seriesEndDate`, mark `lifeThreadStatus: 'dormant'`. Entity stays in the graph for history but falls out of top-of-mind.

**Future:** calendar integration will replace this model. The graph will hold a reference to a calendar series instead of managing recurrence itself.

---

### 10. Sensitivity Routing Removed for Now

`sensitiveFacts/` collection and sensitivity classification are **deferred**. All facts go to `facts/` in Phase 1. Sensitivity routing will be added as a dedicated step when the time comes.

---

### 11. Known Bug — Stage A JSON Parse Mismatch

`stage-a.ts` attempts to `JSON.parse()` the note agent output. But the `lifeGraphNoteAgent` prompt says *"Write in plain prose or bullets... do not output JSON."* This causes a silent failure on every Stage A call — it falls back to `text.slice(0, 500)` which discards most of the note.

**Fix required:** Update Stage A to store the note agent output as raw prose (no JSON parsing). Update the note agent prompt to include inline message ID annotations as specified in Decision 3 above.

---

## Revised Deep Extraction Pipeline — 5 Steps

### Step 1: Fetch Messages & Generate the Free-Form Note (Stage A)

For each entity from Phase 1:
- Fetch conversations and messages within `profile.backfillWindowMonths` — **not a hardcoded 365-day cutoff**
- Pass all messages (with message IDs, dates, sender info) to the note agent in a single call
- Note agent outputs **prose where each claim is annotated with the message ID(s) it came from**
- Store the raw prose as-is — no JSON parsing

---

### Step 2: Store the Note

Write to `notes/` collection:
- `notesText` — the raw prose with inline message ID annotations
- `stageBStatus: 'pending'`
- Written **before** Stage B runs

Delivery times are not stored on the note. Stage B looks them up programmatically from the message IDs embedded in the prose.

---

### Step 3: Structured Extraction (Stage B)

#### 3a. Extractor Output Schema

```json
{
  "entityUpdates": [
    {
      "label": "Niti Patel",
      "email": "nitivachhani@gmail.com",
      "type": "person",
      "relationshipClass": "spouse",
      "sourceMessageIds": ["msg_123"]
    }
  ],
  "newEntities": [
    {
      "label": "Hriyaan Patel",
      "type": "person",
      "relationshipClass": "family",
      "sourceMessageIds": ["msg_123"]
    },
    {
      "label": "169152 Alder",
      "type": "asset",
      "sourceMessageIds": ["msg_124"]
    }
  ],
  "facts": [
    {
      "entityLabel": "Hriyaan Patel",
      "slot": "food_preference",
      "value": "vegetarian",
      "sourceMessageIds": ["msg_123"]
    },
    {
      "entityLabel": "Niti Patel",
      "slot": "job",
      "value": "Twilio",
      "sourceMessageIds": ["msg_124", "msg_125"]
    }
  ],
  "relationships": [
    {
      "fromEntityLabel": "Niti Patel",
      "slot": "spouse_of",
      "toEntityLabel": "Kevin Patel",
      "sourceMessageIds": ["msg_123"]
    },
    {
      "fromEntityLabel": "Niti Patel",
      "slot": "parent_of",
      "toEntityLabel": "Hriyaan Patel",
      "sourceMessageIds": ["msg_123"]
    }
  ],
  "events": [
    {
      "label": "Anvay's 5th Birthday",
      "startTime": "2026-05-03T11:00:00",
      "endTime": "2026-05-03T13:30:00",
      "location": "Hiller Aviation Museum, San Carlos, CA",
      "participantEmails": ["nitivachhani@gmail.com"],
      "isRecurring": false,
      "sourceMessageIds": ["msg_125"]
    },
    {
      "label": "Hriyaan's Soccer (Rege's Academy)",
      "startTime": "2026-04-18T08:00:00",
      "endTime": "2026-04-18T09:00:00",
      "location": "Irvington Comm. Center",
      "participantEmails": ["nitivachhani@gmail.com"],
      "isRecurring": true,
      "recurrenceRule": "every Saturday 8-9am, April 18 – May 17 2026",
      "seriesEndDate": "2026-05-17",
      "sourceMessageIds": ["msg_127"]
    }
  ],
  "commitments": [
    {
      "label": "Resolve Hedges Dr water bill dispute",
      "dueDate": "2026-04-30",
      "owedByUser": true,
      "owedToEntityLabel": "Richmond American Homes",
      "sourceMessageIds": ["msg_126"]
    }
  ]
}
```

#### 3b. Processing Order

**1. Resolve or create entities**
For each item in `entityUpdates` and `newEntities`:
- If entity with that email or label exists → patch it (update `relationshipClass`, `label`, etc.)
- If not → create new entity with label, email, type, relationship class
- Entity IDs are assigned by the system — never by the LLM

**2. Write facts**
For each fact, resolve entity by label/email to get ID. Look up delivery time from `sourceMessageIds` message records to set `effectiveTime`.

**3. Write relationships**
Resolve both `fromEntityLabel` and `toEntityLabel` to entity IDs. If target doesn't exist yet, create a stub entity first, then reference its ID.

**4. Write events**
Create event entities with all fields directly on the entity:
- `startTime`, `endTime`, `location`, `participantIds`
- For recurring: `recurrenceRule`, `nextOccurrence` (= `startTime`), `seriesEndDate`, `lifeThreadStatus: 'active'`
- Resolve `participantEmails` to entity IDs where possible; store email on `emailAddresses` where not — resolved later by consolidation pass

**5. Write commitments**
Create commitment entities with `dueDate` directly on the entity. Resolve `owedToEntityLabel` to an entity ID via identity resolution. If no match, create a stub entity first.

**6. Mark note as processed**
Update `stageBStatus: 'processed'`, record produced fact and entity IDs.

#### 3c. Consolidation Pass (after all entities processed)

Runs once after Stage B has completed for all entities in Phase 2:
- Merge stub entities that now match a fully profiled entity (by email or label)
- Resolve any `participantEmails` on events that now have matching entity IDs
- Deduplicate entities created independently that refer to the same person/org

No LLM — purely programmatic matching.

---

### Step 4: Post-Extraction Reasoning

Rule-based pass after Stage B completes for each entity. No LLM calls. Failures do not affect `stageBStatus`.

**Conflict detection:**
- Kid has `food_preference` fact → check linked school entity for `meal_served` signal → surface preference conflict alert
- New event overlaps existing commitment → surface schedule conflict alert

**Commitment risk:**
- Commitment `dueDate` is in the past with no `resolvedAt` → surface as overdue
- Commitment approaching with no activity signals → surface as deadline risk

**Waiting-on detection:**
- User has an open commitment to someone with no resolution signal past expected window → surface as waiting-on

**Relationship enrichment:**
- Newly discovered spouse/child/property → check if other existing entities in the graph should be linked

---

### Step 5: Top-of-Mind Seeding

Set `entryClock` and `decayClock` on newly created events and commitments.

| Entity type | entryClock | decayClock |
|---|---|---|
| Near-term event (≤ 14 days) | `now` | `endTime + 2 days` |
| Far-future event (> 14 days) | `startTime - 14 days` | `endTime + 2 days` |
| Recurring event | `nextOccurrence - 2 days` | `nextOccurrence + 1 day` (rolling) |
| Commitment with dueDate | `dueDate - 7 days` | `dueDate + 2 days` |
| Overdue commitment | `now` | `resolvedAt` (when resolved) |
| Commitment without dueDate | `now` | `now + 14 days` |

Recurring events: daily reasoning pass rolls `nextOccurrence` forward after each occurrence passes. When `nextOccurrence > seriesEndDate`, set `lifeThreadStatus: 'dormant'`. Missed daily pass updates self-heal on next run.

---

## Updated Entity Schema Changes

Two fields added to `Entity` in `types.ts`:

```ts
// Event hot fields (additions)
location?: string;           // physical or virtual location of the event
recurrenceRule?: string;     // for recurring events: human/structured recurrence description
nextOccurrence?: Timestamp;  // for recurring events: next upcoming instance
seriesEndDate?: Timestamp;   // for recurring events: date of last occurrence
```

`timeSensitiveFacts` slots (`meeting.time`, `meeting.location`) are **no longer used**. These properties live directly on the Event entity as `startTime` and `location`.

---

## What Is NOT Changing

- Snippets vs full bodies — snippets remain sufficient
- Phase 0 and Phase 1 (structural pass, sender profiling) — unchanged
- Supersedes chain for stable facts — unchanged
- Identity resolution algorithm — unchanged
- Cost cap and progress tracking — unchanged
- Sensitivity routing — deferred, not implemented in Phase 1

---

## Bugs to Fix

| ID     | Location                                           | Description                                                                                                                                                                                       |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BUG-01 | `stage-a.ts:54-58`                                 | JSON.parse on note agent output — agent outputs prose, not JSON. Silent failure falls back to `text.slice(0, 500)`. Fix: store raw prose, update prompt to include inline message ID annotations. |
| BUG-02 | `phase2-deep-extraction.ts:195`                    | Hardcoded 365-day cutoff. Fix: read `profile.backfillWindowMonths` and compute cutoff dynamically.                                                                                                |
| BUG-03 | `stage-b.ts:123-124`                               | `owedBy`/`owedTo` stores raw strings (uid or label). Fix: resolve to entity IDs via identity resolution.                                                                                          |
| BUG-04 | `stage-b.ts:161` / `phase2-deep-extraction.ts:171` | Event entity missing `location` field. Fix: add `location` to extractor output schema, Entity type, and entity creation.                                                                          |
| BUG-05 | `stage-b.ts:83-101`                                | `timeSensitiveFacts` attached to person/org entity instead of event entity. Fix: drop `timeSensitiveFacts` from extractor schema; put time and location directly on event entities.               |
| BUG-06 | `stage-b.ts:340` / `phase2-deep-extraction.ts:340` | Note `deliveryTime` set to `Timestamp.now()` instead of source email delivery time. Fix: use most recent source message delivery time.                                                            |

---

## Cross-References

- [2026-04-life-graph-ingest-phase1-impl-spec.md](./2026-04-life-graph-ingest-phase1-impl-spec.md) — original implementation spec; WU-09, WU-10, WU-12, WU-14 are affected by this doc
- [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md) — Entity schema updated with `location`, `recurrenceRule`, `nextOccurrence`, `seriesEndDate`
- [2026-04-life-graph-ingest-pipeline-design.md](./2026-04-life-graph-ingest-pipeline-design.md) — Part 1 §2 (two-stage extraction) and Part 2 §6 (entity identity resolution) are the relevant pipeline sections
