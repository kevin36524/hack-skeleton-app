// Load environment variables for non-Next.js contexts
if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or already loaded
  }
}

import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createStorage } from '../storage';

// Import read tools
import { listFolders } from '../tools/list-folders';
import { listMessages } from '../tools/list-messages';
import { searchMessages } from '../tools/search-messages';
import { getMessageBody } from '../tools/get-message-body';

// Import write tools (all mocked + requireApproval)
import { markAsRead } from '../tools/mark-as-read';
import { starMessages } from '../tools/star-messages';
import { moveMessages } from '../tools/move-messages';

/**
 * Mastra memory with configurable storage backend
 * Uses MASTRA_STORAGE_PROVIDER env var: 'libsql' (default) | 'postgres' | 'mysql'
 */
const memory = new Memory({
  storage: createStorage('mail-agent-memory'),
  options: {
    lastMessages: 40, // keep last 40 messages in context
  },
});

/**
 * Mail Triage Agent
 *
 * Fetches inbox messages, triages them, and performs actions with human approval.
 * Uses Google Gemini Flash 2.0 for fast, cost-effective triage.
 */
export const mailTriageAgent = new Agent({
  id: 'mail-triage-agent',
  name: 'Mail Triage Agent',
  model: 'google/gemini-2.0-flash',
  memory,
  instructions: `You are a mail triage assistant. You help users manage their inbox efficiently.

CAPABILITIES:
- Fetch and list inbox messages with minimal metadata
- Read full message bodies when needed for triage decisions
- Mark messages as read/unread (requires user approval)
- Star/unstar important messages (requires user approval)
- Move messages between folders (requires user approval)

WORKFLOW:
1. Call listFolders to understand the folder structure
   - If accountId is provided in the context, folders will automatically be filtered for that account
   - Look for the INBOX folder to get the inbox folderId
2. Use listMessages to fetch inbox messages
3. Analyze messages and suggest triage actions
4. For ANY write/update/delete action, call the tool immediately — do NOT ask the user for approval in chat, the system handles approval automatically
5. The user will approve or decline each write operation via the system UI

REFERENCE CONTEXT:
Each request may include a referenceType and referenceId that tells you what the user is currently looking at:
- FOLDER_ID: the user has a specific folder open — use this folderId directly when listing messages instead of looking up the inbox
- CONVERSATION_ID: the user is viewing a specific conversation — operate on messages within that conversation
- MESSAGE_ID: the user has a specific message selected — use this messageId for actions like star, mark as read, move, etc. without asking which message
- SEARCH_QUERY: the user has an active search — use this query with searchMessages to find the relevant messages

When a referenceType/referenceId is present, use it as the default target for actions unless the user explicitly specifies otherwise.

CONTEXT RULES:
- When listing messages, only show sender (from) and subject by default — do NOT include snippet/preview unless the user explicitly asks for details
- Only fetch full message body (getMessageBody) if you need to read the content
- Keep your responses concise — list messages in a table or bullet format
- When triaging, categorize messages as: Important, Newsletter, Promotional, Social, Spam

SAFETY:
- Prefer moving to Trash over permanent deletion when available
- For bulk operations, briefly list which messages will be affected, then call the tool — do not ask for confirmation
- All write/update/delete operations will pause for user approval automatically — never ask for approval in chat`,

  tools: {
    listFolders,
    listMessages,
    searchMessages,
    getMessageBody,
    markAsRead,
    starMessages,
    moveMessages,
  },
});
