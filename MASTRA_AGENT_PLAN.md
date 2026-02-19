# Mastra Mail Triage Agent — Implementation Plan

## Goal

Build a Mastra agent that accepts an OAuth token from the client, fetches and triages inbox messages, and performs actions (mark read, star, move, delete) — with **human-in-the-loop approval** for destructive operations. The agent context is kept minimal by using slim message representations instead of full API payloads. Write APIs are **mocked** for now. Conversation history is persisted to **Supabase (Postgres)** keyed by user GUID + session ID.

---

## 1. Architecture Overview

```
┌──────────┐  token + guid       ┌────────────────────┐
│  Client   │ ──────────────────►│  Next.js API Route  │
│ (React)   │◄──────────────────│  POST /api/agent     │
└──────────┘    stream/json      └────────┬───────────┘
                                          │ runtimeContext: { token }
                                          │ memory: { resource: guid, thread: sessionId }
                                          ▼
                                 ┌────────────────────┐
                                 │  mailTriageAgent    │
                                 │  (Mastra Agent)     │
                                 │  model: gemini-flash │
                                 │  memory: Supabase PG │
                                 └────────┬───────────┘
                                          │ calls tools
                      ┌───────────────────┼───────────────────┐
                      ▼                   ▼                   ▼
               ┌─────────────┐   ┌──────────────────────────────┐
               │ Read Tools   │   │ Write/Update/Delete Tools     │
               │ (no approval)│   │ (ALL require HITL approval)   │
               │              │   │ (ALL MOCKED — log & return OK)│
               │ • getMailbox │   │                                │
               │ • listFolders│   │ • markAsRead                   │
               │ • listMessages│  │ • starMessages                 │
               │ • getMsgBody │   │ • moveMessages                 │
               │ • searchMsgs │   │ • deleteMessages               │
               └──────┬───────┘   └──────────────┬───────────────┘
                      │                           │
                      ▼                           ▼
             ┌────────────────┐          requireApproval: true
             │ Yahoo Mail API │          (stream pauses, client
             │ (server-side)  │           approves/declines,
             └────────────────┘           then mock executes)
```

---

## 2. Model: Google Gemini Flash

The agent uses `google/gemini-2.0-flash` via the `@ai-sdk/google` provider (already installed).

```ts
// Agent model config — simple string format
model: "google/gemini-2.0-flash"
```

Requires `GOOGLE_GENERATIVE_AI_API_KEY` in `.env` (already present).

---

## 3. Memory: Supabase (Postgres) via `@mastra/pg`

### 3.1 Why Supabase?

The project already uses Supabase. Instead of local/in-memory storage, we use `PostgresStore` from `@mastra/pg` pointed at the existing Supabase Postgres instance. Mastra auto-creates its required tables on first interaction.

### 3.2 Supabase Table for Agent History

We create a **dedicated Supabase table** `agent_sessions` to map user GUIDs to session IDs, making it easy to query/manage conversation threads outside of Mastra's internal tables.

```sql
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_guid TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_sessions_user_guid ON agent_sessions(user_guid);
CREATE INDEX idx_agent_sessions_lookup ON agent_sessions(user_guid, session_id);
```

- `user_guid` — Yahoo Mail user GUID (from mailbox API response)
- `session_id` — unique conversation thread ID (generated client-side or by the API route)
- Mastra's internal `mastra_threads` / `mastra_messages` tables store the actual conversation data, keyed by `resourceId = user_guid` and `threadId = session_id`

### 3.3 Memory Configuration

```ts
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";

const memory = new Memory({
  storage: new PostgresStore({
    id: "mail-agent-memory",
    connectionString: process.env.SUPABASE_DB_URL!, // Supabase Postgres direct connection string
  }),
  options: {
    lastMessages: 40,        // keep last 40 messages in context
  },
});
```

### 3.4 Passing Memory at Call Time

```ts
const response = await mailTriageAgent.stream("Triage my inbox", {
  runtimeContext,
  memory: {
    resource: userGuid,      // stable user identifier
    thread: sessionId,       // conversation session ID
  },
});
```

### 3.5 New Env Var Required

```env
# Direct Postgres connection to Supabase (not the REST API URL)
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_DB_URL=postgresql://postgres:...@....supabase.com:6543/postgres
```

This is the **direct Postgres connection string** from Supabase dashboard → Settings → Database → Connection string. Different from `NEXT_PUBLIC_SUPABASE_URL` (which is the REST API).

---

## 4. Auth & Token Passing

**Problem**: The existing `ApiClient` is a browser-side singleton. Agent tools run server-side and need per-request auth.

**Solution**: Create a lightweight server-side HTTP helper that tools call directly, receiving the token from Mastra's `runtimeContext`.

### File: `src/mastra/helpers/yahoo-api.ts`

A thin wrapper around `fetch` that:
- Targets `https://apis.mail.yahoo.com/ws/v3` directly (server-side, no proxy needed)
- Accepts `token` as a parameter (from runtimeContext)
- Adds `Authorization: Bearer {token}` and `appid=YahooMailIosMobile`
- Returns parsed JSON

```ts
// Conceptual API
export async function yahooGet<T>(token: string, endpoint: string): Promise<T>
export async function yahooPost<T>(token: string, endpoint: string, body: unknown): Promise<T>
export async function yahooDelete(token: string, endpoint: string): Promise<void>
```

This avoids the singleton issue and keeps tools stateless.

---

## 5. Minimal Context Strategy

Full `Message` objects are large (folder metadata, decos, schemaOrg, attachments, modSeq, etc.). The agent doesn't need all of this.

### Slim Types: `src/mastra/types.ts`

```ts
/** What the agent sees when listing messages */
interface SlimMessage {
  id: string
  conversationId: string
  subject: string
  from: string           // "John Doe <john@example.com>" — single string
  to: string             // "jane@example.com" — single string
  date: string           // ISO 8601 human-readable
  snippet: string        // first ~100 chars of body
  isRead: boolean
  isStarred: boolean
  hasAttachments: boolean
  folderName: string
}

/** What the agent sees when listing folders */
interface SlimFolder {
  id: string
  name: string
  type: string           // "INBOX" | "SENT" | "DRAFT" | "TRASH" | etc.
  unreadCount: number
}
```

Each tool's `outputSchema` uses these slim types so the LLM context stays small. Only `getMessageBody` returns the full text/HTML when the agent decides it needs to read a specific message.

### Mapper Functions: `src/mastra/types.ts`

```ts
/** Convert full API Message → SlimMessage */
export function toSlimMessage(msg: Message): SlimMessage { ... }

/** Convert full API Folder → SlimFolder */
export function toSlimFolder(folder: Folder): SlimFolder { ... }
```

---

## 6. Tools Definition

All tools live under `src/mastra/tools/`. Each tool accesses the Yahoo API via the server-side helper and the token from `runtimeContext`.

### 6.1 Read Tools (no approval required) — LIVE API calls

| Tool | ID | Description | Input | Output |
|------|----|-------------|-------|--------|
| **getMailbox** | `get-mailbox` | Get the user's primary mailbox ID and email | _(none)_ | `{ mailboxId, email }` |
| **listFolders** | `list-folders` | List all folders with unread counts | `{ mailboxId }` | `SlimFolder[]` |
| **listMessages** | `list-messages` | List messages in a folder (paginated) | `{ mailboxId, folderId, count?, offset? }` | `SlimMessage[]` |
| **searchMessages** | `search-messages` | Search messages by query | `{ mailboxId, query }` | `SlimMessage[]` |
| **getMessageBody** | `get-message-body` | Get full text/HTML body of one message | `{ mailboxId, messageId }` | `{ text, html? }` |

### 6.2 Write/Update Tools (human approval required) — MOCKED

**All write, update, and destructive operations require human approval.** The stream pauses before execution, the client presents the action to the user, and the user approves or declines.

| Tool | ID | Description | Input | Output | Risk Level |
|------|----|-------------|-------|--------|------------|
| **markAsRead** | `mark-as-read` | Mark messages as read/unread | `{ mailboxId, messageIds[], read }` | `{ success, count }` | Low (state change) |
| **starMessages** | `star-messages` | Star/unstar messages | `{ mailboxId, messageIds[], starred }` | `{ success, count }` | Low (state change) |
| **moveMessages** | `move-messages` | Move messages to another folder | `{ mailboxId, messageIds[], targetFolderId }` | `{ success, movedCount }` | Medium (relocates data) |
| **deleteMessages** | `delete-messages` | Permanently delete messages | `{ mailboxId, messageIds[] }` | `{ success, deletedCount }` | High (irreversible) |

**Mock behavior**: All log the action and return success without calling Yahoo API.

All four tools use `requireApproval: true`:

```ts
const markAsRead = createTool({
  id: "mark-as-read",
  description: "Mark one or more messages as read or unread.",
  inputSchema: z.object({
    mailboxId: z.string(),
    messageIds: z.array(z.string()),
    read: z.boolean(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    count: z.number(),
  }),
  requireApproval: true,  // <-- stream pauses, user must approve
  execute: async ({ context }) => {
    console.log(`[MOCK] Marking ${context.messageIds.length} messages as ${context.read ? "read" : "unread"}`);
    return { success: true, count: context.messageIds.length };
  },
});

const deleteMessages = createTool({
  id: "delete-messages",
  description: "Permanently delete one or more messages. This is irreversible.",
  inputSchema: z.object({
    mailboxId: z.string(),
    messageIds: z.array(z.string()),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    deletedCount: z.number(),
  }),
  requireApproval: true,  // <-- stream pauses, user must approve
  execute: async ({ context }) => {
    console.log(`[MOCK] Deleting ${context.messageIds.length} messages:`, context.messageIds);
    return { success: true, deletedCount: context.messageIds.length };
  },
});
```

When the agent invokes any write tool, the stream emits a pause event. The client calls `agent.approveToolCall({ runId })` or `agent.declineToolCall({ runId })`.

---

## 7. Agent Definition

### File: `src/mastra/agents/mail-triage.ts`

```ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg";

const memory = new Memory({
  storage: new PostgresStore({
    id: "mail-agent-memory",
    connectionString: process.env.SUPABASE_DB_URL!,
  }),
  options: {
    lastMessages: 40,
  },
});

export const mailTriageAgent = new Agent({
  id: "mail-triage-agent",
  name: "Mail Triage Agent",
  model: "google/gemini-2.0-flash",
  memory,
  instructions: `You are a mail triage assistant. You help users manage their inbox efficiently.

CAPABILITIES:
- Fetch and list inbox messages with minimal metadata
- Read full message bodies when needed for triage decisions
- Mark messages as read/unread (requires user approval)
- Star/unstar important messages (requires user approval)
- Move messages between folders (requires user approval)
- Delete messages (requires user approval)

WORKFLOW:
1. First call getMailbox to get the mailboxId
2. Then call listFolders to understand the folder structure
3. Use listMessages to fetch inbox messages
4. Analyze messages and suggest triage actions
5. For ANY write/update/delete action, ALWAYS explain what you're about to do
   and why BEFORE calling the tool — the system will ask the user for approval
6. The user will approve or decline each write operation independently

CONTEXT RULES:
- When summarizing messages, use the slim metadata (subject, from, snippet, date)
- Only fetch full message body (getMessageBody) if you need to read the content
- Keep your responses concise — list messages in a table or bullet format
- When triaging, categorize messages as: Important, Newsletter, Promotional, Social, Spam

SAFETY:
- Never perform any write operation without explaining your reasoning first
- Prefer moving to Trash over permanent deletion when available
- For bulk operations, list which messages will be affected before acting
- All write/update/delete operations will pause for user approval — this is enforced by the system`,

  tools: {
    getMailbox,
    listFolders,
    listMessages,
    searchMessages,
    getMessageBody,
    markAsRead,
    starMessages,
    deleteMessages,
    moveMessages,
  },
});
```

---

## 8. Mastra Instance Registration

### File: `src/mastra/index.ts` (update existing)

```ts
import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { PostgresStore } from "@mastra/pg";
import { mailTriageAgent } from "./agents/mail-triage";

export const mastra = new Mastra({
  agents: { mailTriageAgent },
  storage: new PostgresStore({
    id: "mastra-storage",
    connectionString: process.env.SUPABASE_DB_URL!,
  }),
  logger: new PinoLogger({ name: "Mastra", level: "info" }),
});
```

---

## 9. API Route for Client Integration

### File: `app/api/agent/route.ts`

A Next.js API route that:
1. Receives the OAuth token from the client (via Authorization header)
2. Receives `userGuid` and `sessionId` from the request body
3. Upserts a row in the `agent_sessions` Supabase table
4. Creates a `RuntimeContext` with the token
5. Calls `mailTriageAgent.stream()` with memory context (`resource: userGuid`, `thread: sessionId`)
6. Streams the response back (including HITL pause events)

```ts
// Pseudocode
export async function POST(req: Request) {
  const { message, userGuid, sessionId, runId, action } = await req.json();
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  const runtimeContext = new RuntimeContext();
  runtimeContext.set("token", token);

  // Handle approval/decline for HITL
  if (action === "approve") {
    const resumed = await mailTriageAgent.approveToolCall({ runId });
    return streamResponse(resumed);
  }
  if (action === "decline") {
    await mailTriageAgent.declineToolCall({ runId });
    return new Response(JSON.stringify({ declined: true }));
  }

  // Upsert agent_sessions row in Supabase
  await supabase.from("agent_sessions").upsert({
    user_guid: userGuid,
    session_id: sessionId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "session_id" });

  // Normal agent invocation with memory
  const stream = await mailTriageAgent.stream(message, {
    runtimeContext,
    memory: {
      resource: userGuid,    // stable user identifier
      thread: sessionId,     // conversation session ID
    },
  });
  return streamResponse(stream);
}
```

---

## 10. File Structure

```
src/mastra/
├── index.ts                    # Mastra instance (update existing)
├── agents/
│   └── mail-triage.ts          # Agent definition + instructions + memory
├── tools/
│   ├── get-mailbox.ts          # getMailbox tool (LIVE)
│   ├── list-folders.ts         # listFolders tool (LIVE)
│   ├── list-messages.ts        # listMessages tool (LIVE)
│   ├── search-messages.ts      # searchMessages tool (LIVE)
│   ├── get-message-body.ts     # getMessageBody tool (LIVE)
│   ├── mark-as-read.ts         # markAsRead tool (MOCKED + requireApproval)
│   ├── star-messages.ts        # starMessages tool (MOCKED + requireApproval)
│   ├── delete-messages.ts      # deleteMessages tool (MOCKED + requireApproval)
│   └── move-messages.ts        # moveMessages tool (MOCKED + requireApproval)
├── helpers/
│   └── yahoo-api.ts            # Server-side Yahoo Mail API client
└── types.ts                    # SlimMessage, SlimFolder + mapper functions

app/api/agent/
└── route.ts                    # Next.js API route for agent invocation
```

---

## 11. Data Flow: Example Triage Session

```
User: "Triage my inbox, delete spam, and star anything important"
Client sends: { message, userGuid: "ABC123", sessionId: "sess_001", token }

Agent (gemini-2.0-flash):
  1. calls getMailbox()              → { mailboxId: "1", email: "user@yahoo.com" }
  2. calls listFolders(mailboxId)    → [{ id: "1", name: "Inbox", type: "INBOX", unreadCount: 47 }, ...]
  3. calls listMessages(mailboxId, inboxFolderId, count: 30)
     → returns 30 SlimMessages (id, subject, from, snippet, date, isRead, etc.)

  4. Agent analyzes snippets + subjects + senders, categorizes:
     - Important: 5 messages
     - Newsletter: 10 messages
     - Promotional: 8 messages
     - Spam: 7 messages

  5. calls starMessages(mailboxId, [5 important IDs], true)
     ← STREAM PAUSES — requireApproval: true
     ← Client shows: "Agent wants to star 5 messages: [subjects]. Approve?"
     ← User clicks "Approve"
     ← Client calls POST /api/agent { action: "approve", runId }
     ← MOCKED: logs action, returns { success: true, count: 5 }

  6. calls markAsRead(mailboxId, [10 newsletter IDs], true)
     ← STREAM PAUSES — requireApproval: true
     ← Client shows: "Agent wants to mark 10 messages as read: [subjects]. Approve?"
     ← User clicks "Approve"
     ← Client calls POST /api/agent { action: "approve", runId }
     ← MOCKED: logs action, returns { success: true, count: 10 }

  7. calls deleteMessages(mailboxId, [7 spam IDs])
     ← STREAM PAUSES — requireApproval: true
     ← Client shows: "Agent wants to delete 7 messages: [subjects]. Approve?"
     ← User clicks "Approve"
     ← Client calls POST /api/agent { action: "approve", runId }
     ← MOCKED: logs action, returns { success: true, deletedCount: 7 }

  8. Agent responds: "Done! Starred 5 important messages, marked 10 newsletters
     as read, deleted 7 spam messages."

  NOTE: Every write operation (steps 5–7) pauses for human review.
  The user can approve or decline each action independently.

  All messages stored in Supabase → mastra_messages table
  Thread tracked in → agent_sessions table (user_guid: "ABC123", session_id: "sess_001")

  Next call with same userGuid + sessionId → agent has full conversation history
```

---

## 12. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Model | `google/gemini-2.0-flash` | Fast, cheap, 1M context, good for triage tasks |
| Token passing | `runtimeContext` | Token never enters LLM context; tools access it directly |
| Memory storage | `@mastra/pg` → Supabase Postgres | Reuses existing Supabase infra; persists across sessions |
| Memory keying | `resource: userGuid`, `thread: sessionId` | Natural mapping — user owns threads, sessions isolate conversations |
| Session tracking | `agent_sessions` table | Queryable outside Mastra; allows listing sessions per user |
| Write APIs | **Mocked** (log + return OK) | Safe for development; swap in real calls later |
| Read APIs | **Live** (Yahoo Mail API) | Agent needs real data to triage meaningfully |
| Context minimization | `SlimMessage` / `SlimFolder` | Full Message has ~20 fields; agent only needs ~10 for triage |
| HITL mechanism | `requireApproval: true` on **all** write tools | Every write/update/delete pauses for human review — no silent mutations |
| Pagination | Default 30 messages per fetch | Keeps context small; agent can fetch more if needed |

---

## 13. New Dependencies

```bash
npm install @mastra/pg @mastra/memory
```

(`@ai-sdk/google` and `@mastra/core` already installed)

---

## 14. New Environment Variables

```env
# Direct Postgres connection to Supabase (from Dashboard → Settings → Database)
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## 15. SQL Migration

Run once against Supabase to create the session tracking table:

```sql
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_guid TEXT NOT NULL,
  session_id TEXT NOT NULL UNIQUE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_guid ON agent_sessions(user_guid);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_lookup ON agent_sessions(user_guid, session_id);
```

Mastra's own tables (`mastra_threads`, `mastra_messages`, etc.) are auto-created on first interaction.

---

## 16. Implementation Order

1. **Install deps** — `npm install @mastra/pg @mastra/memory`
2. **Add env var** — `SUPABASE_DB_URL` in `.env`
3. **Run SQL migration** — Create `agent_sessions` table in Supabase
4. **`helpers/yahoo-api.ts`** — Server-side HTTP helper (foundation for all tools)
5. **`types.ts`** — SlimMessage, SlimFolder types + mapper functions
6. **Read tools** — getMailbox, listFolders, listMessages, searchMessages, getMessageBody (LIVE)
7. **Write/update/delete tools** — markAsRead, starMessages, moveMessages, deleteMessages (ALL MOCKED + `requireApproval`)
9. **Agent definition** — mail-triage.ts with Gemini Flash + Supabase memory
10. **Mastra index** — Register agent + storage in `src/mastra/index.ts`
11. **API route** — `app/api/agent/route.ts` with memory context + HITL handling
12. **Test via `mastra dev`** — Use Mastra's built-in playground to test the agent

---

## 17. Out of Scope (for now)

- Client-side chat UI component
- Real write API calls (currently mocked)
- Reply/forward/compose flows
- Attachment handling
- Multi-account support (agent works with the primary mailbox)
- Rate limiting / token refresh
- Observational memory / semantic recall (can add later)
