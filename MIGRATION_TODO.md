# Gmail Migration TODO

This document tracks the remaining work to complete the migration from Yahoo Mail to Gmail API.

## ✅ Completed

- [x] Created environment variables (.env.local)
- [x] Updated login page with "Sign in with Google" button
- [x] Updated auth context to handle Gmail OAuth tokens (access_token, refresh_token, expires_at)
- [x] Added token refresh logic in auth context
- [x] Updated API client base URL to Gmail API
- [x] Added OAuth popup flow with postMessage handling
- [x] Added fallback for same-window OAuth flow

## 🚧 In Progress / TODO

### 1. API Service Layer - High Priority

The following services need to be updated to use Gmail API endpoints instead of Yahoo Mail API:

#### **Message Service** (`lib/services/message-service.ts`)
- [ ] Update `getMessages()` to use Gmail API `GET /users/me/messages`
- [ ] Update `getConversations()` to use Gmail API thread endpoints `GET /users/me/threads`
- [ ] Update `getMessagesBySearch()` to use Gmail search: `GET /users/me/messages?q={query}`
- [ ] Update `getMessagesByConversation()` to use Gmail thread messages
- [ ] Update `markAsRead()` to use Gmail modify: `POST /users/me/messages/{id}/modify`
- [ ] Update `toggleStar()` to use Gmail labels (STARRED)
- [ ] Update `moveMessages()` to use Gmail labels instead of folder moves
- [ ] Update `saveMessage()` to use Gmail send/draft endpoints
- [ ] Update `deleteMessage()` to use Gmail trash: `POST /users/me/messages/{id}/trash`
- [ ] Update `getFullMessageBody()` to use Gmail message format endpoint

**Gmail API Endpoints Reference:**
```
List messages: GET /users/me/messages?maxResults=30&labelIds=INBOX
Get message: GET /users/me/messages/{id}?format=full
List threads: GET /users/me/threads?maxResults=30&labelIds=INBOX
Get thread: GET /users/me/threads/{id}
Modify message: POST /users/me/messages/{id}/modify
  Body: { "addLabelIds": ["STARRED"], "removeLabelIds": ["UNREAD"] }
Trash message: POST /users/me/messages/{id}/trash
Send message: POST /users/me/messages/send
  Body: { "raw": "<base64url-encoded-email>" }
Search: GET /users/me/messages?q=subject:hello
```

#### **Folder Service** (`lib/services/folder-service.ts`)
- [ ] Update to use Gmail Labels API: `GET /users/me/labels`
- [ ] Map Gmail system labels to folder types:
  - `INBOX` → Inbox
  - `SENT` → Sent
  - `DRAFT` → Draft
  - `TRASH` → Trash
  - `SPAM` → Spam
  - `STARRED` → Starred
  - Custom labels → Custom folders
- [ ] Update folder icons to match Gmail labels

#### **Mailbox Service** (`lib/services/mailbox-service.ts`)
- [ ] Update to use Gmail profile: `GET /users/me/profile`
- [ ] Since Gmail only has one mailbox per account, simplify this service
- [ ] Return consistent mailbox structure

#### **Account Service** (`lib/services/account-service.ts`)
- [ ] Update to use Gmail profile API
- [ ] Return single account (current user)

### 2. Type Definitions - High Priority

Update type definitions in `lib/types/api.ts`:

- [ ] Add Gmail message format types:
```typescript
interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailMessagePart;
  internalDate: string;
  historyId: string;
}

interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: GmailMessagePartBody;
  parts?: GmailMessagePart[];
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePartBody {
  attachmentId?: string;
  size: number;
  data?: string; // base64url encoded
}

interface GmailThread {
  id: string;
  snippet: string;
  historyId: string;
  messages: GmailMessage[];
}

interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility: 'show' | 'hide';
  labelListVisibility: 'labelShow' | 'labelHide';
  type: 'system' | 'user';
}

interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}
```

- [ ] Create adapter functions to convert Gmail types to existing app types
- [ ] Update existing Message, Conversation, Folder types to work with Gmail data

### 3. UI Components - Medium Priority

Some components may need adjustments:

- [ ] **Message List** - Verify threading display works with Gmail threads
- [ ] **Message Detail** - Update to handle Gmail message part structure (HTML/plain text)
- [ ] **Compose** - Update to create RFC822 format and base64url encode for Gmail
- [ ] **Folder List** - Update to display Gmail labels with proper icons
- [ ] **Search** - Verify Gmail search syntax works correctly

### 4. Data Transformation Layer - High Priority

Create adapter/transformer functions to map between Gmail API and app's internal data structure:

- [ ] Create `lib/adapters/gmail-adapter.ts`:
  - `gmailMessageToMessage()` - Convert Gmail message to app Message type
  - `gmailThreadToConversation()` - Convert Gmail thread to Conversation type
  - `gmailLabelToFolder()` - Convert Gmail label to Folder type
  - `gmailProfileToMailbox()` - Convert Gmail profile to Mailbox type
  - `messageToGmailFormat()` - Convert app message to Gmail RFC822 format

### 5. Proxy/API Routes - Optional

Currently not needed since we're calling Gmail API directly from client:

- ~~[ ] Remove or update `/api/proxy` route~~ (Can be removed)
- [ ] Optionally create server-side Gmail API proxy if you need server-side rendering

### 6. Testing - High Priority

- [ ] Test OAuth flow (popup and same-window modes)
- [ ] Test token refresh when token expires
- [ ] Test message list loading
- [ ] Test message threading/conversations
- [ ] Test marking messages as read/unread
- [ ] Test starring messages
- [ ] Test moving messages between folders (labels)
- [ ] Test search functionality
- [ ] Test compose and send
- [ ] Test error handling (network errors, 401, rate limits)

### 7. Error Handling - Medium Priority

- [ ] Add proper error handling for Gmail API errors
- [ ] Handle Gmail API rate limits (quota errors)
- [ ] Add retry logic for transient failures
- [ ] Display user-friendly error messages

### 8. Calendar Integration - Low Priority (if needed)

If you want to integrate Google Calendar:

- [ ] Add Calendar API client
- [ ] Create calendar service
- [ ] Add calendar UI components
- [ ] Map calendar events to UI

### 9. Cleanup - Low Priority

- [ ] Remove Yahoo OAuth token test accounts API (`/api/test-accounts`)
- [ ] Remove Yahoo-specific code
- [ ] Update documentation
- [ ] Update README with Gmail setup instructions

---

## Quick Start Implementation Order

Recommended order to get a working app quickly:

1. **First: Mailbox & Account Services** - Get basic user profile working
2. **Second: Folder Service** - Get label list working so you can see folders
3. **Third: Message Service (List only)** - Get message list displaying
4. **Fourth: Message Service (Detail)** - Get individual messages loading
5. **Fifth: Message Service (Actions)** - Get read/star/delete working
6. **Sixth: Compose** - Get sending working
7. **Last: Polish & Testing** - Fix bugs, improve UX

---

## Gmail API Key Differences from Yahoo

### Message Structure
- Yahoo uses flat folder structure, Gmail uses labels (messages can have multiple labels)
- Yahoo uses folder moves, Gmail adds/removes labels
- Yahoo uses simple message IDs, Gmail has message IDs and thread IDs

### Threading
- Yahoo groups by `conversationId`, Gmail has built-in thread support
- Gmail threads are immutable message collections

### Filtering
- Yahoo uses custom query syntax, Gmail has its own search syntax
- Gmail search is very powerful: `from:user@example.com subject:hello`

### Attachments
- Yahoo includes attachment data in message, Gmail requires separate attachment fetch
- Gmail attachments use `attachmentId` and need separate API call

### Rate Limits
- Gmail API has quota limits (different from Yahoo)
- Default quota: 250 quota units per user per second
- List messages: 5 units, Get message: 5 units, Modify: 5 units

---

## Useful Gmail API Documentation

- [Gmail API Reference](https://developers.google.com/gmail/api/reference/rest)
- [Gmail API Messages](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)
- [Gmail API Threads](https://developers.google.com/gmail/api/reference/rest/v1/users.threads)
- [Gmail API Labels](https://developers.google.com/gmail/api/reference/rest/v1/users.labels)
- [Gmail API Search](https://developers.google.com/gmail/api/guides/filtering)
- [Gmail API Send](https://developers.google.com/gmail/api/guides/sending)

---

## Example Gmail API Calls

### List Messages
```bash
GET https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX
Authorization: Bearer {access_token}
```

### Get Message
```bash
GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}?format=full
Authorization: Bearer {access_token}
```

### Modify Message (Mark as Read)
```bash
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/{messageId}/modify
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "removeLabelIds": ["UNREAD"]
}
```

### Search Messages
```bash
GET https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:example@gmail.com
Authorization: Bearer {access_token}
```

---

*Last Updated: 2026-02-10*
