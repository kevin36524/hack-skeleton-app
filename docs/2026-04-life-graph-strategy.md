# Strategy: Yahoo Mail Life Graph

**Date:** 2026-04
**Author:** Kevin Patel (patelkev@yahooinc.com)
**Status:** Draft — Strategy (pre-PRD / pre-ERD)
**Related:** MI Strike Team, Premium Home X-Team

---

## TL;DR

Yahoo Mail should build a **Life Graph** — a persistent, auto-maintained knowledge store that captures what matters to a user (people, orgs, life threads, commitments, events, preferences), refreshes continuously from important emails and user signals, and serves as the context layer for digest, triage, and future Chief-of-Staff experiences.

The graph ingests only important emails, merges new facts into existing ones with supersedes semantics for time-sensitive values, and is accessed by downstream agents through a **wiki_agent** — a reasoning service that assembles tuned context packets rather than exposing raw storage.

This document captures the strategic decisions (R1–R10) and proposes three approaches (Foundation, Assistant, Chief-of-Staff). **Recommended: Approach B — Assistant Graph.**

---

## Problem Statement

LLMs know a lot about the world but almost nothing about any individual user. Yahoo Mail's first-party inbox data is an unusually strong asset for closing that gap — it exposes relationships, routines, obligations, projects, and ephemeral life events in a way generic assistants cannot reach.

But the value only emerges if email is processed into something the assistant can *use* — structured, current, merged, corrected, and scoped by what matters. That layer is the Life Graph.

Without it, every downstream feature (digest, triage, briefs, Chief-of-Staff) has to re-derive user context from raw mail on every query — expensive, slow, and inconsistent across features. With it, the features compose on a shared, stable substrate.

This strategy answers: *what is in the graph, how does it update, and how do agents read it?* It does not specify service architecture, storage engine, or token budgets — those live in the ERD.

---

## Terminology (R10)

- **Life Graph** — the team term used throughout Mail Intelligence and Premium Home specs. Synonymous with "Context Graph" in older docs. "Knowledge Graph" is **not** the internal term; use Life Graph.
- **Drawer** — a top-level category of entity/fact in the graph. We use four (R2). Metaphor: how an executive assistant files things mentally.
- **Fact** — an atomic structured claim extracted from an email or a user statement (e.g., "Starbucks meeting on Thu at 12pm," "kid is vegetarian").
- **Entity** — a durable node that facts attach to (Person, Organization, LifeThread, Event, Commitment, Preference).
- **Supersedes** — the edge linking an outdated time-sensitive fact to its newer replacement. Older fact stays in the archive tier, marked `status=superseded`.
- **wiki_agent** — the reasoning service that sits between consumer agents (digest, triage, Chief-of-Staff) and graph storage. Consumers ask the wiki_agent for context; the wiki_agent assembles a tuned packet.
- **Sensitive zone** — a protected drawer for facts classified as sensitive (financial, health, political/religious, minor-location, auth credentials). Reads require per-request HITL consent.
- **Coordination circle** — people the user interacts with regularly enough that their emails always ingest (spouse, boss, kid's school, doctors, frequent vendors).

---

## Requirements

### R1 — Graph Shape: Two-Layer with Merge & Grounding

The graph has two layers:

- **Facts** — atomic claims. Each fact is typed (Meeting, Deadline, Allergy, Address, Job, RelationshipRole, etc.) and carries `value`, `confidence`, `status`, `source_message_ids[]`, `first_seen`, `last_verified`.
- **Entities** — durable nodes that facts attach to. Each entity is typed (Person, Organization, LifeThread, Event, Commitment, Preference, Household). Carries `id`, `label`, `aliases[]`, `source_message_ids[]`, `first_seen`, `last_updated`.

When a new extracted fact matches an existing one (same entity + same slot), the system **merges** — it does not append a duplicate. Merge semantics depend on the fact type (R4).

Every fact and every entity always carries a list of source message IDs. This gives agents a grounding path back to the original email and lets the user audit "why does the assistant think this?"

**Example.** A person entity for "Sarah Chen" might have facts: `job=Staff Engineer @ Stripe`, `spouse_of=user`, `birthday=1989-06-12`. Each fact is message-grounded. If a new email arrives saying Sarah changed jobs, the `job` fact updates (type-dependent per R4), and the superseded value is archived.

### R2 — Four Filing Drawers

Modeled on how an executive assistant organizes their mental filing system:

1. **People, Orgs & Relationships** — who is in the user's life and how they're connected. Spouse, boss, kid's teacher, doctor, school, employer, vendors; household composition; who-works-where; who-is-parent-of.

2. **Life threads / ongoing projects** — multi-email narratives with status. Examples: home remodel, tax season, job search, Boston trip, Girl Scout cookie season. Each thread has `status ∈ {active, upcoming, dormant, closed}`, participants, and a running set of linked facts.

3. **Commitments, deadlines & events** — action items owed by the user, things the user is waiting on from others, hard deadlines, discrete calendar-style events (flights, appointments, meetings). Each has a due/occurs time, a resolution state, and whom it's owed by/to.

4. **Top-of-mind + stable preferences** — two related but distinct sub-drawers:
   - *Top-of-mind* — what's hot this week; decays fast; drives the "right now" feel of the digest.
   - *Stable preferences / personal facts* — kid's allergies, home address, spouse's birthday, favorite airline. Rarely change.

All four ship in v1 (in Approach B). Approach A defers drawers 2–4; Approach C extends with user-facing review surfaces.

### R3 — Ingest Policy: Lightweight-Triage-Then-Deep-Ingest

Not every email should enter the graph. Ingestion is gated in this order:

1. **Lightweight triage at intake.** Every incoming email runs through a cheap classifier: *important / glance / low-priority.*
2. **Always-ingest whitelist.** If the sender is in the coordination circle, or the email matches an active life thread, ingest regardless of classifier score. This uses the graph to improve its own ingest decisions — a self-reinforcing loop.
3. **Deep ingest on "important".** Only emails classified important (or whitelisted) receive the full extraction pass and graph writes.
4. **Retroactive boost from user actions.** If a borderline email was not ingested, but the user later opens it with meaningful dwell, stars it, flags it, replies to it, or sends a reply, it gets re-classified and deep-ingested.
5. **Manual user-add.** The user can explicitly mark any email "add to graph," overriding the classifier.

Emails classified "glance" or "low-priority" are not ingested into the graph. They may still appear in the triage UI but do not contribute facts or entities.

### R4 — Fact-Update Semantics: Type-Dependent with Archival

When a new fact matches an existing one, the update policy depends on the fact type:

- **Stable facts** — overwrite in place. Examples: home address, kid's school name, allergies, birthdays. No history value; keep source_message_ids list growing.
- **Time-sensitive facts** — supersedes chain. Examples: meeting times, deadlines, flight times, event locations. The old fact is marked `status=superseded` and linked via `superseded_by` to the new current fact.
- **Reminder-only emails** — if an email does not change any fact value but re-mentions an existing entity/fact, append its messageID to the fact's grounding list. No value update.

**Overwritten / superseded facts are never deleted.** They move to an archival tier within the graph. Agents receive only the current value in their default context packets (to keep token count light). If the user asks "wait, when was that meeting originally?" — the consumer agent can pull the superseded chain on-demand.

**Worked example: Starbucks meeting.**
- Email 1 (Mon): "Let's meet at Starbucks at 10am Thursday." → Fact: `Meeting.time = Thu 10:00, Meeting.location = Starbucks`, source = msg_1.
- Email 2 (Wed): "Can't do 10 — let's do 12." → Fact updates: `Meeting.time = Thu 12:00`, source = msg_2. Old fact `Thu 10:00` archived with `superseded_by → new fact`.
- Email 3 (Thu AM): "See you at noon!" → No value change; append msg_3 to the current fact's `source_message_ids`.
- User asks agent: "What time was that meeting originally?" → Agent pulls archived chain, reports "Originally 10am, moved to 12pm."

### R5 — User-Write Path: Layered

The user can write to the graph through three paths, each with a distinct authority level:

1. **Explicit "remember" commands.** User says "remember that Sarah is allergic to peanuts" → stored as a user-stated fact with **highest authority**. Overrides any contradicting email-derived fact. Pinned against future email contradictions until the user explicitly revises.

2. **Ambient extraction from agent chat.** During normal conversation with the assistant, the agent opportunistically mines for facts. User says "yeah we moved dinner to 7" → facts extracted with **medium authority** (higher than email-derived, lower than explicit). Confidence-gated to avoid storing throwaway comments.

3. **Corrections on surfaced facts.** When the agent surfaces a fact in its response ("Looks like your meeting is at 10am") and the user corrects it ("No, it's 12"), the correction supersedes the email-derived fact and pins the corrected value with **high authority** (equivalent to explicit remember).

Authority ordering on conflict: `explicit_remember > correction > ambient > email_derived`.

### R6 — Read Contract: Named Context Packets, Gated by wiki_agent

Consumer agents **never touch graph storage directly**. They interact with a `wiki_agent` that:
- Receives a query describing *intent*, not a storage query.
- Reasons about what drawers / entities / facts are relevant.
- Assembles a tuned context packet within a token budget.
- Returns the packet to the consumer agent.

Day-1 named packets:
- `digest_context(user, window=today)` — for the Daily / Topline brief
- `triage_context(email_id)` — for the inbox triage agent
- `reply_context(thread_id)` — when composing a reply
- `morning_briefing(user)` — for the Chief-of-Staff preview

**Worked example: school / fish / vegetarian.**

1. A school sends email: *"We served fish sticks at lunch today."* Triage agent receives it.
2. Triage agent asks wiki_agent: `triage_context(email_id=msg_7)`.
3. Wiki_agent reasons:
   - Sender domain → Entity: `Org:westside-elementary` (in People/Orgs drawer).
   - This org is linked to Entity: `Person:user.kid` (in People/Orgs drawer, relationship = parent_of).
   - Kid entity has a fact: `food_preference = vegetarian` (in Preferences drawer, source = 3 prior emails, confirmed by user).
   - Current life thread: `school_year_2026` (in Life Threads drawer, active).
4. Wiki_agent assembles packet:
   ```
   {
     sender: "Westside Elementary — kid's school",
     kid: { name, grade, food_preference: "vegetarian" },
     parent_fact: "you are parent of this kid",
     relevant_note: "kid is vegetarian — fish served today may conflict",
     life_thread: "school_year_2026 (active)",
   }
   ```
5. Triage agent uses the packet and surfaces a high-priority flag: *"Heads up — school served fish today, and your kid is vegetarian. Might be worth reaching out."*

Cross-drawer reasoning lives inside wiki_agent, not in every consumer. This lets us evolve storage/schema without breaking digest or triage.

### R7 — Lifecycle / Decay: Time-Based with User Pin

Each drawer has a default time-based decay policy:
- **Top-of-mind:** falls off after ~14 days since last mention.
- **Commitments:** auto-close at deadline + grace window (e.g., +3 days).
- **Life threads:** marked dormant after N days of no activity (e.g., 60); dormant → archived after another window.
- **Preferences / stable facts:** never expire.

**User pin override.** The user can pin any item ("never drop this from top-of-mind unless I say so"). Pinned items bypass time decay until explicitly unpinned.

**Archived ≠ deleted.** Archived items remain in cold storage with full messageID grounding. They are not surfaced in default packets but are retrievable on-demand.

### R8 — Privacy: Store Everything, Segregate Sensitive, HITL on Read

No hard filter at extraction. If an email is important enough to ingest, its facts get extracted. But during extraction, a classifier flags sensitivity. Sensitive facts include (not exhaustive):
- Financial account numbers, credit card numbers, bank balances
- Health conditions, medications, treatment details
- Passwords, OTPs, 2FA codes
- SSN / government identifiers
- Political affiliation, religious practice
- Precise location data for minors

Sensitive facts land in a **sensitive-zone** drawer. They are excluded from default context packets.

When a consumer agent legitimately needs a sensitive fact, it asks the wiki_agent, which surfaces a **HITL consent prompt** to the user: *"Digest agent is asking to include your Chase card last 4 digits to summarize recent purchases — allow this? [once / for this session / deny]."*

Consent scope TBD in PRD: per-request vs. per-session vs. per-purpose.

### R9 — Cold Start: Full Historical Backfill, Filtered

On new-user enrollment, run a **full historical backfill** of the mailbox — but with the R3 importance filter applied retroactively:
- Emails matching the importance classifier
- Emails in user-curated folders (important signal: the user cared enough to organize)
- Emails from sent-folder recipients (proxies for coordination circle)
- Emails with meaningful attachments (signature images don't count)

Skip promotional, newsletter, transactional, and OTP noise.

Backfill runs as a one-time onboarding job. The user sees progress. Graph is meaningfully populated by the time the user first sees their digest / briefs.

---

## Three Approaches

The table below compares shipping targets. Details in sections following.

| Dimension | A — Foundation | B — Assistant (RECOMMENDED) | C — Chief-of-Staff |
|---|---|---|---|
| Drawers | 1, 3 only (People/Orgs, Commitments) | All 4 | All 4 + user-facing graph view |
| Read path | Direct drawer-slice queries | wiki_agent + named packets | wiki_agent + proactive packets |
| User writes | Explicit only | Layered (explicit + ambient + corrections) | Layered + deep ambient + user edit surface |
| Cold start | Narrow (Sent + Starred/Flagged only) | Full filtered (R9) | Full filtered + multi-account |
| Privacy | Hard-block list only | Sensitive-zone + HITL consent (R8) | Sensitive-zone + consent + user audit UI |
| Decay | Time-based only | Time-based + user pin (R7) | Gardener agent + time + pin |
| Merge logic | Deterministic slot-based | Typed schema + LLM for novel | Typed schema + LLM + gardener reconciliation |
| Time from ERD | ~6 weeks | 2–3 months | 6+ months |
| LLM cost | Low (extract only) | Medium (extract + matching + packet assembly) | High (adds gardener + proactive + ambient) |
| Risk | Low | Medium | High |
| Vision fit | Partial | Full (as described in strategy session) | Extended (Chief-of-Staff substrate) |

### Approach A — Foundation Graph

Smallest viable graph. Ships two drawers (People/Orgs + Commitments), deterministic schemas, no wiki_agent, narrow backfill. The point is to prove the "graph improves digest" thesis quickly and defer the agent surface.

**Pros:** Low risk, fast ship, easy to audit.
**Cons:** The school/fish/vegetarian example **does not work** without cross-drawer reasoning and top-of-mind / preferences drawers. EA-assistant vision unmet. Read path has to be rebuilt when wiki_agent is added later.

**Pick this if:** leadership wants proof-of-concept metrics before committing to full investment.

### Approach B — Assistant Graph (Recommended)

What the strategy session described end-to-end. All four drawers. Wiki_agent gateway with named context packets. Layered user writes with authority ordering. Type-dependent fact updates with archival. Full filtered backfill. Sensitive-zone with HITL. Time-based decay with user pin.

**Pros:** Matches the vision. School/fish/vegetarian works out of the box. Wiki_agent gateway insulates consumers from schema churn. Naturally subsumes Approach A as a first milestone — can ship drawers 1+3 before 2+4.

**Cons:** Longer build. Wiki_agent is critical-path (latency + reliability work). HITL consent UX needs careful design to avoid consent-fatigue.

**Pick this if:** leadership is already bought into the MI Strike Team's Life Graph direction and Premium Home depends on it. This is the default.

### Approach C — Chief-of-Staff Graph

Approach B + a background gardener agent that reconciles and suggests aging-out, + proactive context packets pushed to consumer agents, + deep ambient extraction from all user-agent chat, + a user-facing "my assistant's memory" review surface, + multi-account support, + (far-future) cross-user anonymized learning.

**Pros:** Closest to a true Chief-of-Staff substrate. Strong brand differentiation vs. competitors like extra.email (which stores "subtly"; we'd store transparently with user control).

**Cons:** Largest surface. Highest LLM cost. Highest privacy/regulatory complexity. Over-extraction risk from ambient mining.

**Pick this if:** Premium has explicit Chief-of-Staff on roadmap and willingness to stage A → B → C over ~12 months.

---

## Recommendation

**Approach B — Assistant Graph.**

Rationale:
- It matches the vision described by Product in this strategy session.
- It aligns with the existing Mail Intelligence three-layer architecture (canonical / behavioral / evidence) without duplicating it.
- It enables the school/fish/vegetarian cross-drawer reasoning example — which is the single most compelling demo of the graph's value.
- Approach A is a natural subset inside the B build plan. Shipping People/Orgs + Commitments first (as an internal milestone) gives us early signal without a separate architecture.
- Approach C's features stay on the roadmap as v2, but committing to them now is premature.

**Staging inside B:**
1. Milestone 1 (~6 weeks post-ERD): drawers 1 + 3 (People/Orgs + Commitments), wiki_agent stubs returning drawer-slice data, narrow backfill. Proves value to digest.
2. Milestone 2 (~+4 weeks): drawers 2 + 4 (Life threads + Top-of-mind/Preferences), wiki_agent upgraded to full packet assembly with cross-drawer reasoning, full filtered backfill, sensitive-zone + HITL, decay + pin. Enables triage's school/fish/vegetarian-class behavior.
3. Milestone 3 (~+2 weeks): user-write ambient path, corrections path, archival UI hooks. Closes the full R5 layered-write loop.

---

## How This Strategy Addresses the MI Strike Team Open Questions (2026-03-31)

| Strike team question | Addressed by |
|---|---|
| What granularity does the product actually need? | R2 (four drawers); R1 (typed facts); Approach B specifies all four |
| How to evaluate quality? | **Deferred to PRD** — product-level success metrics not yet defined |
| What guardrails must the backend obey? | R3 (ingest filter), R7 (decay), R8 (sensitive-zone + HITL) |
| Initial creation vs incremental updates? | R9 (cold-start full backfill) + R3 (ongoing event-driven) — architecturally unified by reusing the same pipeline |
| Does the product need each teacher, activity, recurring event? | Yes, as entities in drawer 1; as facts linked to life threads in drawer 2 |
| Hard vs soft validation of inferences? | R5 (soft: surfaced facts the user corrects; hard: explicit "remember" commands) |
| Dynamic vs granular? | Both; R4 update semantics handle dynamism, R2 drawers + typed facts handle granularity |
| User feedback loops without privacy concerns? | Corrections and ambient extraction happen inside normal agent chat; a user-facing graph review surface is **deferred to Approach C** |
| Product metrics? | **Deferred to PRD** |

---

## Open Questions (for PRD and ERD)

These are deliberately out of scope for this strategy document. Storage representation is now addressed in the companion data-model doc: [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md).

### For PRD
- **Product success metrics.** What user-level metrics prove the Life Graph is working? Brief acceptance rate? Correction rate? Time-to-triage reduction?
- **Granularity caps per drawer.** How many top-of-mind items at once? How many active life threads? How deep does "one thread per child" go before it's too noisy?
- **Consent UX for sensitive zone.** Per-request, per-session, per-purpose? How is it surfaced without consent-fatigue?
- **User-facing graph surface — is it v1 or v2?** Probably v2 (Approach C), but PRD should decide.
- **P0 packet definitions.** What exactly goes into `digest_context`, `triage_context`, `reply_context`, `morning_briefing`? Token budgets per packet.

### For ERD
- **Write timing.** Real-time per event, near-real-time batching (every N minutes), or hybrid (hot signals immediate + ambient batched)?
- **Fact identity / merge mechanism.** Schema-key deterministic vs. LLM-semantic vs. hybrid? What's the identity resolution algorithm for Person entities (email address? thread participants? LLM judgment on name variants?).
- **Storage representation.** Markdown files with YAML frontmatter (wiki-style; good for the `wiki_agent` + `wiki-ingest` analogy)? Property graph DB (Neo4j-style)? Event log + materialized drawer views? Hybrid?
- **wiki_agent service architecture.** Single service vs. per-drawer writers? How does it scale? How does it fail gracefully?
- **Resolution-signal taxonomy.** What specific signals mark a commitment resolved? (User sent reply + content-match; calendar shows event occurred; user said "done"; deadline passed with no activity.)
- **Schema versioning.** How do we evolve the schema safely? Per-node schema_version + compat layer?
- **Latency + cost budgets.** Per packet, per write, per backfill. Cold-start backfill cost model.
- **MCP surface.** Does the Life Graph expose read endpoints through the Yahoo Mail MCP server (`mcp.mail.yahoo.com`)? If so, which packets are MCP-safe vs. internal-only?

---

## Cross-References

Organizational template used for drawers / entity conventions / special files:
- `/Users/patelkev/dev/fe/ygenerator/skills/wiki/SKILL.md`
- `/Users/patelkev/dev/fe/ygenerator/skills/wiki/agents/structure-proposer.md`

Companion docs in this series:
- [2026-04-life-graph-ingest-pipeline-design.md](./2026-04-life-graph-ingest-pipeline-design.md) — pipeline lifecycle (cold start, ongoing ingest, reasoning, digest read path)
- [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md) — Firestore schema and ERD for the requirements in this strategy

Team material this strategy builds on (and must not duplicate):
- [Mail Intelligence High-Level Plan for Mail Premium](../../Mail%20Intelligence/Mail%20Intelligence%20High-Level%20Plan%20for%20Mail%20Premium.md) — canonical 3-layer (canonical / behavioral / evidence) architecture; R1 aligns to this
- [Premium Home Life Graph Spec](../../product/premium-home-specs/subspecs/premium-home-life-graph-spec.md) — product lens, P0 node types, user jobs
- [Contextual Life Graph — Matthew Katz](../../prototypes/bundles-proto/server/contextual-life-graph.md) — worked example from 450 emails; coordination-circle pattern
- [Premium Home Daily Brief Spec](../../product/premium-home-specs/subspecs/premium-home-daily-brief-spec.md), [Topline Brief Spec](../../product/premium-home-specs/subspecs/premium-home-topline-brief-spec.md), [Categories Brief Spec](../../product/premium-home-specs/subspecs/premium-home-categories-and-category-briefs-spec.md) — consumer contracts for R6 packets
- [Greeting Brief Spec](../../prototypes/bundles-proto/docs/greeting-brief-spec.md), [Inbox Prototype Spec](../../prototypes/bundles-proto/inbox-prototype-spec.md) — today's implicit importance signals; R3 formalizes these
- [extra.email AI Analysis](../../engineering/2026-04-extra-email-ai-analysis/findings.md) — competitor pattern; we store transparently with user control, they store "subtly"
- [Premium MI Strike Team Meeting — 2026-03-31](../cankola/docs/meeting-notes/2026-03-31-premium-mi-strike-team-context-graph-architecture.md) — open-questions list this strategy closes
- [Yahoo Mail MCP Server — API Specification](../../engineering/2026-04-yahoo-mail-mcp-server/api-specification.md) — potential external read surface for selected packets

---

## Next Steps

1. Review this strategy with MI Strike Team (Matt Katz, Sanika Shirwadkar, Allen Mohammadi, Aaron Baumann, Chetan Ankola, Rofaida Abdelaal, Bhopal Singh) and align on **Approach B**.
2. Run `/wiki-ingest personal/patelkev/2026-04-life-graph-strategy.md` to pick this up into the wiki.
3. Draft the **PRD** (user stories, acceptance criteria, packet definitions, success metrics, consent UX).
4. Draft the **ERD** (service architecture, storage, schema versioning, latency/cost budgets, MCP surface).
5. Hand off to Sanika / Allen for the MI team's proposal on graph-building based on Q2 / Q3 scope (per the 2026-03-31 meeting action items).
