# OAuth → IMAP Migration

Replacing Google OAuth with Gmail IMAP (imapflow) + App Passwords.

## Credential Flow

```
Frontend stores:  { email, appPassword }  in localStorage
Frontend sends:   Authorization: Bearer <base64(email:appPassword)>
API routes:       getImapCredentials(authHeader) → { email, password }
IMAP:             ImapFlow({ auth: { user: email, pass: password } })
```

No token refresh, no OAuth bridge, no expiry.

---

## Status

### ✅ Done

| File | Change |
|------|--------|
| `lib/imap/client.ts` *(new)* | Core IMAP helper: credentials, connection, folder maps, message ID encoding, RFC822 parser, Gmail-format builders |
| `app/api/gmail/messages/route.ts` | IMAP via imapflow |
| `app/api/gmail/messages/[id]/route.ts` | IMAP via imapflow |
| `app/api/gmail/threads/route.ts` | IMAP via imapflow |
| `app/api/gmail/threads/[id]/route.ts` | IMAP via imapflow |
| `app/api/gmail/labels/route.ts` | IMAP folder list |
| `app/api/gmail/profile/route.ts` | Email from credentials + INBOX status |
| `app/api/gmail/summary/route.ts` | Removed googleapis; passes `email`+`appPassword` to workflow |
| `app/api/gmail/user-profile/route.ts` | Removed googleapis; passes `email`+`appPassword` to workflow |
| `app/api/gmail/intelligent-search/route.ts` | Uses `getImapCredentials` |
| `lib/services/intelligent-search-service.ts` | Replaced Google API calls with imapflow |
| `src/mastra/workflows/generate-summary.ts` | Replaced googleapis with imapflow; `accessToken` → `email`+`appPassword` |
| `src/mastra/workflows/build-user-profile.ts` | Replaced googleapis with imapflow; 4 steps refactored; dedup by Message-ID |
| `lib/auth-context.tsx` | Stores `{ email, appPassword }`; `getValidAccessToken()` returns `btoa(email:pass)` |
| `app/login/page.tsx` | Email + app password form; removed Google OAuth popup |
| `lib/services/gmail-client.ts` | Removed 401 retry / token refresh logic |
| `lib/supabase.ts` | `oauth_token` → `app_password` |
| `app/api/test-accounts/route.ts` | Selects `app_password` from Supabase |

---

## IMAP Folder Mapping

| Gmail Label | IMAP Folder |
|-------------|-------------|
| `INBOX` | `INBOX` |
| `SENT` | `[Gmail]/Sent Mail` |
| `DRAFT` | `[Gmail]/Drafts` |
| `TRASH` | `[Gmail]/Trash` |
| `SPAM` | `[Gmail]/Spam` |
| `STARRED` | `[Gmail]/Starred` |
| `IMPORTANT` | `[Gmail]/Important` |
| `ALL` | `[Gmail]/All Mail` |

## Message ID Format

IMAP UIDs are per-mailbox. The app encodes them as:

```
base64url(folderPath + '\x00' + uid)
```

Example: `INBOX` message UID `1234` → `INBOX\x001234` → base64url encoded string.

## Gmail App Password Setup

1. Google Account → Security → 2-Step Verification → App passwords
2. Select app: Mail, device: Other → Generate
3. Use the 16-character password in the login form
