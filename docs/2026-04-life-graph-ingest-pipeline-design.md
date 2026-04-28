# Life Graph — Pipeline Design

**Date:** 2026-04
**Author:** Kevin Patel (patelkev@yahooinc.com)
**Status:** Working design — post-strategy, pre-ERD. Covers the full lifecycle: cold-start backfill, ongoing ingest, reasoning & alerts, and the digest read path.
**Parent:** [2026-04-life-graph-strategy.md](./2026-04-life-graph-strategy.md) — addresses R3, R4, R5, R6, R7, R8, R9, and many of the ERD open questions.

---

## Scope

This document covers four phases of the Life Graph's operation:

- **Part 1 — Cold-Start Backfill.** One-time job on user enrollment.
- **Part 2 — Ongoing Ingest on New Mail.** Per-email steady-state pipeline.
- **Part 3 — Reasoning & Alerts.** Cross-drawer reasoning (post-ingest and scheduled) that produces derived facts and alerts.
- **Part 4 — Digest Read Path.** How the digest feature consumes the graph via `wiki_agent`.

---

## Shared Invariant

**Delivery-time semantics.** Every ingestion uses the source email's **delivery time** as its effective time. Ingest timestamp is irrelevant to graph state. All relative time references ("next Thursday," "tomorrow," "in two weeks") are resolved against the source email's delivery time, not the processing time.

This makes the pipeline deterministic and idempotent:
- Out-of-order arrivals do not corrupt the supersedes chain — ordering is by delivery time.
- Retries produce identical graph state.
- Cold-start ingest and live ingest of the same email produce identical output.
- An older email re-ingested later cannot overwrite a newer fact.

No special flags (no `late_ingest=true`, etc.) are needed — delivery time carries all the information.

---

# Part 1 — Cold-Start Backfill

## 1. Four-Phase Backfill Pipeline

Cold-start runs in four phases, each with a different cost profile. This bounds LLM spend by deciding *who and what matters* before spending tokens on deep extraction.

**Phase 0 — Structural pass (no LLM).**
Metadata-only scan. Builds a candidate-sender list from cheap, high-precision signals:
- **Sent-folder recipients** (last N months) — strongest "coordination circle" signal.
- **Inbox engagement-ranked senders** — weighted `replied >> starred > opened-with-dwell > received`.
- **Curated-folder senders** — anyone the user bothered to file.
- **Labels / rules** — user-defined labels indicate intent.

Output: ~200–500 candidate senders with a composite importance score. Cost: essentially free.

**Phase 1 — Sender profiling (cheap LLM).**
For each candidate sender, batch 5–10 recent-and-engaged emails. Single LLM call per sender returns:
- Entity type (Person / Org)
- Relationship class (family / close friend / work / school-kid-related / doctor / vendor / newsletter / service)
- Rough role label
- **Sender tier** (see Part 2, §2) — `important / conditional / junk`

Output: a classified candidate list, ranked by `relationship_class × engagement × recency`. Sender-tier assignments are written as facts on the sender entity, seeding the dictionary that Part 2 Step 1 will use.

**Phase 2 — Deep extraction (expensive LLM).**
Take top ~30–50 ranked entities. For each, pull up to 80 past emails within the configured backfill window. Full fact extraction, life-thread detection, commitment surfacing. This is where most of the token budget goes.

**Phase 3 — Thread-first sweep.**
Independently scan for thread-IDs / subjects with ≥3 emails in the last 6 months that are **not** tied to a top-ranked sender. Catches multi-vendor life threads (e.g., home remodel involves contractor + inspector + permit office, none individually top-ranked). Extract as candidate life threads.

**Phase 4 — Top-of-mind seeding.**
Separate time-boxed pass: last 14 days of important-scored mail, regardless of sender. Extracts hot items and imminent commitments to bootstrap the Top-of-mind drawer. Without this, Day 1 digest feels stale because Top-of-mind is time-axis, not sender-axis.

---

## 2. Two-Stage Extraction: Free-Form Notes → Structured Graph

Instead of extracting directly to the typed schema, extraction runs in two stages:

**Stage A — Free-form note (per email, small LLM call).**
A lightly-scaffolded prose note:

```
source: msg_1234
date: 2026-03-12
from: Sarah Chen <sarah@stripe.com>
subject: Moving our meeting
notes: Sarah wants to move Thursday's Starbucks meeting from 10am to 12pm.
       No reason given. Mentions she'll bring the draft doc.
signals: [meeting_reschedule, work_context]
```

Header is structured; `notes` is prose. Cheap prompt, cheap output.

**Stage B — Structuring pass (batched LLM call).**
Takes 10–20 notes from the same entity together and produces typed facts and entities per the R1 schema. Running batched gives the LLM enough context to resolve entity references and temporal ordering correctly.

**Why this matters beyond cost:**
- **Free-form notes become the source of truth.** The structured graph is a *derived view*.
- **Schema migration is cheap.** When we change the schema (and we will), we re-run Stage B over existing notes. We do not re-ingest from mail.
- **Debuggability.** A wrong fact can be traced — did Stage A miss it, or did Stage B mis-structure it? Direct-to-schema collapses both failures into one opaque output.
- **Fallback for wiki_agent.** If a structured fact is missing for a query, the agent can read the free-form note directly.

**Mitigating error compounding.** Stage B has access to the original `source_message_id` and is allowed to re-read the email when a note is ambiguous. Cheap, prevents the classic two-stage failure mode.

Stage A and Stage B are shared primitives — Part 2 reuses both with the same semantics.

---

## 3. Content-Type Tiering (Fast Path)

Not every email needs two-stage extraction. Tier at Phase 0:

- **Skip entirely:** OTPs, pure acks, transactional receipts, newsletter noise.
- **Direct to schema (single call):** highly structured content whose format *is* the schema — calendar invites, flight confirmations, order receipts. Two-stage is overkill.
- **Two-stage:** everything narrative — conversations, scheduling, project updates, school notices. This is the majority.

---

## 4. Configurable Backfill Window

The backfill window is a per-user config knob:

- **Premium default:** 12 months.
- **User-selectable:** 1 / 3 / 6 / 12 months.
- **Regional override:** privacy-restricted regions cap at legal retention (GDPR, etc.).
- **Re-backfill path:** user can later extend ("go back another 6 months"); re-runs Phases 0–2 against the new window only.

---

## 5. Cost and Reliability Knobs

- **Hard cost cap:** e.g., "max 10K extraction calls at cold-start." Fail open beyond that — incomplete graph is better than a failed onboarding.
- **Confidence accumulation:** a fact seen in 5 emails carries higher confidence than one seen in 1. Stage B must aggregate, not overwrite.
- **Async structuring.** Stage A populates notes synchronously so the user sees progress. Stage B can run as a background job; Day 0 digest falls back to notes if structure isn't ready.
- **Progress UX:** four-phase progress bar, not a single spinner. Lets us fail gracefully if Phase 2 overruns — user still sees the structural and profiling work completed.

---

# Part 2 — Ongoing Ingest on New Mail

The steady-state pipeline runs on every new email that lands in the user's mailbox. It reuses Stage A / Stage B extraction from Part 1 and adds a graph-informed dictionary triage so that most mail is classified via cheap lookup rather than per-email LLM scoring.

## 1. Pipeline (11 Steps)

**1. Dictionary lookup (cheap, always runs).**
Pull the sender's classification from the graph (a fact on the sender's Person/Org entity).
- Known sender → use stored tier (`important / conditional / junk`).
- Unknown sender → fast-classify (Phase 1 sender-profiling model, reused). Classification is written back onto the sender entity. Low-confidence results are marked `pending` and refined as more mail accumulates.

The dictionary is **not a separate store** — it is the set of `sender_class` facts on Person/Org entities, benefiting from the same identity resolution and source grounding as any other fact in the graph.

**2. Content-level escalation check.**
- `important` → skip content check (trust the sender). Optionally apply a strict obvious-promotional blocklist for forwarded coupons.
- `conditional` → run the subject check (below).
- `junk` → skip entirely.

**Subject check for conditional senders** (cascade, cheapest first):
1. **Regex-first — transactional keywords:** `confirmation | booking | reservation | receipt | shipped | delivered | ticket | itinerary | your trip | flight | payment | invoice`. Hits → escalate to deep ingest.
2. **Promotional blocklist pass:** `% off | sale | deal | limited time | exclusive offer | last chance`. If also matched, require a strong transactional signal to override.
3. **Tiny classifier fallback:** subject-only model for inconclusive cases. Input ~50 chars; dirt cheap.
4. **Default: skip.** Conditional errs on the side of under-ingestion; Step 10 retroactive boost catches false negatives via user engagement.

**3. Ingest decision gate.**
- Important, or conditional + subject escalates → deep ingest (continue to step 4).
- Otherwise → annotate metadata only, stop. Email still appears in inbox UI; contributes nothing to the graph.

**4. Deep ingest — Stage A (free-form note).**
Same as Part 1. Quoted reply text is assumed sufficient for thread context (true in ~90–95% of clients). **Exception:** if the body is short (below a length threshold) AND has no quote marker (`>`, `On ... wrote:`, `-----Original Message-----`), pull the prior message from the thread.

**5. Deep ingest — Stage B (structuring), latency-tiered.**
- **Hot path (<30s):** coordination-circle sender OR active life-thread match OR near-term commitment (today/tomorrow). Stage B runs immediately so digest sees fresh state.
- **Warm path (batched, every 5–10 minutes):** everything else important. Cheaper, still fresh enough.

**6. Merge with entity identity resolution.**
Before applying facts, resolve entity identity — critical for events specifically:
- **Events must dedupe.** A new email referencing an existing event attaches facts to that entity, not a new one. Identity keys: participant-set overlap, time-window proximity, subject-line clustering, thread-ID (strongest signal when available). Without this, "Starbucks meeting Thursday" and "Moved Starbucks meeting to 12" become two separate entities instead of one entity with a superseded time fact.
- **Fact merge (R4):** stable facts overwrite (appending source_message_id); time-sensitive facts form a supersedes chain; reminder-only emails append to grounding without changing value.
- **Ordering** is driven strictly by delivery time.

**7. Post-ingest reasoning pass.**
After merge commits, run the reasoning pass defined in Part 3. Walks adjacent entities, evaluates AlertRules, detects conflicts, generates derived facts and alerts. This is where cross-drawer insights ("school served fish, kid is vegetarian") originate.

**8. Sensitivity routing (R8).**
Sensitive facts (including derived facts produced in step 7) route to the sensitive-zone drawer, excluded from default context packets.

**9. Top-of-mind update (event-scoped decay).**
- **Timed event:** `decay_clock = event_end + grace_window` (default grace ~2 days).
- **Deadline commitment:** `decay_clock = deadline + grace_window`.
- **Open-ended top-of-mind:** fall back to the 14-day default.

**Entry threshold for far-future events.** Two clocks govern top-of-mind membership: an **entry clock** (when an item becomes top-of-mind) and an **exit/decay clock** (when it falls out). Far-future events (e.g., a wedding 6 months out) stay in the Commitments drawer and only enter Top-of-mind when within N days (default ~14). Top-of-mind is for what is actionable *now*, not what is actionable eventually.

**10. Retroactive boost path.**
A user-action observer watches for dwell, star, flag, reply, forward on previously-skipped emails. A meaningful action triggers re-classification and re-ingestion through steps 4–9. **No special flag is needed** — the delivery-time invariant ensures the late ingest produces correct graph state regardless of processing order.

User engagement also feeds the **sender-level learning loop**:
- Engagement on a skipped email → positive subject-pattern signal for that sender.
- Ignoring an ingested email → negative subject-pattern signal.
- Once a pattern accumulates enough signal, it is promoted onto the sender entity as `ingest_subject_patterns` or `skip_subject_patterns`, overriding the default regex matchers for that sender going forward.

**11. Manual user-add.**
User explicitly marks any email "add to graph" → bypass gate, run steps 4–9. Authority elevated (equivalent to R5 explicit-remember for any facts extracted).

---

## 2. Sender Classification Tiers

- **`important`** — always deep ingest. Spouse, boss, kid's school, doctor, close coworkers. Subject check skipped or limited to a strict obvious-promotional blocklist.
- **`conditional`** — passes Step 1, Step 2 decides per-message via subject check. Airbnb, Uber, most retailers, most orgs, most newsletters. **Majority of senders after cold-start** — this is fine, because the subject check is cheap.
- **`junk`** — dropped at Step 1. Pure promotional bulk, spam domains, unsubscribable newsletters the user ignores.

**Mixed-content senders** (the Airbnb case: mostly promotional, occasionally a booking confirmation) are the archetype for `conditional`. The tier exists specifically so these senders are not dropped at the door — their subject lines get a look.

**Classification decay.** Sender tier re-evaluates on signal drift. If an `important` sender has no user engagement for ~6 months, their tier gets demoted. Similarly, sustained engagement can promote a `conditional` sender to `important`.

---

## 3. User Overrides on Sender Class

R5 layered writes map cleanly to tier assignment, with no new R5 subtype needed:
- *"Sender-X is junk"* → force Tier `junk`, pinned at R5 explicit-remember authority.
- *"Sender-X is important"* → force Tier `important`, pinned.
- *"Only ingest bookings from Airbnb"* → forces Tier `conditional` + pins explicit `ingest_subject_patterns` that override learned rules.

This closes the anti-whitelist gap flagged during strategy review — the user-demote path is just user-set sender classification, slotting naturally into the three-tier model.

---

# Part 3 — Reasoning & Alerts

The ingest pipeline extracts facts from emails. Reasoning turns those facts into **insights** — cross-drawer conclusions, conflict flags, and alerts — that downstream consumers (digest, triage) surface to the user.

Reasoning runs in two modes:

- **Post-ingest reasoning** — triggered by new facts landing in the graph (Part 2, Step 7).
- **Scheduled reasoning** — triggered by a clock. Walks forward-dated facts and fires time-based triggers.

Both modes produce the same kinds of output: **derived facts** and **alerts**.

---

## 1. Post-Ingest Reasoning Pass

Runs immediately after Stage B merge completes (Part 2, Step 7). Operates on the newly-written facts and the entities they touch.

**What it does.** For each new or updated fact:
1. Walk outward from the fact's entity along relationship edges (parent_of, attends, employs, married_to, owns_asset, etc.).
2. Check each reached entity for preferences, constraints, or rules that interact with the new fact.
3. Evaluate any matching `AlertRule` entities (§4 below).
4. Detect cross-drawer patterns (§2 below).
5. Materialize derived facts and alerts in the appropriate drawers.

**Why eager, not lazy.** Reasoning runs once at ingest and the results are durable. Consumers (digest, triage, reply composer) read pre-computed insights instead of re-deriving them. Stale alerts are handled by **re-verification at read time** in `wiki_agent` — not by lazy recomputation.

---

## 2. Post-Ingest Patterns (Day 1 Catalog)

A deliberately small, enumerable set. The reasoning pass should not LLM-improvise new patterns at runtime — it uses this fixed vocabulary.

- **Preference conflict.** A new fact describes an action/exposure that conflicts with a linked entity's preference. Example: school served fish ↔ kid's `food_preference: vegetarian`. Produces a `PreferenceConflictFact` in Top-of-mind.
- **Schedule conflict.** A new event overlaps an existing commitment on the same calendar. Produces a `ScheduleConflictFact`.
- **Deadline risk.** A deadline approaches with no user activity on it. Produces a `DeadlineRiskFact` weighted by proximity.
- **Waiting-on emergence.** User made a commitment to someone OR is awaiting a promised deliverable, no resolution signal seen past expected window. Produces a `WaitingOnFact`.
- **Relationship update.** A new email reveals someone's job / address / title / relationship changed. Updates propagate to linked entities; optionally produces a heads-up alert ("Sarah changed jobs").
- **Preference-inferred fact.** An email implies a stable preference (ambient extraction at medium authority). Writes a Preference fact scoped to the extraction confidence.

**AlertRule matching** (§4) runs alongside these patterns — an incoming fact may hit both a generic pattern and a user-defined rule.

---

## 3. Scheduled Reasoning Pass

The post-ingest pass only runs when mail arrives. Some reasoning must fire **on a clock** instead — because the trigger is the passage of time, not an email.

**When it runs.** Daily, pre-digest (e.g., 06:00 local). May also run on demand when a user opens the app.

**What it does.**
1. Walk forward-dated facts in the graph: `FutureCommitment.end_date`, `Subscription.renewal_date`, `Deadline.due_date`, `Event.start_time`, `Alert.snoozed_until`.
2. For each fact whose trigger point falls within today's window, evaluate its alert cascade (§6) and materialize alerts.
3. For each snooze that has expired, re-evaluate the underlying issue and either resolve or re-fire the alert.
4. For expected-but-missing signals (see "absence-of-signal" pattern, future work), check whether a signal expected by date X has arrived; if not, fire an alert.

**Critical because without it the graph is passive.** It only acts on inbound mail. The scheduled pass is what lets the graph act *proactively* — reminding about trials ending, deadlines approaching, un-actioned snoozes coming back.

---

## 4. AlertRule Entity — User-Defined Conditional Alerts

A first-class entity type. Captures user-configurable rules like:

> *"Don't notify me about my monthly internet bill, it's on autopay — only flag me if the amount changes."*

**Shape:**

```yaml
entity: AlertRule:<slug>
scope:
  target_entity: <entity ref>       # Org:comcast
  content_match: <pattern>          # recurring_bill
authority: explicit_user             # R5 highest
default_action: suppress | surface
exceptions:
  - field: <field name>
    condition: <condition primitive>
    threshold: <value>
safety_overrides:                    # baked-in, user-disableable
  - payment_failed
  - service_cancellation_notice
  - account_change_notice
baseline:                            # state the rule needs to remember
  <field>: <value>
  computed_from: [<msg_ids>]
  last_updated: <date>
```

### Condition Primitives

A small, reusable vocabulary. The reasoning pass supports only these — no LLM-improvised conditions:

- `field_equals_baseline` / `field_changed_from_baseline`
- `field_crossed_threshold` (>, <, %-change)
- `field_in_range`
- `absence_of_signal` (expected event missed)
- `failed_action` (payment bounce, login failure)
- `relationship_class_matches`
- `recency_filter` (inactive for N days)

### Rule Decomposition from Natural Language

User statements are compound. Decomposition pipeline:
1. LLM parses the statement into a candidate `AlertRule`.
2. **Sender resolution** — "my internet bill" is a concept, not a sender. Match to a known recurring sender; if ambiguous, mark rule `pending` and resolve on the next matching email.
3. **Confirmation step** — system restates the decomposed rule ("I'll suppress monthly bills from Comcast unless the amount changes. Correct?"). User confirms before the rule activates.

### Sticky Baselines

For quantitative rules (bill amounts, account balances), the baseline does **not** auto-update when the exception fires. Requires explicit user acknowledgment (reply "expected") to move. Rationale: if the user missed an alert, auto-updating would suppress the next month's alert too.

For usage-based metrics with natural drift, baselines can smooth via a moving window. Per-pattern choice.

### Safety Overrides

Baked-in events that surface regardless of any suppression rule:
- Payment failures / autopay bounces
- Service cancellations initiated upstream
- Account security / auth events
- Regulatory / compliance notices

User-disableable but on by default. Rationale: users say "don't notify me" about bills but almost certainly don't mean "even if autopay breaks."

---

## 5. Alert Entity — Lifecycle & State Machine

Alerts are first-class entities with a lifecycle, not just Top-of-mind fact references.

**States:**

```
new → surfaced → {snoozed_until(t) | acknowledged | dismissed | resolved}
snoozed_until(t) --(t expires)--> re-evaluate → {resolved | re-fired}
```

**Every transition is recorded** with timestamp, actor (user/system), and (for snooze) the duration or reason. Alerts retain full history for audit and for "you snoozed this last week" context in re-fire messages.

**Grounding.** Every alert points to the triggering facts (source emails, prior facts, AlertRule reference if applicable). Wiki_agent uses this to re-verify at read time (§Part 4).

---

## 6. Alert Cascades

A chain of lifecycle-linked alerts anchored to a single underlying forward-dated fact. Example: a free trial generates a cascade anchored to `Subscription.end_date`:

- 14 days before → low-priority heads-up
- 7 days before → active alert
- 2 days before → final reminder
- Day-of → "converts today"
- Day-after → "charged $X unless you've cancelled"

All cascade steps share source grounding. They fire and decay independently but **coordinate lifecycle**:
- User cancels the trial → every remaining cascade step auto-resolves.
- User snoozes one step → that step re-fires on schedule; other cascade steps continue unchanged.

Cascades apply to: trial endings, subscription renewals, deadline approaches, card expiries, scheduled deliverables.

---

## 7. External-System Alerts

Alerts originating from authoritative external systems (cloud providers, dependency scanners, bank security, regulatory senders) are a distinct type.

```yaml
entity: ExternalSystemAlert:<slug>
source_system: google_cloud | github | aws | ...
alert_type: security_vulnerability | service_outage | ...
severity: critical | high | medium | low
linked_asset: <Asset entity ref>
external_id: CVE-2026-1234
deadline: <date>
recommended_action: <prose>
```

Properties:
- **Authoritative source bypasses `conditional` tier logic** — treated as if sender were `important`.
- **Severity is structured**, not prose. Enables prioritization in digest.
- **Asset linkage** ties to a user's owned systems (Cloud Run service, repo, account).
- **Upstream resolution detection** — follow-up emails ("patched," "resolved") auto-close the alert without requiring user action.

Safety overrides for critical external alerts bypass all suppression rules.

---

## 8. R5.4 — Alert Actions as a User-Write Path

Extends R5 layered writes with a fourth subtype specific to alerts:

> **R5.4 — Alert actions.** User acts on a surfaced alert (snooze, dismiss, acknowledge, resolve). Writes a state transition on the alert entity with timestamp and scope (duration for snooze, reason for dismiss).

Not the same as R5.1 (explicit-remember), R5.2 (ambient), or R5.3 (correction) — those operate on source facts. R5.4 operates on **existing surfaced alerts**, transitioning their lifecycle state.

**Authority.** High within the alert's scope; does not affect the underlying triggering facts. Example: snoozing a "trial ending" alert does not change the trial's end date — it only defers the reminder.

**Natural-language duration resolution.** "Next week," "a few days," "until I'm back from vacation" → resolve to concrete `snoozed_until` timestamps. "Until I'm back" requires external calendar context; falls back to asking the user if unresolvable.

**Missed snooze re-fires.** If a snooze expired before any digest / surface opportunity, the alert re-fires once at the next opportunity with a note ("snoozed to [date], now [N] days overdue").


## 9. Alert Coalescing

Wiki_agent must return related alerts in a form that lets the digest agent group them. Example: three free-trial cascades firing in the same week coalesce into one digest line:

> 3 subscriptions changing this week: Figma Pro (Mon), Claude Pro (Wed), GitHub Copilot (Fri).

Coalescing is a **rendering decision** made by the digest agent, but requires wiki_agent to:
- Tag each alert with a category (subscription-change, security, deadline, preference-conflict, etc.).
- Return alerts with their category + relative time, letting the consumer group by category + window.
- Avoid coalescing across severity boundaries (don't coalesce a "critical security" alert with a routine trial-ending one).

---

# Part 4 — Digest Read Path

## 1. Trigger

Morning cron in the user's local timezone (e.g., 07:00), or user opens the app / asks the assistant "what's today looking like?"

## 2. Digest Agent Invokes `wiki_agent`

The digest agent does not touch graph storage directly. It makes one call:

```
wiki_agent.digest_context(user_id, window=today)
```

The call passes **intent**, not a storage query. The wiki_agent owns what "today's context" means. This is R6's gateway pattern — it insulates the digest from schema churn.

## 3. Time Boundaries

- `today` = user's local calendar day.
- `horizon` = today + next 7 days (upcoming events, deadlines).
- `delta_since` = timestamp of the last digest (usually ~24h ago).

Clocks are user-local, not server-local.

## 4. Priority Pulls from Drawers

Token budget is finite (~2–4K tokens for a daily packet). Highest-value content first:

1. **Due / overdue commitments** (unmissable, always included).
2. **Events happening today.**
3. **Overnight delta** — new commitments, supersedes changes, new alerts, new life-thread activity since last digest. This is the highest-value slice; it's the "what happened while you slept" lift.
4. **Active alerts** (from Part 3) — coalesced by category, prioritized by severity, with re-verification (§6).
5. **Top-of-mind items** — filtered by entry-clock (far-future events not yet within 14d excluded).
6. **Waiting-on signals** — derived by the reasoning pass, now surfaced.
7. **Upcoming within 7d.**
8. **Active life threads** (activity in last ~7 days).
9. **Entity context — pulled by reference only** for entities that appear in items 1–8. No full-drawer dumps.

## 5. Sensitive-Zone Exclusion (Default)

Per R8, sensitive facts are excluded from the default packet. The wiki_agent:
- Omits sensitive details entirely (preferred for morning digest UX), OR
- Surfaces a HITL consent prompt if a pre-approved policy allows it.

Default: omit. Morning consent prompts are bad UX. The digest can say "doctor's appointment at 2pm" without disclosing the condition.

## 6. Alert Re-Verification at Read Time

Before including an alert in the packet, wiki_agent re-verifies its grounding:
- Is the underlying issue still open? (Vulnerability patched? Trial cancelled? Meeting rescheduled away?)
- Is the linked preference / constraint still active?
- Has severity changed?

Alerts that fail re-verification are dropped (with the alert entity marked `auto_resolved`). This prevents stale alerts without requiring lazy recomputation.

## 7. Packet Structure

The packet is **structured, not prose** — the wiki_agent hands structured data; the digest agent writes the brief.

```json
{
  "user_local_date": "2026-04-22",
  "happening_today": [...],
  "due_today": [...],
  "waiting_on": [
    { "from": "Bob", "re": "Q2 planning doc review", "last_nudge_days": 2 }
  ],
  "new_overnight": [
    { "summary": "Westside Elementary: parent-teacher conference Nov 3",
      "drawer": "commitments", "source": ["msg_8812"] }
  ],
  "alerts_from_overnight": [
    { "type": "preference_conflict",
      "severity": "medium",
      "summary": "School served fish yesterday; kid is vegetarian",
      "grounding": ["msg_8812", "kid.food_preference=vegetarian (msg_4401)"],
      "suggested_action": "check in with school or kid" }
  ],
  "active_alerts": [
    { "type": "subscription_change",
      "coalescable_category": "subscription-change",
      "summary": "Figma Pro trial ends in 7 days",
      "lifecycle": { "state": "surfaced", "cascade_position": "7d_before" },
      "suggested_actions": ["cancel_trial", "keep", "snooze"] }
  ],
  "upcoming_7d": [...],
  "active_threads": [...],
  "entities_referenced": {
    "Sarah Chen": { "role": "Staff Engineer @ Stripe", "relationship_class": "work" }
  },
  "packet_meta": {
    "token_estimate": 2847,
    "trimmed_items": 3,
    "sensitive_omitted": true
  }
}
```

`packet_meta.trimmed_items` is a transparency signal — digest agent knows items were cut and can request expansion on follow-up.

## 8. Digest Agent Generates the Brief

Two inputs: the packet (graph context) + the raw overnight emails (available on demand). The graph packet is what buys the lift:

| Without graph | With graph |
|---|---|
| "Meeting with sarah@stripe.com at noon." | "Starbucks with Sarah Chen (Staff Eng at Stripe) at noon — she moved it from Monday's 10am. She said she'd bring the draft doc." |
| "New email from Westside Elementary." | "Heads up: the school served fish yesterday and [kid] is vegetarian. Might be worth checking in." |
| *(nothing about Bob — no cross-email memory)* | "Still waiting on Bob's Q2 doc review — 2 days since your last nudge." |
| *(nothing about the trial)* | "Figma Pro trial ends in 7 days. Auto-converts to $15/mo." |

## 9. Freshness Sweep Before Delivery

Just before rendering, digest agent re-queries wiki_agent for anything that arrived in the last few minutes (hot-path ingest racing with digest generation). Prevents shipping a digest that's already stale.

## 10. Follow-Up Queries

Users can ask the assistant: *"wait, what time was that meeting originally?"* — the agent calls wiki_agent again, which can pull the archived supersedes chain on-demand. This is why R4 says archived facts are never deleted.

User alert actions (snooze, dismiss, etc.) from the digest UI route into R5.4 state transitions.

---

# Open Questions (for ERD)

The concrete data model and Firestore schema is now in [2026-04-life-graph-data-model.md](./2026-04-life-graph-data-model.md). Storage-shape questions below that it addresses are noted inline; what remains here is mostly tuning, identity-resolution, and policy.

## Part 1 (Cold Start)

- **Composite score weights** for sender ranking in Phase 0. Needs tuning on real mailboxes.
- **Phase 2 cutoff (top 30 vs top 50).** Bounded by token budget.
- **Phase 3 thread-detection heuristic.** Subject-based? Thread-ID? LLM-judged clustering?
- **Phase 4 window (14 days).** Empirical; may need to vary by mail volume.
- **"Family" inference signal taxonomy.** Enumerate signals (bidirectional frequency, intimate language, shared-kid references, shared-surname on common domains).
- **Storage representation** for free-form notes. Markdown + YAML, notes table, or object storage?
- **Re-backfill semantics** when schema changes: automatic on deploy, or opt-in?

## Part 2 (Ongoing Ingest)

- **Sender tier decay policy.** Six-month no-engagement is a starting number; needs tuning.
- **Event identity keys.** Exact formula for participant overlap + time-window + subject clustering + thread-ID.
- **Subject-pattern learning threshold.** How many signals before a pattern is promoted?
- **Hot-path latency budget.** <30s assumed; depends on Stage B model.
- **Warm-path batching window.** 5–10 minutes proposed.
- **Body-short threshold** for quote-missing thread-context fallback.
- **Pending-classification refinement.** How many subsequent signals before `pending` resolves?

## Part 3 (Reasoning & Alerts)

- **Post-ingest pattern library.** Start with 6 patterns; cadence for adding more?
- **Severity scoring per pattern.** What makes preference-conflict medium vs. high?
- **AlertRule decomposition reliability.** How often does the NL → structured-rule pipeline produce a rule the user would actually confirm? Needs eval set.
- **Sticky baseline policy.** When is auto-update safe (usage metrics) vs. dangerous (bill amounts)? Per-pattern default.
- **Safety override taxonomy.** Fixed list; user-disableable? On/off per override or global?
- **Scheduled pass cadence.** Daily pre-digest is the baseline. Do we need intraday sweeps for high-severity external alerts?
- **Forward-dated fact index.** Storage design to efficiently retrieve "facts with trigger before date X."
- **Alert cascade schema.** How do linked alerts reference each other and coordinate lifecycle on resolution / cancellation?
- **Coalescing rules.** Category + time-window deterministic vs. LLM-judged? Probably deterministic for digest stability.
- **Natural-language snooze resolution.** "Until I'm back from vacation" requires calendar context; fallback strategy?
- **Missed snooze policy.** Re-fire once on next digest, or suppress to next scheduled trigger?
- **External-system resolution detection.** Matching follow-up emails to their original alerts — external_id when present, else entity + content matching.
- **Upstream alert dedup.** GCP sends daily reminders about the same vulnerability — collapse to one alert with history, don't re-fire daily.

## Part 4 (Digest Read Path)

- **Packet token budget.** 2–4K starting number; depends on digest-agent model and brief length.
- **Packet caching.** Per-request vs. cached with invalidation. Probably per-request initially.
- **Waiting-on materialization.** Reasoning-pass-derived or query-time? Reasoning-pass favored; needs materialized-view cost analysis.
- **Resolution signal taxonomy.** Reply + content match, "done"/"thanks" acknowledgment, deadline passed with activity, calendar shows event occurred. Precise definitions needed.
- **Multi-tenant wiki_agent.** Single service vs. per-user? Affects latency and cost.
- **Empty-state handling.** Day 0 / low-graph-state digest degradation — say what's there, don't fabricate.
- **Digest agent / wiki_agent contract versioning.** Schema evolution without breaking digest.
- **Alert re-verification depth.** How much of the grounding chain does wiki_agent re-check per alert per packet assembly?

---

# Cross-References

- [2026-04-life-graph-strategy.md](./2026-04-life-graph-strategy.md) — parent strategy.
  - Part 1 addresses R9 (cold start).
  - Part 2 addresses R3 (ingest policy), R4 (fact update semantics), R5 (user-write paths including the sender-demote gap), R7 (decay), R8 (sensitivity routing).
  - Part 3 introduces the **post-ingest reasoning pass** and **scheduled reasoning pass**, the **AlertRule / Alert / ExternalSystemAlert** entity types, and **R5.4 (alert actions)** as an extension to R5.
  - Part 4 addresses R6 (read contract via wiki_agent and named context packets).

## Still to Explore (Deferred Scenarios)

Scenarios that would expose additional reasoning primitives not yet covered:
- **Meeting without agenda, 24h out** — absence-of-signal as a distinct trigger type (expected fact did *not* arrive).
- **Someone changed jobs** — entity mutation propagation with ripple effects to linked entities.
- **Tax season / cookie season** — cyclic life threads that auto-activate on a calendar.
