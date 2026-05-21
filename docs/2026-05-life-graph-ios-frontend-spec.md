# Life Graph — iOS Frontend Spec

**Audience:** iOS app team (designers + engineers building the Yahoo Mail iOS client)
**Date:** 2026-05-06
**Status:** Design hand-off for the iOS Life Graph experience, agent-first cold start

This spec describes the iOS UI for the Life Graph feature, plus the full backend API contract iOS needs. It is **self-contained** — the iOS team does not need access to the YAI server-side spec to implement against this document.

iOS calls the same `/yai/life-graph-agent/*` endpoints the existing web client uses. §4 below restates the request / response shapes verbatim. The web reference is the dev console at `app/life-graph/page.tsx` in this repo; the iOS surface must expose the same data and same cold-start flow but in a **consumer-grade, agent-led** form factor — no JSON viewers, no API call tables, no manual polling buttons.

---

## 1. Product framing

### 1.1 What is the Life Graph (recap)
The Life Graph is the user's personal knowledge graph derived from their inbox: people they care about, organizations, events, commitments, and life threads — each with a dossier of facts, citations back to source emails, and relationships connecting them. Building it requires a one-time **cold-start backfill** over the last 12 months of mail.

### 1.2 Why agent-led on iOS (and not on web)
On web today the user sees a multi-step pipeline UI — they click *Start*, review a 200-row candidate table, click *Run Deep Extraction*, watch a progress bar. That is correct for a dev console; it is wrong for a consumer iOS surface.

On iOS the cold start is fronted by a **chat agent**. The user never sees the words "phase 0", "structural scan", or "extractor". They see a friendly conversation that:
1. Explains what the Life Graph is.
2. Asks permission to scan their mail.
3. Surfaces the top senders it found and lets the user adjust.
4. Streams progress in plain language.
5. Hands the finished graph back and minimises itself.

The agent persists. Future invocations (out of scope for v1) will let the user say "this person isn't my doctor, they're my dentist" or "this commitment is already done" and have the agent patch the graph. v1 must leave room for those flows but not implement them.

---

## 2. Screen map

```
Tab bar → "Life Graph" tab
  ├── LifeGraphHomeView                    (root)
  │     ├── EmptyState (no graph yet)        → tap "Create my Life Graph" → opens AgentSheet
  │     ├── BuildingState (cold start in flight) → AgentBubble pinned, summary card
  │     └── ReadyState (graph populated)     → drawer-grouped entity list, AgentBubble minimised
  │
  ├── AgentSheet                           (bottom sheet, swipe-to-minimise)
  │     ├── ConversationView                 (message list)
  │     ├── AttachmentCards                  (candidate picker, progress meter, summary)
  │     └── Composer                         (single-line, not used in v1 cold start — agent-driven)
  │
  └── EntityDetailView                     (push)
        ├── Header (label, type pill, drawer)
        ├── DossierSection
        ├── RelationshipsList
        ├── SourcesList                      (links back into the mail app)
        └── "Ask the agent" button           (placeholder — opens AgentSheet, future scope)
```

There is **no separate "Pipeline" tab and no "Ongoing Ingest" tab on iOS**. Those are dev-console concerns; the iOS app exposes only the consumer surface.

---

## 3. State machine

The home view's state is derived from the result of one call (`GET /backfill/status/<lastJobId>`) and one fallback (`GET /graph`). The states are:

| State | Trigger | UI |
|---|---|---|
| `unknown` | App just launched, no cached state | Skeleton + spinner |
| `empty` | `GET /graph` returns 0 entities AND no in-flight job | EmptyState — "Create my Life Graph" CTA |
| `agent_intro` | User tapped CTA, agent has not started a job yet | AgentSheet expanded, agent welcomes user |
| `awaiting_approval` | `/backfill/start` returned candidates, user has not approved yet | AgentSheet expanded, candidate-picker card |
| `building` | `/runDeepExtraction` accepted, polling status | AgentSheet minimised by default but expandable; home shows "Building your graph…" card |
| `ready` | `status === 'completed'` OR graph has entities | Full graph view, AgentBubble minimised |
| `capped` | `status === 'capped'` | Same as ready, but a one-time toast "We hit our daily limit — your graph covers most senders" |
| `failed` | `status === 'failed'` | Home shows error card with "Try again" — re-opens AgentSheet |

State persists across app launches via:
- `currentJobId` in `UserDefaults`
- The agent conversation history in a local `Conversation.json` (Core Data is overkill for v1)

When the app launches with a `currentJobId` whose status is `running`/`pending`, jump straight to the `building` state and resume polling.

---

## 4. API contract (self-contained)

All endpoints are mounted under the YAI base path `/yai/life-graph-agent`. Every call carries:

- `Authorization: Bearer <yahoo-token>` — the user's Yahoo session token (already used by every other Yahoo Mail iOS API call)
- `X-App-Token: <hmac>` — the standard app-level HMAC header the iOS app already attaches to YAI calls

The Yahoo token resolves to a `uid = guid_<accountId>` server-side. iOS just passes it; no UID handling on the client.

### 4.1 Endpoints iOS uses

| # | Method | Path | Sync | Purpose |
|---|---|---|---|---|
| 1 | `GET` | `/whoami` | sync | Returns `{ accountId, email, mailboxId }` for the authenticated user. Used to seed the cold-start request. |
| 2 | `POST` | `/backfill/start` | **synchronous (5–30s)** | Initialises the user profile, runs phase 0 structural scoring, returns the top 200 sender candidates. |
| 3 | `POST` | `/backfill/runDeepExtraction` | **async (returns 202)** | Takes the user-approved subset of candidates and kicks off phase 1 + phase 2 in the background. |
| 4 | `GET` | `/backfill/status/{jobId}?accountId=<id>` | sync | Polled every 5s while the job runs. Reports phase, status, partial results. |
| 5 | `GET` | `/graph?accountId=<id>` | sync | Returns the full set of entities + notes + counts. Called after build, on pull-to-refresh, and on cold-launch when the home view enters `ready`. |
| 6 | `DELETE` | `/delete?accountId=<id>` | sync | Wipes the user's Life Graph entirely (profile, entities, notes, jobs). |

### 4.2 `GET /whoami`

**Request:** auth headers only.

**Response 200:**
```json
{ "accountId": "180001", "email": "owner@yahoo.com", "mailboxId": "abcd-1234" }
```

iOS keeps `accountId` for the rest of the session.

### 4.3 `POST /backfill/start`

**Request body:**
```json
{ "accountId": "180001" }
```

**Response 200** (after 5–30s):
```json
{
  "jobId": "uuid",
  "uid": "guid_180001",
  "email": "owner@yahoo.com",
  "candidates": [
    {
      "email": "alice@stripe.com",
      "name": "Alice Chen",
      "score": 290,
      "signals": {
        "sentTo": true,
        "starCount": 3,
        "threadCount": 5,
        "openWithDwellCount": 12
      }
    }
  ]
}
```

`candidates` is up to 200 items, sorted by `score` descending. iOS shows the top 10 pre-selected in the candidate picker (§5.1 step 3); "See more" expands to the next 20. Signals power the human-readable "why this sender ranked" line:

| Signal | Meaning | Suggested chip text |
|---|---|---|
| `sentTo: true` | The user has sent this address mail | "↩ You've replied" |
| `starCount: N` | Messages from this sender that the user starred | "★ {N} starred" |
| `threadCount: N` | Conversations with back-and-forth between user and sender | "⇄ {N} threads" |
| `openWithDwellCount: N` | Messages the user opened (read) | "✓ {N} opened" |

**Errors:** `400` missing `accountId`, `401` missing/invalid token, `5xx` transient (auto-retry per §8.3).

After this call returns, iOS persists `currentJobId` in `UserDefaults` and shows the candidate picker.

### 4.4 `POST /backfill/runDeepExtraction`

**Request body:**
```json
{
  "accountId": "180001",
  "jobId": "uuid-from-start",
  "approvedEmails": ["alice@stripe.com", "bob@gmail.com"]
}
```

`approvedEmails` must be a non-empty subset of the `candidates[].email` from the `/backfill/start` response. The server rejects emails it does not recognise.

**Response 202** (returns immediately, work continues server-side):
```json
{ "jobId": "uuid", "accepted": 10 }
```

**Errors:** `400` empty/unrecognised `approvedEmails`, `401` auth, `404` unknown `jobId`, `5xx` transient.

Once 202 lands, iOS starts the 5s status poll. There is no streaming response — the status endpoint is the only progress channel.

### 4.5 `GET /backfill/status/{jobId}?accountId=<id>`

**Response 200** (full shape — iOS only consumes a subset; see §4.5.2):
```json
{
  "phase": 2,
  "status": "running",
  "costSpent": 0.0731,
  "errorCount": 0,
  "calls": [ { "ts": 1778007204498, "method": "GET", "url": "/messages/...", "status": 200 } ],
  "callCount": 44,
  "phase1SenderResults": [
    {
      "email": "alice@stripe.com",
      "name": "Alice Chen",
      "compositeScore": 290,
      "decision": "accepted",
      "rejectReason": null,
      "profile": {
        "entityType": "person",
        "relationshipClass": "work",
        "roleLabel": "Boss at Stripe",
        "senderTier": "important",
        "confidence": 0.92
      },
      "emailSamples": [{ "subject": "...", "snippet": "..." }],
      "promptText": "...",
      "llmResponse": "..."
    }
  ],
  "phase2EntityProgress": [
    {
      "entityId": "ent_xxx",
      "email": "alice@stripe.com",
      "label": "Alice Chen",
      "msgsFetched": 12,
      "notesProduced": 1,
      "relationshipsProduced": 3,
      "status": "done"
    }
  ],
  "phase2Consolidation": {
    "stubsMerged": 2,
    "duplicatesMerged": 0,
    "participantsResolved": 1
  }
}
```

#### 4.5.1 Job state machine
`status` walks through these values:
- `pending` — phase 0 done, waiting for `/runDeepExtraction`
- `running` — phase 1 or phase 2 in flight
- `completed` — phase 2 finished cleanly
- `capped` — server hit its per-job cost cap; partial graph is usable
- `failed` — uncaught error; nothing useful to show

`phase` advances `0 → 1 → 2 → 3` (the server returns `min(phase, 2)` for UI purposes — treat 3 as "deep extract done"). iOS renders progress against `min(phase, 2) / 2`.

iOS stops polling on `completed` / `capped` / `failed`.

#### 4.5.2 Fields iOS reads vs ignores

**Read:**
- `phase`, `status` — drives the home-view state machine (§3) and the agent's progress messages
- `phase1SenderResults` — count `decision === "accepted"` vs total to render "Classified {done} / {total} senders" in chat
- `phase2EntityProgress` — count `status === "done"` vs `phase2EntityProgress.length` to render "Built dossiers for {done} / {total}". Pull `label` and `email` if you want a "Now profiling: Alice Chen" sub-line (optional)
- `phase2Consolidation` — used in the final summary card after `completed`

**Ignore:**
- `calls`, `callCount` — internal Yahoo API trace, dev-console only
- `costSpent`, `errorCount` — diagnostic, not user-facing (the `capped` status itself is enough signal)
- `promptText`, `llmResponse`, `emailSamples` on phase1SenderResults — internal LLM trace
- Anything not listed in the "Read" set above

iOS must **not** render raw JSON, prompt text, or call traces. Those exist in the response for the dev console.

### 4.6 `GET /graph?accountId=<id>`

**Response 200:**
```json
{
  "entities": [ /* Entity[] — see §4.6.1 */ ],
  "notes":    [ /* Note[]   — see §4.6.2 */ ],
  "counts": {
    "entities": 47,
    "notes": 18,
    "byType":   { "person": 12, "organization": 8, "event": 5, "commitment": 9, "life_thread": 4, "asset": 3, "household": 1, "preference": 5 },
    "byDrawer": { "people_orgs": 20, "commitments": 14, "life_threads": 4, "top_of_mind_prefs": 5, "assets": 3, "households": 1 }
  }
}
```

iOS uses `counts.byType` (or its own re-count from `entities`) to populate the summary card after build (§5.1 step 8) and to drive section badges in the ReadyState list. `notes` is only needed if the user opens an EntityDetailView's source-emails section — otherwise iOS can drop it on the floor for v1.

#### 4.6.1 `Entity` shape (rendered)

```ts
interface Entity {
  id: string;                    // "ent_xxx"
  type:
    | "person" | "organization" | "household" | "asset"
    | "event" | "commitment" | "life_thread" | "preference"
    | "alert" | "alert_rule" | "external_system_alert";
  label: string;                 // "Alice Chen", "Anvay's 5th birthday"
  drawer:
    | "people_orgs" | "commitments" | "life_threads"
    | "top_of_mind_prefs" | "assets" | "households";
  emailAddresses: string[];      // empty for non-person entities
  aliases?: string[];            // alternative spellings of the label
  relationshipClass?: string;    // "family" | "work" | "school" | "doctor" | "vendor" | "service" | "newsletter" | "unknown"
  dossier?: string;              // markdown blob with inline [msg_xxx] citations — render in EntityDetailView
  isStub?: boolean;              // dashed border treatment if true (§6.4)

  sourceMessageIds?: string[];   // mail message ids — deeplink targets
  firstSeen?: FirestoreTs;
  lastUpdated?: FirestoreTs;

  relationships?: RelationshipEdge[];

  // sender-classification (people_orgs only)
  senderClass?: "important" | "conditional" | "junk";
  senderClassConfidence?: number;

  // event fields
  startTime?: FirestoreTs;
  endTime?: FirestoreTs;
  location?: string;
  participantIds?: string[];
  participantEmails?: string[];   // unresolved — render as yellow chips (§6.4)
  isRecurring?: boolean;
  recurrenceRule?: string;        // RRULE string
  nextOccurrence?: FirestoreTs;
  seriesEndDate?: FirestoreTs;

  // commitment fields
  dueDate?: FirestoreTs;
  resolvedAt?: FirestoreTs | null;
  owedBy?: string;                // entity id (or `uid` if owed by the user)
  owedTo?: string;                // entity id

  // life_thread
  lifeThreadStatus?: string;      // free-text, e.g. "active"
}

interface RelationshipEdge {
  slot: string;                   // "spouse", "employer", "child_of", "doctor"…
  toEntityId: string;             // resolve via the entities[] map
  sourceMessageIds: string[];
  firstSeen?: FirestoreTs;
  lastVerified?: FirestoreTs;
}

// Firestore timestamp shape comes through the wire as one of:
//   { _seconds: number, _nanoseconds: number }  // most common
//   { seconds: number, nanoseconds: number }    // when serialised differently
// iOS should accept either spelling.
interface FirestoreTs {
  _seconds?: number;
  seconds?: number;
  _nanoseconds?: number;
  nanoseconds?: number;
}
```

To convert: `Date(ts._seconds ?? ts.seconds, multiplied by 1000) + ns/1e6`. If both are absent the timestamp is null.

#### 4.6.2 `Note` shape

```ts
interface Note {
  id: string;
  sourceMessageId: string;
  sourceMessageIds?: string[];
  deliveryTime?: FirestoreTs;
  from: { name: string; email: string };
  subject: string;
  notesText: string;             // free prose, the entity dossier is derived from these
  contentTier: string;           // "two_stage" | other
  stageBStatus: "processed" | "pending" | "failed";
}
```

iOS does not show notes directly in v1. They exist only as the backing data for the dossier and the source-emails list.

### 4.7 `DELETE /delete?accountId=<id>`

**Response 200:** `{ "ok": true }` (any 2xx is success).

Used only from Settings → "Reset my Life Graph". After success, iOS clears `currentJobId`, the agent conversation log, and any cached graph data; the home view returns to `empty`.

### 4.8 Polling cadence

Poll `/backfill/status/{jobId}` every **5 seconds** while in the `building` state. Stop on `completed`, `failed`, or `capped`. Pause polling when the app backgrounds; resume on foreground. No silent push for v1.

### 4.9 Drawers (the consumer grouping)

The web reference groups by `type`; iOS groups by `drawer` because drawers map better to consumer mental models. The drawer-to-section mapping in ReadyState (§6.3) is:

| `drawer` value | Section header on iOS |
|---|---|
| `top_of_mind_prefs` | "Top of mind" |
| `people_orgs` | "People & Organisations" |
| `commitments` | "Commitments" |
| `life_threads` | "Life threads" |
| `households` | "Household" |
| `assets` | "Assets" |

Events live inside `commitments` drawer (the YAI server places them there). iOS surfaces an "Events" sub-section by filtering `entity.type === "event"` within the Commitments drawer.

---

## 5. The agent

The agent is **not an LLM running on the device**. It is a deterministic state machine with a chat-shaped UI. Each "turn" is just a hard-coded message tied to a state transition. v1 has no free-form input — the user only taps option chips ("Yes, scan my mail", "Use these 10", "Adjust selection", "Got it").

This is intentional: it gives us a chat surface to build into for v2 (where a real LLM will accept "fix this commitment" style prompts) without locking us into LLM latency or unpredictability for the common path.

### 5.1 Conversation script (cold start)

| # | Speaker | Message | Trigger / next action |
|---|---|---|---|
| 1 | agent | "Hi! I can build your Life Graph by scanning the last 12 months of your mail. I'll find the people, organisations, events, and commitments that matter to you. Ready?" + chips: `[Yes, scan my mail]` `[Not now]` | Initial open |
| 2 | agent | "Looking through your mail…" + indeterminate progress | After `/backfill/start` is called (5–30s) |
| 3 | agent | "I found {N} senders you actually engage with. Here are the top 10 — does this look right?" + **CandidatePickerCard** | After `/backfill/start` returns. The card shows the top 10 from `candidates`, pre-selected, with name + email + a single-line "why" derived from `signals` (e.g. "★ 3 starred · ⇄ 5 threads"). User can tap a row to deselect, or tap "See more" to expand to the next 20. No way to add senders not in the candidate list (v1 limitation). |
| 4 | user | (taps `[Use these]` on the card) | Calls `/runDeepExtraction` with checked emails |
| 5 | agent | "Got it — I'll build dossiers for these {N} senders. This usually takes a few minutes. I'll let you know when I'm done." + chips: `[Minimise]` | After 202 accepted. Tapping `[Minimise]` collapses the sheet but keeps the AgentBubble visible. |
| 6 | agent | "Classifying senders… {phase1Done}/{N} done" | Updated each poll while `phase: 1`. This is **edited in place** — do not append a new message every 5s. |
| 7 | agent | "Building dossiers… {phase2Done}/{N} senders processed" | Updated in place while `phase: 2`. |
| 8 | agent | "✨ Your Life Graph is ready. I found **{people} people**, **{orgs} organisations**, **{events} events**, and **{commitments} commitments**. Tap below to explore." + chips: `[Open my graph]` `[Minimise]` | On `status: completed` |
| 8a | agent | (alt) "I covered most of your important senders, but I hit my daily limit before finishing the rest. You can ask me to continue tomorrow. Here's what I built so far: …" | On `status: capped` |
| 8b | agent | (alt) "Something went wrong while building your graph. I can try again — no charge for retries." + chips: `[Try again]` `[Send feedback]` | On `status: failed` |

### 5.2 Message types

```swift
enum AgentMessage {
  case text(String, role: .agent | .user)
  case candidatePicker(CandidateList, selected: Set<Email>)   // step 3
  case progressMeter(label: String, done: Int, total: Int)    // steps 6, 7
  case summaryCard(EntityCounts, consolidation: ConsolidationSummary?) // step 8
  case errorCard(message: String, retryAction: () -> Void)
  case chips([Chip])                                          // attached to the previous message
}
```

`Chip` is `(label: String, action: ChipAction)`. ChipAction is an enum the home view dispatches on — never a free-form string.

### 5.3 Minimised state — the AgentBubble

When the AgentSheet is dismissed and a job is in flight or recently completed, a circular bubble pins to the bottom-right of the LifeGraphHomeView (above the tab bar, with safe-area padding). The bubble shows:
- A spinning border while building
- A green check for ~5s after completion, then fades to a static avatar
- A red dot for `failed` / `capped`

Tap to reopen the sheet at the latest agent message.

The bubble is **only present on the Life Graph tab**. It does not float across the whole app in v1.

---

## 6. Empty / building / ready views

### 6.1 EmptyState
Centered illustration + headline "Build your Life Graph" + subtitle "Let me scan your mail to find the people, events, and commitments that matter most." + primary button "Create my Life Graph".

Tapping the button opens AgentSheet at message #1.

### 6.2 BuildingState
The graph is being built. Show:
- A condensed status card at the top: "Building your Life Graph…" + a 2/3-filled progress bar (driven by `min(phase, 2) / 2`).
- Below it, a **preview list** of any entities that already exist in the partial graph (poll `/graph` every 30s during build — only call `/graph` if the graph view is visible).
- AgentBubble in the corner.

Do not show an empty list while building. Show skeleton rows.

### 6.3 ReadyState
The actual Life Graph view. Modeled on the web `LifeGraphView` but iOS-native.

Top-level layout: a vertically-scrolling list grouped by **drawer** (not by `type`, which is what the web does — drawers map better to consumer mental models):

```
Top of mind
  ★ pinned items (none in v1)

People & Organisations          ▾
  • Niti Patel — Spouse · Twilio
  • Hriyaan's school — Mission Valley Elementary
  …

Commitments                     ▾
  • Send insurance form to Dr. Lee — due May 12
  • Confirm dinner with Alice — due May 8
  …

Life threads                    ▾
  • Hriyaan's soccer season — Sat 8am, Apr 18 – May 17
  • House refi with Sandstone — active
  …

Events                          ▾
  • Anvay's 5th birthday — May 3, Hiller Aviation Museum
  …
```

Each drawer is collapsible; the count appears in the section header. Tap any row to push EntityDetailView.

There is **no JSON viewer, no relationship graph view, no source-message list at this level**. Those live in EntityDetailView.

### 6.4 EntityDetailView
Push navigation from a row tap. Sections:

1. **Header** — entity label, type badge (`person` / `organization` / `event` / `commitment` / etc., colour-coded), drawer.
2. **Dossier** — render `entity.dossier` markdown. Inline `[msg_xxx]` citations become tappable chips that open the Mail thread (use the existing iOS deeplink for messageId → mail viewer).
3. **Relationships** — list of `relationships` with slot label and target entity. Tap to push another EntityDetailView.
4. **Type-specific block** — events show start/end/location/recurrence; commitments show due date, owedBy, owedTo, resolved state.
5. **Source emails** — show the count and a "View source emails" row that pushes a list. Each source maps to a Mail deeplink.
6. **"Ask the agent about this"** — placeholder button at the bottom. v1: opens AgentSheet with a pre-filled chip "Tell me more about {label}" that, when tapped, just reads the dossier aloud (TTS) or shows a stub message "Coming soon — I'll be able to refine this with you in the next version." This button is the contract for v2's "fix issues in the graph" flow.

Stubs (`isStub: true`) render with a dashed border and the label "Mentioned but not yet profiled" — same as web.

---

## 7. Visual design

- Match the host iOS app's existing typography, spacing, and colour tokens. Do **not** introduce new design system primitives.
- Type badges use the same colour family the web uses but rendered as iOS pill shapes:
  - person → blue
  - organization → purple
  - event → orange
  - commitment → rose
  - asset → emerald
  - household → cyan
  - life_thread → indigo
  - preference → grey
- AgentSheet is a sheet with `.medium` and `.large` detents (iOS 16+). Default detent is `.medium` while user is interacting; use `.large` once the candidate picker is shown.
- AgentBubble is 56pt, system fill, with a 2pt animated border while building.
- Skeletons use the standard system shimmer.

---

## 8. Permissions, safety, and edge cases

### 8.1 First-run consent
Before calling `/backfill/start` for the first time, show a system-style sheet (NOT inside the agent chat) explaining:
- "We will scan up to the last 12 months of your mail metadata to build your Life Graph."
- "Some sender samples are sent to a Yahoo-hosted LLM for classification."
- "You can delete your Life Graph at any time from Settings."

The sheet has `[Continue]` and `[Cancel]`. This is shown exactly once per device. After that, the agent can call `/backfill/start` directly.

### 8.2 Re-running cold start
Settings → Life Graph → "Reset my Life Graph" calls `DELETE /graph`, clears the cached `currentJobId`, and returns the user to `empty`. Confirm-once destructive.

### 8.3 Network errors
Any 5xx during cold start is treated as transient. The agent shows: "I lost connection — let me try again in a few seconds." Auto-retry with backoff (1s, 2s, 4s, then give up and show step 8b).

### 8.4 Session expiry
401 from any endpoint → bounce the user to the existing app login flow. On return, restore the agent at its last message and continue polling if a job was in flight.

### 8.5 Backgrounding mid-build
Polling pauses when the app backgrounds (no remote silent-push for v1). On foreground, resume polling. If the job already completed while away, jump straight to step 8.

### 8.6 Cost cap visibility
`status: capped` means the YAI server hit `LIFE_GRAPH_COLD_START_BUDGET_USD`. The user does not need to see the dollar amount. Show step 8a's friendly message.

---

## 9. v2 surface area to leave room for (not implement)

These flows are **out of scope for v1** but the v1 architecture should not foreclose them:

- **Fix-this-fact**: from EntityDetailView, the user taps "Ask the agent" and types "this commitment is done" → agent flips `resolvedAt`. Backend endpoint TBD; UI hook is the placeholder button described in §6.4.
- **Add-this-person**: agent accepts free-form "add my dentist Dr. Lee" → creates a stub entity. Composer is hidden in v1 but the AgentSheet should already include it (disabled).
- **Daily-digest hand-off**: when the digest feature ships, the AgentBubble becomes the entry point ("here's your morning digest"). v1 ships the bubble but not the digest.
- **Resume from cap**: a "Continue building" button when in `capped` state would re-trigger `/runDeepExtraction` for the unprocessed candidates. Backend support for this is out of scope; the UI just needs a clear path.

The chat conversation log is persisted from v1 onwards so v2 can show prior context.

---

## 10. Build / hand-off checklist

For the iOS team to start:
- [ ] Generate Swift DTOs from §4 of this document — every endpoint, request, and response shape is enumerated there.
- [ ] Implement the state machine in §3 as a single `LifeGraphCoordinator` ObservableObject.
- [ ] Build the four core views: LifeGraphHomeView, AgentSheet, EntityDetailView, plus the AgentBubble overlay.
- [ ] Wire 5s polling with foreground/background gating.
- [ ] Persist `currentJobId` and the agent conversation log.
- [ ] Implement the candidate picker as a reusable card view (the only piece of bespoke chrome in v1).
- [ ] Hook up Mail deeplinks for `[msg_xxx]` citations and source emails.
- [ ] First-run consent sheet (§8.1).
- [ ] Settings entry for "Reset my Life Graph" (§8.2).

Out of scope for the first iOS cut:
- Free-form chat input
- LLM-driven agent responses
- The "Ongoing Ingest" tab from the web dev console
- The raw API call log, JSON viewer, prompt/response viewer
- Push notifications when the build completes (use foreground polling only)

---

## 11. Reference files

The iOS team should not need any of these to ship — §4 is the full contract. Listed here for cross-team debugging only:

| Concern | File (server-side, for debugging) |
|---|---|
| Web reference (dev console) — same flows, full surface | `app/life-graph/page.tsx` |
| Entity / Note / RelationshipEdge canonical types | `src/lib/life-graph/types.ts` |
| Drawer assignment logic | `src/lib/life-graph/extraction/stage-b.ts` |
| Candidate signals scoring | `src/lib/life-graph/cold-start/phase0-structural.ts` |
| Server contract (server team's spec) | `docs/2026-05-life-graph-yai-server-spec.md` |
