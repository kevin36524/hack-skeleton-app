---
name: add-downstream-api
description: Add new downstream API implementations by reusing existing service functions or creating new ones
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

# Skill: Add Downstream API

## Overview

This skill helps you implement new downstream API endpoints by following a systematic approach:
1. First check if existing functions in `lib/services` can satisfy the requirement
2. Reuse and wrap existing functions when possible
3. Create new functions in appropriate services when needed
4. Create entirely new services for unrelated API domains

## When to Use

Use this skill when:
- Adding new third-party API integrations
- Implementing new endpoints from existing API providers (e.g., Yahoo Mail, Google Calendar)
- Creating wrapper functions around existing API calls
- Building new service modules for different API domains

**Prerequisites:**
- API documentation or endpoint URL for the new API
- Understanding of the API's purpose and domain (mail, calendar, contacts, etc.)
- Authentication requirements (if any)

## How It Works

### Step 1: Analyze the API Request

When a user requests a new API implementation, extract:
- **API URL/Endpoint**: The full URL or endpoint path
- **API Domain**: What the API does (mail, calendar, contacts, etc.)
- **Parameters**: Query params, headers, body requirements
- **HTTP Method**: GET, POST, PUT, DELETE, etc.

Example API request from user:
```
https://apis.mail.yahoo.com/ws/v3/mailboxes/@.id==<mailbox_id>/messages/@.select==q?q=folderId:<inboxFolderId>+-sort:date+date:[<currentTime-24hours> TO *]+count:200&appid=<appId>
```

Extract:
- Domain: Mail/Messages
- Purpose: Search messages by folder and date
- Method: GET
- Query: Complex search query with filters

### Step 2: Search Existing Services

Check if `lib/services` directory exists and explore its contents:

```bash
# Check if services directory exists
ls -la lib/services/

# List all service files
find lib/services -name "*.ts" -type f

# Search for related functions
grep -r "function\|export" lib/services/
```

Look for service files that match the API domain:
- `mailService.ts` or `messageService.ts` for mail APIs
- `calendarService.ts` for calendar APIs
- `contactService.ts` for contact APIs
- etc.

### Step 3: Check for Reusable Functions

Read the relevant service file(s) and look for functions that:
- Make similar API calls
- Accept flexible parameters (especially query strings)
- Can be wrapped or extended

**Example**: If you find `getMessagesBySearch(query: string)`:
```typescript
export async function getMessagesBySearch(
  mailboxId: string,
  query: string,
  appId: string
): Promise<Message[]> {
  const url = `https://apis.mail.yahoo.com/ws/v3/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&appid=${appId}`;
  // ... implementation
}
```

This can be reused! The new API just needs a specific query format.

### Step 4: Decision Tree

Follow this decision tree:

```
Can existing function handle it with different parameters?
├─ YES → Create a wrapper function (Step 5a)
└─ NO → Is there a related service file?
    ├─ YES → Add new function to existing service (Step 5b)
    └─ NO → Create new service file (Step 5c)
```

### Step 5a: Create Wrapper Function

If an existing function can be reused, create a wrapper with a descriptive name:

```typescript
// In lib/services/mailService.ts

// Existing function
export async function getMessagesBySearch(
  mailboxId: string,
  query: string,
  appId: string
): Promise<Message[]> {
  // ... implementation
}

// New wrapper function (add this)
export async function getRecentMessages24h(
  mailboxId: string,
  inboxFolderId: string,
  appId: string
): Promise<Message[]> {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const time24hAgo = currentTimeSeconds - 24 * 60 * 60;

  const query = `folderId:${inboxFolderId} -sort:date date:[${time24hAgo} TO *] count:200`;

  return getMessagesBySearch(mailboxId, query, appId);
}
```

**Key Points:**
- Use descriptive function names that explain what the API does
- Build the query/parameters in the wrapper
- Call the existing function with formatted parameters
- Add JSDoc comments explaining the purpose

### Step 5b: Add Function to Existing Service

If no existing function works but a related service exists, add a new function:

```typescript
// In lib/services/mailService.ts (existing file)

// ... existing functions ...

/**
 * Gets messages from a specific folder within a date range
 * @param mailboxId - The mailbox identifier
 * @param folderId - The folder to search in
 * @param fromDate - Start date (seconds since epoch)
 * @param toDate - End date (seconds since epoch), use "*" for now
 * @param count - Maximum number of messages to return
 * @param appId - Yahoo app identifier
 */
export async function getMessagesByFolderAndDate(
  mailboxId: string,
  folderId: string,
  fromDate: number,
  toDate: string | number,
  count: number,
  appId: string
): Promise<Message[]> {
  const query = `folderId:${folderId} -sort:date date:[${fromDate} TO ${toDate}] count:${count}`;
  const url = `https://apis.mail.yahoo.com/ws/v3/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}&appid=${appId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.YAHOO_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`);
  }

  return response.json();
}
```

**Key Points:**
- Keep function signatures consistent with existing patterns in the file
- Add proper TypeScript types
- Include JSDoc comments
- Handle errors appropriately
- Use environment variables for sensitive data

### Step 5c: Create New Service File

If the API is unrelated to existing services, create a new service file:

```typescript
// Create lib/services/calendarService.ts (new file)

/**
 * Calendar Service
 *
 * Handles all calendar-related API operations for Yahoo Calendar or other providers
 */

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}

/**
 * Fetches calendar events within a date range
 * @param calendarId - The calendar identifier
 * @param startDate - Start date (ISO 8601 format)
 * @param endDate - End date (ISO 8601 format)
 * @param appId - Yahoo app identifier
 */
export async function getCalendarEvents(
  calendarId: string,
  startDate: string,
  endDate: string,
  appId: string
): Promise<CalendarEvent[]> {
  const url = `https://apis.calendar.yahoo.com/v1/calendars/${calendarId}/events?start=${startDate}&end=${endDate}&appid=${appId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.YAHOO_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Creates a new calendar event
 * @param calendarId - The calendar identifier
 * @param event - Event details
 * @param appId - Yahoo app identifier
 */
export async function createCalendarEvent(
  calendarId: string,
  event: Omit<CalendarEvent, 'id'>,
  appId: string
): Promise<CalendarEvent> {
  const url = `https://apis.calendar.yahoo.com/v1/calendars/${calendarId}/events?appid=${appId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.YAHOO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Failed to create calendar event: ${response.statusText}`);
  }

  return response.json();
}
```

**Key Points:**
- Create the file in `lib/services/` directory
- Use descriptive service name (e.g., `calendarService.ts`, `contactService.ts`)
- Define TypeScript interfaces for request/response types
- Group related functions in the same file
- Add comprehensive JSDoc comments
- Follow existing authentication patterns

### Step 6: Ensure Directory Structure

Make sure the `lib/services` directory exists:

```bash
# Create directory if it doesn't exist
mkdir -p lib/services

# Verify the file was created
ls -la lib/services/
```

### Step 7: Validate and Test

After creating or modifying service files:

1. **Type Check:**
```bash
npx tsc --noEmit
```

2. **Create Test Usage Example:**
```typescript
// In a test file or API route
import { getRecentMessages24h } from '@/lib/services/mailService';

// Example usage
const messages = await getRecentMessages24h(
  'user-mailbox-id',
  'inbox-folder-id',
  'your-app-id'
);
```

3. **Verify Imports:**
```typescript
// Test that the function can be imported
import * as mailService from '@/lib/services/mailService';
console.log(Object.keys(mailService)); // Should include your new function
```

## Code Templates

### Template 1: Wrapper Function Pattern

Use when an existing function can handle the request:

```typescript
// In existing service file (e.g., lib/services/mailService.ts)

/**
 * [Descriptive name of what this specific API does]
 * @param [parameters needed by the caller]
 * @returns [what the function returns]
 */
export async function [specificFunctionName](
  [parameters]
): Promise<ReturnType> {
  // Build the specific query/parameters for this use case
  const specificQuery = `[build query from parameters]`;

  // Call the existing general-purpose function
  return existingGeneralFunction([parameters], specificQuery);
}
```

### Template 2: New Function in Existing Service

Use when adding a new capability to an existing service:

```typescript
// In existing service file

/**
 * [Clear description of what this function does]
 * @param [parameter descriptions]
 */
export async function [functionName](
  [parameters]
): Promise<ReturnType> {
  // Build the API URL
  const url = `[API endpoint with parameters]`;

  // Make the API call
  const response = await fetch(url, {
    method: '[HTTP_METHOD]',
    headers: {
      'Authorization': `Bearer ${process.env.AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    // body: JSON.stringify(data), // if POST/PUT
  });

  // Handle errors
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  // Return parsed response
  return response.json();
}
```

### Template 3: New Service File

Use when creating a completely new service:

```typescript
// Create new file: lib/services/[domain]Service.ts

/**
 * [Domain] Service
 *
 * [Description of what this service handles]
 */

// Type definitions
export interface [MainType] {
  id: string;
  // ... other properties
}

// Configuration (if needed)
const BASE_URL = 'https://api.[provider].com';

/**
 * [First function description]
 */
export async function [functionName](
  [parameters]
): Promise<ReturnType> {
  // Implementation
}

/**
 * [Second function description]
 */
export async function [anotherFunction](
  [parameters]
): Promise<ReturnType> {
  // Implementation
}
```

## Common Patterns

### Pattern 1: Query Builder Functions

For APIs with complex query syntax:

```typescript
/**
 * Builds a search query for Yahoo Mail API
 */
function buildMessageQuery(options: {
  folderId?: string;
  fromDate?: number;
  toDate?: string | number;
  sortBy?: string;
  count?: number;
}): string {
  const parts: string[] = [];

  if (options.folderId) {
    parts.push(`folderId:${options.folderId}`);
  }

  if (options.fromDate || options.toDate) {
    const from = options.fromDate || 0;
    const to = options.toDate || '*';
    parts.push(`date:[${from} TO ${to}]`);
  }

  if (options.sortBy) {
    parts.push(`-sort:${options.sortBy}`);
  }

  if (options.count) {
    parts.push(`count:${options.count}`);
  }

  return parts.join(' ');
}

// Then use it:
export async function searchMessages(options: SearchOptions) {
  const query = buildMessageQuery(options);
  return getMessagesBySearch(mailboxId, query, appId);
}
```

### Pattern 2: Error Handling Wrapper

Wrap API calls with consistent error handling:

```typescript
async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Use it in service functions:
export async function getMessages() {
  return apiCall<Message[]>('https://api.example.com/messages');
}
```

### Pattern 3: Parameter Transformation

When the API requires specific parameter formats:

```typescript
/**
 * Gets messages from the last N hours
 */
export async function getMessagesFromLastHours(
  mailboxId: string,
  folderId: string,
  hours: number,
  appId: string
): Promise<Message[]> {
  // Transform hours to seconds since epoch
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const hoursAgoSeconds = currentTimeSeconds - (hours * 60 * 60);

  // Use the existing function with transformed parameters
  return getMessagesByFolderAndDate(
    mailboxId,
    folderId,
    hoursAgoSeconds,
    '*',
    200,
    appId
  );
}
```

## Decision Examples

### Example 1: Reuse Existing Function

**User Request:**
"Add API to get emails from the last 24 hours from inbox"

**API:**
```
GET https://apis.mail.yahoo.com/ws/v3/mailboxes/@.id==<mailbox_id>/messages/@.select==q?q=folderId:<inboxFolderId>+-sort:date+date:[<currentTime-24h> TO *]+count:200&appid=<appId>
```

**Decision Process:**
1. Check `lib/services/mailService.ts`
2. Find `getMessagesBySearch(mailboxId, query, appId)`
3. ✅ Can reuse! Just need to build the query string
4. Create wrapper: `getRecentMessages24h()`

### Example 2: Add to Existing Service

**User Request:**
"Add API to mark a message as read"

**API:**
```
PUT https://apis.mail.yahoo.com/ws/v3/mailboxes/<mailbox_id>/messages/<message_id>
Body: { "flags": { "seen": true } }
```

**Decision Process:**
1. Check `lib/services/mailService.ts`
2. No existing function handles PUT requests to mark messages
3. ✅ Related to mail service, so add new function
4. Create: `markMessageAsRead(mailboxId, messageId, appId)`

### Example 3: Create New Service

**User Request:**
"Add API to fetch user's calendar events for this week"

**API:**
```
GET https://apis.calendar.yahoo.com/v1/calendars/<calendar_id>/events?start=<start_date>&end=<end_date>&appid=<appId>
```

**Decision Process:**
1. Check for calendar-related service
2. No `calendarService.ts` exists
3. Not related to mail/messages
4. ✅ Create new service file
5. Create: `lib/services/calendarService.ts` with `getCalendarEvents()`

## Interaction with User

### Questions to Ask

When implementing a new API, ask the user these questions if unclear:

1. **API Documentation:**
   - "Can you provide the full API documentation or endpoint details?"
   - "What are the required parameters and their formats?"

2. **Authentication:**
   - "How should this API authenticate? (Bearer token, API key, OAuth, etc.)"
   - "What environment variable should store the credentials?"

3. **Error Handling:**
   - "How should errors be handled? (Throw exception, return null, custom error type?)"
   - "Are there specific error codes to handle differently?"

4. **Return Types:**
   - "What TypeScript interface should the response match?"
   - "Should we transform the API response or return it as-is?"

5. **Reusability:**
   - "Are there existing functions that do something similar?"
   - "Would this benefit from a generic query builder?"

### Example Dialog

```
User: "Add the Yahoo Mail API for getting unread messages from last 24h"

Agent: Let me check if we have existing mail service functions...
[Searches lib/services/mailService.ts]

Agent: I found a getMessagesBySearch function that accepts a query parameter.
I can create a wrapper function that builds the specific query for unread messages
from the last 24 hours. This will reuse the existing function.

Would you like me to:
1. Create getUnreadMessages24h() as a wrapper around getMessagesBySearch()
2. Add error handling for invalid mailbox IDs
3. Include TypeScript types for the response

User: Yes, that sounds perfect!
```

## Troubleshooting

### Issue: Can't find lib/services directory

**Solution:** Create it first:
```bash
mkdir -p lib/services
```

The services directory might not exist in new projects.

### Issue: TypeScript errors after adding function

**Solution:**
- Check import paths use `@/lib/services/...` format
- Verify all types are properly defined
- Run `npx tsc --noEmit` to see specific errors
- Ensure function signatures match TypeScript interfaces

### Issue: Circular dependency between services

**Solution:**
- Extract shared types to `lib/types/` directory
- Create a `lib/services/common.ts` for shared utilities
- Avoid importing one service from another
- Use dependency injection if services need to interact

### Issue: API authentication not working

**Solution:**
- Verify environment variables are set (`.env.local`)
- Check token format matches API requirements
- Ensure auth headers are correct (`Authorization: Bearer token`)
- Test API endpoint with curl/Postman first

### Issue: Unclear which service to add function to

**Solution:**
- Group by primary domain (mail, calendar, contacts, etc.)
- If function touches multiple domains, put in most relevant service
- Consider creating a new service if it's a major new domain
- Ask the user for clarification

### Issue: Existing function found but has different signature

**Solution:**
- Consider if you can add optional parameters to existing function
- If signatures conflict, create a new function with descriptive name
- Document the difference between the functions in comments
- Avoid breaking changes to existing function signatures

## Validation Checklist

After implementing an API, verify:

- [ ] Directory `lib/services/` exists
- [ ] Service file created/updated in correct location
- [ ] Function has descriptive, clear name
- [ ] TypeScript types defined for parameters and return value
- [ ] JSDoc comments added explaining purpose and parameters
- [ ] Error handling implemented (try/catch or error returns)
- [ ] Authentication configured (env variables, headers)
- [ ] No TypeScript compilation errors (`npx tsc --noEmit`)
- [ ] Can import function in other files
- [ ] Follows existing code style in the project

## Best Practices

### Naming Conventions

**Service Files:**
- Use camelCase with "Service" suffix: `mailService.ts`, `calendarService.ts`
- Keep related functions in the same file
- One service per domain/API provider

**Functions:**
- Use descriptive action verbs: `getMessages`, `createEvent`, `updateContact`
- Include specificity in name: `getRecentMessages24h` vs just `getMessages`
- Follow existing naming patterns in the project

**Types:**
- Use PascalCase for interfaces: `Message`, `CalendarEvent`
- Co-locate types with the service or in `lib/types/`
- Export types for reuse in other files

### Code Organization

```
lib/
├── services/
│   ├── mailService.ts        # Mail-related APIs
│   ├── calendarService.ts    # Calendar APIs
│   ├── contactService.ts     # Contact APIs
│   └── common.ts             # Shared utilities
└── types/
    ├── mail.ts               # Mail-related types
    ├── calendar.ts           # Calendar types
    └── api.ts                # Common API types
```

### Documentation

Add comprehensive JSDoc comments:

```typescript
/**
 * Fetches messages from a specific folder within a date range
 *
 * This function queries the Yahoo Mail API to retrieve messages matching
 * the specified criteria. Results are sorted by date in descending order.
 *
 * @param mailboxId - The unique identifier for the user's mailbox
 * @param folderId - The folder ID to search within (e.g., "Inbox")
 * @param fromDate - Start date as Unix timestamp (seconds since epoch)
 * @param toDate - End date as Unix timestamp or "*" for current time
 * @param count - Maximum number of messages to return (default: 200)
 * @param appId - Yahoo application identifier from developer console
 *
 * @returns Promise resolving to array of Message objects
 *
 * @throws {Error} If the API request fails or returns non-2xx status
 *
 * @example
 * ```typescript
 * const messages = await getMessagesByFolderAndDate(
 *   'abc123',
 *   'inbox',
 *   1640000000,
 *   '*',
 *   50,
 *   'my-app-id'
 * );
 * ```
 */
export async function getMessagesByFolderAndDate(
  mailboxId: string,
  folderId: string,
  fromDate: number,
  toDate: string | number,
  count: number = 200,
  appId: string
): Promise<Message[]> {
  // Implementation
}
```

### Error Handling

Implement consistent error handling:

```typescript
export async function getMessages(id: string): Promise<Message[]> {
  try {
    const response = await fetch(`/api/messages/${id}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch messages (${response.status}): ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    // Log for debugging
    console.error('Error fetching messages:', error);

    // Re-throw with context
    throw new Error(
      `Unable to retrieve messages for ${id}: ${error.message}`
    );
  }
}
```

### Environment Variables

Store sensitive data in environment variables:

```typescript
// In service file
const ACCESS_TOKEN = process.env.YAHOO_ACCESS_TOKEN;
const APP_ID = process.env.YAHOO_APP_ID;

if (!ACCESS_TOKEN) {
  throw new Error('YAHOO_ACCESS_TOKEN environment variable is required');
}

// Use in API calls
headers: {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
}
```

Add to `.env.local`:
```bash
YAHOO_ACCESS_TOKEN=your_token_here
YAHOO_APP_ID=your_app_id_here
```

## Advanced Patterns

### Generic API Client

Create a reusable API client for consistent requests:

```typescript
// lib/services/common.ts

interface ApiClientOptions {
  baseURL: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  constructor(private options: ApiClientOptions) {}

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.options.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: this.options.headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = new URL(endpoint, this.options.baseURL);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        ...this.options.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Use in service:
// lib/services/mailService.ts
import { ApiClient } from './common';

const client = new ApiClient({
  baseURL: 'https://apis.mail.yahoo.com',
  headers: {
    'Authorization': `Bearer ${process.env.YAHOO_ACCESS_TOKEN}`,
  },
});

export async function getMessages(mailboxId: string) {
  return client.get(`/ws/v3/mailboxes/${mailboxId}/messages`);
}
```

### Response Transformation

Transform API responses to match your app's data model:

```typescript
// API returns this format:
interface YahooMessageResponse {
  msg_id: string;
  subject: string;
  from: { name: string; email: string }[];
  timestamp: number;
}

// Your app uses this format:
interface Message {
  id: string;
  title: string;
  sender: string;
  senderEmail: string;
  date: Date;
}

// Transform function
function transformMessage(apiMessage: YahooMessageResponse): Message {
  return {
    id: apiMessage.msg_id,
    title: apiMessage.subject,
    sender: apiMessage.from[0]?.name || 'Unknown',
    senderEmail: apiMessage.from[0]?.email || '',
    date: new Date(apiMessage.timestamp * 1000),
  };
}

// Use in service:
export async function getMessages(mailboxId: string): Promise<Message[]> {
  const response = await fetch(`/api/mailboxes/${mailboxId}/messages`);
  const data: YahooMessageResponse[] = await response.json();

  return data.map(transformMessage);
}
```

### Request Caching

Implement caching for frequently accessed data:

```typescript
// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedMessages(
  mailboxId: string
): Promise<Message[]> {
  const cacheKey = `messages:${mailboxId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const messages = await getMessages(mailboxId);
  cache.set(cacheKey, { data: messages, timestamp: Date.now() });

  return messages;
}
```

## Complete Example: Adding a New Mail API

Let's walk through a complete example of adding a Yahoo Mail API to get unread messages from the last 24 hours.

### Step 1: Analyze the API

**User Request:**
"Add API to get unread messages from the last 24 hours"

**API Endpoint:**
```
GET https://apis.mail.yahoo.com/ws/v3/mailboxes/@.id==<mailbox_id>/messages/@.select==q?q=folderId:<folderId>+isUnread:true+-sort:date+date:[<time-24h> TO *]+count:200&appid=<appId>
```

**Parameters:**
- `mailboxId`: User's mailbox identifier
- `folderId`: Target folder (e.g., Inbox)
- Date range: Last 24 hours
- Filter: Unread messages only
- Sort: By date descending
- Limit: 200 messages

### Step 2: Check Existing Services

```bash
# Check if services exist
ls -la lib/services/

# Look for mail service
cat lib/services/mailService.ts
```

**Found:** `getMessagesBySearch(mailboxId: string, query: string, appId: string)`

This function accepts a query parameter! We can reuse it.

### Step 3: Create Wrapper Function

Add to `lib/services/mailService.ts`:

```typescript
/**
 * Gets unread messages from a specific folder received in the last 24 hours
 *
 * @param mailboxId - The user's mailbox identifier
 * @param folderId - The folder to search in (e.g., "Inbox")
 * @param appId - Yahoo application identifier
 * @returns Promise resolving to array of unread Message objects from last 24h
 *
 * @example
 * ```typescript
 * const unreadMessages = await getUnreadMessages24h(
 *   'user-mailbox-123',
 *   'inbox',
 *   'my-yahoo-app-id'
 * );
 * console.log(`Found ${unreadMessages.length} unread messages`);
 * ```
 */
export async function getUnreadMessages24h(
  mailboxId: string,
  folderId: string,
  appId: string
): Promise<Message[]> {
  // Calculate time 24 hours ago in seconds since epoch
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const time24hAgo = currentTimeSeconds - (24 * 60 * 60);

  // Build the query for unread messages in date range
  const query = [
    `folderId:${folderId}`,
    'isUnread:true',
    '-sort:date',
    `date:[${time24hAgo} TO *]`,
    'count:200'
  ].join(' ');

  // Reuse existing search function
  return getMessagesBySearch(mailboxId, query, appId);
}
```

### Step 4: Validate

```bash
# Type check
npx tsc --noEmit

# Test import
cat > test.ts << 'EOF'
import { getUnreadMessages24h } from '@/lib/services/mailService';
console.log(typeof getUnreadMessages24h); // Should output: function
EOF

npx ts-node test.ts
rm test.ts
```

### Step 5: Document Usage

Create usage example:

```typescript
// app/api/unread-messages/route.ts
import { getUnreadMessages24h } from '@/lib/services/mailService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mailboxId = searchParams.get('mailboxId');
    const folderId = searchParams.get('folderId') || 'Inbox';
    const appId = process.env.YAHOO_APP_ID!;

    if (!mailboxId) {
      return Response.json(
        { error: 'mailboxId is required' },
        { status: 400 }
      );
    }

    const messages = await getUnreadMessages24h(
      mailboxId,
      folderId,
      appId
    );

    return Response.json({
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Failed to fetch unread messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
```

## Summary

This skill helps you efficiently add new downstream APIs by:

1. **Checking for reusability**: Always look for existing functions first
2. **Making smart decisions**: Wrap vs extend vs create new
3. **Following patterns**: Consistent code style and organization
4. **Documenting thoroughly**: JSDoc comments and usage examples
5. **Validating properly**: Type checking and testing

Remember the hierarchy:
1. **Reuse existing function** (create wrapper) 🥇
2. **Extend existing service** (add new function) 🥈
3. **Create new service** (new domain) 🥉

This ensures maintainable, DRY (Don't Repeat Yourself) code that's easy for other developers to understand and use.