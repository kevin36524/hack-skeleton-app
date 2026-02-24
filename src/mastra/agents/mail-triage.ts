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
import { getMailbox } from '../tools/get-mailbox';
import { listFolders } from '../tools/list-folders';
import { listMessages } from '../tools/list-messages';
import { searchMessages } from '../tools/search-messages';
import { getMessageBody } from '../tools/get-message-body';

// Import write tools (all mocked + requireApproval)
import { markAsRead } from '../tools/mark-as-read';
import { starMessages } from '../tools/star-messages';
import { moveMessages } from '../tools/move-messages';
import { deleteMessages } from '../tools/delete-messages';

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
  model: 'google/gemini-2.5-flash-lite',
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
   - If accountId is provided in the context, folders will automatically be filtered for that account
   - Look for the INBOX folder to get the inbox folderId
3. Use listMessages to fetch inbox messages
4. Analyze messages and suggest triage actions
5. For ANY write/update/delete action, call the tool immediately — do NOT ask the user for approval in chat, the system handles approval automatically
6. The user will approve or decline each write operation via the system UI

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
    getMailbox,
    listFolders,
    listMessages,
    searchMessages,
    getMessageBody,
    markAsRead,
    starMessages,
    moveMessages,
    deleteMessages,
  },
});
