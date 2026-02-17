# Mail Agent API

**Endpoint:** `POST /api/agent`

The agent uses **Server-Sent Events (SSE)** for streaming responses and supports a **Human-in-the-Loop (HITL)** approval flow for write operations.

---

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <yahoo_oauth_token>` |
| `Content-Type` | Yes | `application/json` |

### Body

#### 1. Start / continue a conversation

```json
{
  "message":   "Show me my unread inbox messages",
  "userGuid":  "abc123",
  "accountId": "def456",
  "sessionId": "session-xyz"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The user's natural-language message to the agent |
| `userGuid` | string | Yes | Stable user identifier — used to scope memory across sessions |
| `sessionId` | string | Yes | Conversation session ID — use a new value to start a fresh conversation |
| `accountId` | string | No | Yahoo account ID. When provided, folder lookups are automatically scoped to this account (i.e. the agent will find the correct INBOX for this account) |

#### 2. Approve a pending tool call (HITL)

```json
{
  "action": "approve",
  "runId":  "run_abc123"
}
```

#### 3. Decline a pending tool call (HITL)

```json
{
  "action": "decline",
  "runId":  "run_abc123"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `action` | `"approve"` \| `"decline"` | The HITL action |
| `runId` | string | The `runId` received in the `tool-call-pending` event |

---

## Response

The endpoint returns a **Server-Sent Events stream** (`Content-Type: text/event-stream`). Each event is a JSON-encoded chunk on a `data:` line.

```
data: <json>\n\n
```

### Event shapes

#### Text delta (stream the agent's reply word-by-word)

```json
{
  "type": "text-delta",
  "textDelta": "Here are your unread messages..."
}
```

#### Tool call pending (HITL — agent wants to perform a write action)

This event is emitted before any write tool executes (`mark-as-read`, `star-messages`, `move-messages`, `delete-messages`). The UI should pause and ask the user for approval.

```json
{
  "type": "tool-call-pending",
  "runId": "run_abc123",
  "toolName": "mark-as-read",
  "input": {
    "mailboxId": "...",
    "messageIds": ["msg1", "msg2"],
    "read": true
  }
}
```

| Field | Description |
|-------|-------------|
| `runId` | Pass this back as `runId` when approving or declining |
| `toolName` | Which tool is about to run |
| `input` | The exact arguments the tool will be called with |

#### Tool result (after a tool completes)

```json
{
  "type": "tool-result",
  "toolName": "list-messages",
  "result": [...]
}
```

#### Finish

```json
{
  "type": "finish",
  "finishReason": "stop"
}
```

#### Error

```json
{
  "type": "error",
  "error": "Something went wrong"
}
```

---

## HITL Flow

Write operations always pause for user approval. The flow is:

```
FE  →  POST /api/agent  { message, userGuid, accountId, sessionId }
                          ↓  stream starts
Agent → "I'm going to mark 3 messages as read. Approve?"
Agent → event: tool-call-pending  { runId, toolName, input }

UI shows confirmation dialog
                          ↓  user taps "Approve"
FE  →  POST /api/agent  { action: "approve", runId }
                          ↓  stream resumes
Agent → event: tool-result  { toolName, result }
Agent → "Done! Marked 3 messages as read."
Agent → event: finish

                          ↓  user taps "Decline"
FE  →  POST /api/agent  { action: "decline", runId }
                          ← { "declined": true }  (plain JSON, no stream)
```

**Write tools that require approval:**
- `mark-as-read` — mark messages read/unread
- `star-messages` — star or unstar messages
- `move-messages` — move messages to another folder
- `delete-messages` — permanently delete messages

---

## Session & Memory

- `userGuid` scopes long-term memory to a user across all their sessions.
- `sessionId` scopes memory to a single conversation thread.
- To **start a new conversation**, generate a new `sessionId` (e.g. `crypto.randomUUID()`).
- To **resume** an existing conversation, reuse the same `sessionId`.

---

## Example — Minimal Integration

```typescript
async function sendAgentMessage(
  token: string,
  userGuid: string,
  accountId: string,
  sessionId: string,
  message: string,
  onChunk: (chunk: any) => void
) {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, userGuid, accountId, sessionId }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        const chunk = JSON.parse(line.slice(6));
        onChunk(chunk);
      }
    }
  }
}

async function approveToolCall(runId: string) {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'approve', runId }),
  });
  // Consume the resumed stream the same way as above
}

async function declineToolCall(runId: string) {
  await fetch('/api/agent', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'decline', runId }),
  });
}
```

---

## Error Responses

| Status | Body | Cause |
|--------|------|-------|
| `401` | `{ "error": "No auth token provided" }` | Missing `Authorization` header |
| `400` | `{ "error": "Missing required fields: message, userGuid, sessionId" }` | Missing required body fields |
| `500` | `{ "error": "<message>" }` | Unexpected server error |
