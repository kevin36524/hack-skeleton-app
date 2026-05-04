# Proposal: Per-entity markdown dossiers + typed relationships

**Date:** 2026-05-01
**Author:** Kevin Patel (patelkev@yahooinc.com)
**Status:** Draft — Proposal
**Related:** `2026-04-life-graph-data-model.md`, `2026-04-life-graph-deep-extraction-revised-spec.md`, `2026-04-life-graph-ingest-pipeline-design.md`

---

## Motivation

Stage B's slot/value `Fact` extractor loses information. Stage A's prose note captures rich detail ("Hriyaan is 5, vegetarian, started kindergarten this fall"); Stage B compresses that into a handful of `(slot, value)` pairs and drops everything else. The bits the slot schema doesn't anticipate are gone.

The `Fact` infrastructure is also overkill for the bulk of stable info. Supersession, slot bookkeeping, and drawer plumbing are 2010s knowledge-graph patterns. With modern LLMs, a free-text "entity dossier" carries more signal at less ceremony.

**Proposal:** replace the `Fact` collection with a per-entity markdown dossier, keep typed relationships as a small structured field, leave events/commitments/top-of-mind untouched.

---

## Scope

**In scope**
- New `Entity.dossier` (markdown) and `Entity.dossierVersion` fields
- New `dossierVersions` subcollection for full-body version snapshots
- New `Entity.relationships[]` inline array for typed edges
- New Stage C "merge agent" that updates dossiers
- Stage B trimmed to no longer emit `facts`
- Deprecation + removal of the `Fact` collection

**Out of scope**
- Event and commitment entity schemas (unchanged)
- Phase 0 (structural), Phase 1 (sender profiling), Phase 3 (thread sweep), Phase 4 (top of mind) — all unchanged
- Stage A note prompt and content gates (unchanged)

---

## Schema changes

### `Entity` — added fields

```ts
dossier: string                  // markdown body, current version
dossierVersion: number           // monotonic, starts at 1
relationships: Array<{           // typed edges, inline
  slot: string                   // 'spouse_of' | 'parent_of' | 'employs' | ...
  toEntityId: string
  sourceMessageIds: string[]
  firstSeen: Timestamp
  lastVerified: Timestamp
}>
```

Nothing on `Entity` is removed. `relationshipClass`, `aliases`, `emailAddresses`, etc. stay — they are the structured spine the dossier prose can drift around without corrupting identity.

### New subcollection: `users/{uid}/entities/{eid}/dossierVersions/{version}`

```ts
{
  version: number
  body: string                   // full markdown at this version
  prevVersion: number | null
  changeNote: string             // LLM-produced "what I changed and why"
  sourceMessageIds: string[]     // messages that motivated this update
  writtenAt: Timestamp
}
```

Full bodies, not deltas. Storage is cheap; queryability matters more — "find every entity where the word 'vegetarian' was removed in the last month" should be a 5-line script, not a patch-replay.

### `Fact` — deprecated

The `Fact` collection and `factType: 'stable' | 'time_sensitive' | 'reminder' | 'relationship'` machinery are removed. Specifically:

- `factType: 'relationship'` writes → migrate to inline `Entity.relationships[]`
- `factType: 'stable'` writes → migrate into `Entity.dossier`
- `factType: 'reminder'` / `'time_sensitive'` → in practice only used by dictionary lookup's `sender_class`, which becomes a structured `Entity.senderClass: SenderTier` field

`writeOrSupersedeFact`, `getCurrentFact`, `listFacts`, `getFact`, `insertFact`, the `producedFactIds` array on `Note`, and the fact-pointer rewriter in `consolidation.ts:182` all go away.

---

## Pipeline changes

### Stage A — `lifeGraphNoteAgent`
**Unchanged.** Still produces cited prose per email, still uses `[msg_xxx]` annotations.

### Stage B — `lifeGraphExtractorAgent`
**Output schema trimmed.** Drops the `facts` array. Continues to emit:
- `entityUpdates` — patches to identity spine (label, email, type, relationshipClass)
- `newEntities` — secondary entities mentioned
- `relationships` — typed edges (now write to inline array on Entity)
- `events` — full event entities
- `commitments` — full commitment entities

### Stage C — dossier merge (new)

For each entity referenced by a note, run the merge agent.

**Inputs:**
- `EXISTING_DOSSIER`: current `Entity.dossier` (empty for new entities)
- `NEW_NOTES`: prose excerpt(s) from the note that reference this entity, with `[msg_xxx]` citations preserved
- `ENTITY_SPINE`: label, primary email, relationshipClass — so the agent doesn't drift on identity

**Output:**
```json
{
  "updatedDossier": "...",
  "changeNote": "Added kindergarten enrollment from msg_456. No prior claims contradicted.",
  "preservedCitations": ["msg_123", "msg_124"]
}
```

**Persistence:** write `updatedDossier` onto the entity, increment `dossierVersion`, append a row to `dossierVersions`. The `preservedCitations` field is a self-check — if the model returns a list missing citations that were in the prior dossier body, log a warning and snapshot the prior version with extra emphasis.

### Merge agent prompt (sketch)

```
You are updating a dossier for one person/organization in a personal
assistant's knowledge base.

Inputs:
- EXISTING_DOSSIER: markdown, may be empty.
- NEW_NOTES: prose excerpts about this entity, each tagged with [msg_xxx] ids.
- ENTITY_SPINE: label, primary email, relationshipClass.

Rules:
1. Output the COMPLETE updated dossier, not a diff. Anything not
   reproduced is gone.
2. Preserve every dated claim and every [msg_xxx] citation from
   EXISTING_DOSSIER, verbatim, unless NEW_NOTES contradicts it.
3. If NEW_NOTES contradicts an existing claim, keep both with their
   dates. Do not silently pick a winner.
4. New claims must carry their [msg_xxx] citations.
5. Keep prose tight — group related claims, but never drop a fact to
   shorten.

Return JSON: { updatedDossier, changeNote, preservedCitations }.
```

The change note is what makes the version history *browsable* — the diff shows what changed, the note explains why.

---

## Where Stage C runs

### Cold start (Phase 2)

`phase2-deep-extraction.ts` already produces one big prose blob per entity via the noteAgent. Replace the current per-entity Stage B call with: Stage B for structured records + Stage C for the dossier. Same number of LLM calls per entity (noteAgent + one structured pass + one merge pass… two structured passes total), comparable cost to today's noteAgent + extractor flow.

### Warm path (single new email)

Stage A → Stage B identifies which entities the note touches → enqueue a per-entity merge job. **Debounce** so we don't pay one merge per email when a thread arrives in bursts:

- Run merge for an entity once it has either ≥3 unprocessed note refs OR has been quiet for 10 minutes (initial guess; tune from telemetry)

### Top-of-mind (Phase 4)

**Unchanged.** Confirmed by reading `phase4-topofmind.ts` — it only writes commitment/event entities via `upsertEntity`, never reads facts or dossiers. The dossier change is invisible to it.

---

## Failure modes and mitigations

The merge step is the lossy step. Without defenses, it produces:

1. **Silent dropping** — a sentence "isn't important" and gets rewritten away. Six ingests later, "Hriyaan is vegetarian" is gone with no error.
2. **Drift via paraphrase** — "5 years old (Mar 2026)" → "young child" → loses the date entirely.
3. **False contradiction resolution** — model picks "most recent input wins" when emails arrive out of order during backfill.
4. **Citation rot** — `[msg_xxx]` tags get reshuffled or invented after rewrites.
5. **Bloat** — model is conservative, never deletes, dossier grows linearly with email count.

**Mitigations layered in this design:**

- **Prompt hardening** — explicit invariants (preserve dated claims, preserve citations verbatim, keep contradictions instead of picking a winner).
- **Full version snapshots in `dossierVersions`** — every prior body is recoverable. "Did we drop something?" becomes a grep, not a guess.
- **`changeNote` field** — LLM justifies its edits in plain English; this is what an audit reads, not the raw diff.
- **`preservedCitations` self-check** — flags suspicious rewrites at write time.
- **Structured spine stays separate** — `label`, `relationshipClass`, `email`, `relationships[]` live in real fields, so prose drift can't corrupt identity or graph topology.
- **Periodic compaction (future, not v1)** — if bloat becomes real, a separate scheduled pass merges/dedupes prose.

---

## Migration

Pre-launch. Simplest path: drop the `facts` collection, re-run cold-start once. No production data to preserve.

If we ever want a finer migration: write a one-off "seed dossier from existing facts" script that reads all current facts for an entity and prompts the merge agent to assemble them into a starter dossier. Skipped for v1.

---

## What's intentionally NOT changing

- Stage A prompt and `Note` shape
- `Event` and `Commitment` entity schemas
- Phase 0 / 1 / 3 / 4
- Identity resolution (`resolvePersonOrOrg`, `resolveEvent`, `findEntityByEmail`, `findEntityByLabel`)
- Consolidation logic — except the fact-pointer rewriter at `consolidation.ts:182` is replaced with an inline `relationships[].toEntityId` remapper during stub merges

The life-graph UI's "Facts" panel (`app/life-graph/page.tsx:1115-1141`) is replaced with a "Dossier" panel rendering `entity.dossier` as markdown, plus a version-history dropdown. Drawer counts and the structured event/commitment panels are unaffected.

---

## Open questions

1. **Inline relationships vs subcollection.** Inline keeps reads cheap (one entity doc = full picture). Subcollection enables versioning of edges. Recommendation: inline; revisit if edge-history queries become a real need.
2. **Warm-path debounce thresholds.** 3 notes / 10 min are guesses. Start aggressive (1 note, immediate) and tune from telemetry, or start conservative?
3. **Cost cap.** Warm-path adds ~1 LLM call per entity per debounce window. For a busy mailbox this is non-trivial — worth a per-day cap on dossier merges?

---

## Suggested rollout order

1. **Schema + Stage B trim** — add the new fields, stop emitting `facts`, migrate relationships inline. No merge agent yet; dossiers stay empty.
2. **Stage C merge agent** — wire into Phase 2 first (cold-start), validate on real data, then enable warm path.
3. **UI swap** — replace Facts panel with Dossier panel + version history.
4. **Fact collection removal** — delete `writeOrSupersedeFact`, `Fact` type, `producedFactIds`, dead code paths.
