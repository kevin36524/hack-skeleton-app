# Gmail API Quick Reference

Quick reference for common Gmail API operations needed for this app.

## Base URL
```
https://gmail.googleapis.com/gmail/v1
```

## Authentication
All requests require Bearer token in Authorization header:
```
Authorization: Bearer {access_token}
```

---

## 📧 Messages API

### List Messages
```http
GET /users/me/messages?labelIds=INBOX&maxResults=20

Response:
{
  "messages": [
    { "id": "18d1e2f3a4b5c6d7", "threadId": "18d1e2f3a4b5c6d7" }
  ],
  "nextPageToken": "...",
  "resultSizeEstimate": 1234
}
```

**Query Parameters:**
- `labelIds` (string) - Only return messages with these labels (comma-separated)
- `maxResults` (number) - Max messages to return (default: 100, max: 500)
- `pageToken` (string) - Page token for pagination
- `q` (string) - Search query (Gmail search syntax)
- `includeSpamTrash` (boolean) - Include spam/trash (default: false)

### Get Message
```http
GET /users/me/messages/{id}?format=full

Response:
{
  "id": "18d1e2f3a4b5c6d7",
  "threadId": "18d1e2f3a4b5c6d7",
  "labelIds": ["INBOX", "UNREAD"],
  "snippet": "Message preview text...",
  "internalDate": "1707600000000",
  "payload": {
    "headers": [
      { "name": "From", "value": "sender@example.com" },
      { "name": "Subject", "value": "Hello" }
    ],
    "body": { "data": "..." }
  }
}
```

**Format Options:**
- `minimal` - Only ID and labels
- `full` - Complete message including body (use this)
- `raw` - Raw RFC822 format
- `metadata` - Headers only

### Modify Message (Mark Read, Star, etc.)
```http
POST /users/me/messages/{id}/modify
Content-Type: application/json

Request Body:
{
  "addLabelIds": ["STARRED"],
  "removeLabelIds": ["UNREAD"]
}

Response:
{
  "id": "18d1e2f3a4b5c6d7",
  "threadId": "18d1e2f3a4b5c6d7",
  "labelIds": ["INBOX", "STARRED"]
}
```

**Common Label Operations:**
- Mark as read: `removeLabelIds: ["UNREAD"]`
- Mark as unread: `addLabelIds: ["UNREAD"]`
- Star: `addLabelIds: ["STARRED"]`
- Unstar: `removeLabelIds: ["STARRED"]`
- Archive: `removeLabelIds: ["INBOX"]`
- Move to inbox: `addLabelIds: ["INBOX"]`

### Trash Message
```http
POST /users/me/messages/{id}/trash

Response:
{
  "id": "18d1e2f3a4b5c6d7",
  "threadId": "18d1e2f3a4b5c6d7",
  "labelIds": ["TRASH"]
}
```

### Untrash Message
```http
POST /users/me/messages/{id}/untrash
```

### Delete Message (Permanent)
```http
DELETE /users/me/messages/{id}

Response: 204 No Content
```

### Send Message
```http
POST /users/me/messages/send
Content-Type: application/json

Request Body:
{
  "raw": "base64url-encoded-RFC822-email"
}

Response:
{
  "id": "18d1e2f3a4b5c6d7",
  "threadId": "18d1e2f3a4b5c6d7",
  "labelIds": ["SENT"]
}
```

**RFC822 Email Format:**
```
From: sender@example.com
To: recipient@example.com
Subject: Hello
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<html><body>Hello world!</body></html>
```

Then base64url encode the entire email.

---

## 🧵 Threads API

### List Threads
```http
GET /users/me/threads?labelIds=INBOX&maxResults=20

Response:
{
  "threads": [
    { "id": "18d1e2f3a4b5c6d7", "snippet": "..." }
  ],
  "nextPageToken": "...",
  "resultSizeEstimate": 1234
}
```

### Get Thread (Conversation)
```http
GET /users/me/threads/{id}?format=full

Response:
{
  "id": "18d1e2f3a4b5c6d7",
  "snippet": "Combined snippet...",
  "historyId": "...",
  "messages": [
    { /* Full message object */ },
    { /* Full message object */ }
  ]
}
```

### Modify Thread
```http
POST /users/me/threads/{id}/modify
Content-Type: application/json

Request Body:
{
  "addLabelIds": ["STARRED"],
  "removeLabelIds": ["UNREAD"]
}
```

### Trash Thread
```http
POST /users/me/threads/{id}/trash
```

### Delete Thread
```http
DELETE /users/me/threads/{id}
```

---

## 🏷️ Labels API

### List Labels
```http
GET /users/me/labels

Response:
{
  "labels": [
    {
      "id": "INBOX",
      "name": "INBOX",
      "type": "system",
      "messageListVisibility": "show",
      "messagesTotal": 123,
      "messagesUnread": 12
    },
    {
      "id": "Label_1",
      "name": "Work",
      "type": "user",
      "color": {
        "textColor": "#000000",
        "backgroundColor": "#42d692"
      }
    }
  ]
}
```

**System Labels:**
- `INBOX`, `SENT`, `DRAFT`, `TRASH`, `SPAM`
- `STARRED`, `IMPORTANT`, `UNREAD`
- `CATEGORY_PERSONAL`, `CATEGORY_SOCIAL`, `CATEGORY_PROMOTIONS`
- `CATEGORY_UPDATES`, `CATEGORY_FORUMS`

### Get Label
```http
GET /users/me/labels/{id}
```

### Create Label
```http
POST /users/me/labels
Content-Type: application/json

Request Body:
{
  "name": "MyLabel",
  "labelListVisibility": "labelShow",
  "messageListVisibility": "show"
}
```

---

## 👤 Profile API

### Get Profile
```http
GET /users/me/profile

Response:
{
  "emailAddress": "user@gmail.com",
  "messagesTotal": 12345,
  "threadsTotal": 5678,
  "historyId": "123456"
}
```

---

## 🔍 Search Syntax

Use the `q` parameter with Gmail search operators:

```http
GET /users/me/messages?q=from:example@gmail.com subject:hello
```

**Common Search Operators:**
- `from:email@example.com` - From sender
- `to:email@example.com` - To recipient
- `subject:keyword` - Subject contains
- `has:attachment` - Has attachments
- `is:unread` - Unread messages
- `is:read` - Read messages
- `is:starred` - Starred messages
- `label:labelname` - Has label
- `after:2024/01/01` - After date
- `before:2024/12/31` - Before date
- `newer_than:1d` - Newer than 1 day (d=day, m=month, y=year)
- `older_than:7d` - Older than 7 days
- `in:inbox` - In inbox
- `in:sent` - In sent
- `in:trash` - In trash
- `in:draft` - In drafts

**Combine with AND:**
```
from:example@gmail.com has:attachment
```

**Combine with OR:**
```
from:user1@gmail.com OR from:user2@gmail.com
```

**Exclude with minus:**
```
from:example@gmail.com -subject:newsletter
```

---

## 📎 Attachments API

### Get Attachment
```http
GET /users/me/messages/{messageId}/attachments/{attachmentId}

Response:
{
  "size": 12345,
  "data": "base64url-encoded-attachment-data"
}
```

---

## 📊 Batch API

### Batch Multiple Requests
```http
POST /batch/gmail/v1
Content-Type: multipart/mixed; boundary=batch_boundary

--batch_boundary
Content-Type: application/http

GET /gmail/v1/users/me/messages/msg1
--batch_boundary
Content-Type: application/http

GET /gmail/v1/users/me/messages/msg2
--batch_boundary--
```

**Note:** Batch API is complex. For most cases, use Promise.all() with individual requests.

---

## 📝 Drafts API

### List Drafts
```http
GET /users/me/drafts?maxResults=20
```

### Get Draft
```http
GET /users/me/drafts/{id}
```

### Create Draft
```http
POST /users/me/drafts
Content-Type: application/json

Request Body:
{
  "message": {
    "raw": "base64url-encoded-RFC822-email"
  }
}
```

### Update Draft
```http
PUT /users/me/drafts/{id}
Content-Type: application/json

Request Body:
{
  "message": {
    "raw": "base64url-encoded-RFC822-email"
  }
}
```

### Send Draft
```http
POST /users/me/drafts/send
Content-Type: application/json

Request Body:
{
  "id": "draft_id"
}
```

### Delete Draft
```http
DELETE /users/me/drafts/{id}
```

---

## ⚙️ Settings API (Optional)

### Get Auto-Forwarding Settings
```http
GET /users/me/settings/autoForwarding
```

### Get IMAP Settings
```http
GET /users/me/settings/imap
```

### Get Vacation Responder
```http
GET /users/me/settings/vacation
```

---

## 🚨 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Refresh access token |
| 403 | Forbidden | Check OAuth scopes |
| 404 | Not Found | Message/label doesn't exist |
| 429 | Rate Limit | Use exponential backoff |
| 500 | Server Error | Retry with backoff |

---

## 💡 Tips & Best Practices

### Performance
1. **Use `format=metadata`** when you only need headers
2. **Batch message fetches** with Promise.all()
3. **Use pagination** with pageToken for large result sets
4. **Cache labels** - they don't change often

### Rate Limits
- Default quota: 250 units per user per second
- List messages: 5 units
- Get message: 5 units
- Modify message: 5 units
- Send message: 100 units

### Threading
- Use threads API instead of messages API for conversations
- One thread can contain multiple messages
- Thread ID = First message ID in the thread

### Labels vs Folders
- Gmail doesn't have folders - only labels
- Messages can have multiple labels
- System labels are read-only
- Use label add/remove instead of "move"

---

## 🔗 Full Documentation

- [Gmail API Reference](https://developers.google.com/gmail/api/reference/rest)
- [Gmail API Guides](https://developers.google.com/gmail/api/guides)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

*Last Updated: 2026-02-10*
