// Yahoo Mail API Type Definitions

export interface ApiResponse<T> {
  result: T;
}

// Mailbox Types
export interface Mailbox {
  id: string;
  email: string;
  isPrimary: boolean;
  isSelected: boolean;
  link: {
    type: string;
    href: string;
  };
  state: string;
  type: string;
  locationSwitch?: string;
}

export interface CpAttributes {
  consentEvents: {
    [key: string]: {
      status: string;
    };
  };
  accountCreationTime: string;
}

export interface GetMailBoxApiResponse {
  mailboxes: Mailbox[];
  guid: string;
  cpAttributes: CpAttributes;
  state: string;
  shardId: string;
  namespace: string;
  oauth: {
    scopes: string[];
  };
}

// Account Types
export interface Account {
  id: string;
  priority: number;
  email: string;
  createTime: number;
  authType?: string;
  link: {
    type: string;
    href: string;
  };
  isPrimary: boolean;
  description?: string;
  sendingName?: string;
  accountVerified: boolean;
  status: "ENABLED" | "DISABLED";
  signature?: string;
  signatureActive: boolean;
  popOutSetting?: string;
  isSending: boolean;
  isSelected: boolean;
  checksum: string;
  subscriptionId: string;
  highestModSeq: number;
  recoveryChannel?: boolean;
  type: "FREE" | "IMAPIN" | "SENDAS";
  linkedAccounts?: string[];
  ignoredFolders?: Array<{
    name: string;
    types: string[];
  }>;
  serverUri?: string;
  provider?: string;
  replyToAddress?: string;
  lastVerifiedTime?: number;
}

export interface GetAccountsApiResponse {
  accounts: Account[];
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  types: string[];
  unread: number;
  total: number;
  size: number;
  uidNext: number;
  uidValidity: number;
  acctId: string;
  highestModSeq: number;
  link: {
    type: string;
    href: string;
  };
  bidi: unknown[];
  oldV2Fid?: string;
}

export interface GetFoldersApiResponse {
  folders: Folder[];
}

// Message Types
export interface MessageHeader {
  subject: string;
  from: Array<{
    name?: string;
    email: string;
  }>;
  to: Array<{
    name?: string;
    email: string;
  }>;
  replyTo?: Array<{
    email: string;
  }>;
  inReplyTo?: string;
  internalDate: string;
  messageIdRfc822?: string;
}

export interface MessageFlags {
  ham?: boolean;
  recent?: boolean;
  read?: boolean;
  flagged?: boolean;
}

export interface Deco {
  id: string;
  type: string;
}

export interface Attachment {
  [key: string]: unknown;
}

export interface SchemaOrg {
  schema: {
    "@id": string;
    "@type": string;
    "@context": string;
    category?: unknown[];
    jediSchemaInfoNode?: unknown;
  };
}

export interface Message {
  folder: {
    id: string;
    name: string;
    types: string[];
    unread: number;
    total: number;
    acctId: string;
    highestModSeq: number;
  };
  flags: MessageFlags;
  headers: MessageHeader;
  id: string;
  conversationId: string;
  snippet: string;
  decos: Deco[];
  attachments: Attachment[];
  dedupId: number;
  schemaOrg?: SchemaOrg[];
  modSeq: number;
  cardConversationId?: string;
}

export interface Conversation {
  id: string;
  messageIds: string[];
  folderIds: string[];
}

export interface ListConversationsApiResponse {
  messages: Message[];
  conversations: Conversation[];
  query: {
    nextModSeq: number;
  };
}

export interface SearchMessagesApiResponse {
  messages: Message[];
}

// Save Message API Types
export interface SaveMessageRequest {
  message: {
    newMessage: boolean;
    folder: {
      id: string;
    };
    flags: {
      spam: string;
      read: string;
    };
    headers: {
      from: Array<{
        email: string;
        name?: string;
      }>;
      to?: Array<{
        email: string;
        name?: string;
      }>;
      subject?: string;
    };
    csid?: string;
    decos: Array<any>;
    schemaOrg: Array<{
      schema: {
        "@context": string;
        "@type": string;
        payload?: any;
        [key: string]: any;
      };
    }>;
    attachments: Array<any>;
  };
  actions: {
    responseMessage: boolean;
    applyAntispam: boolean;
    applySaveFromAddressCheck: boolean;
    generateCardConversationId: boolean;
  };
  simpleBody: {
    text: string;
  };
}

export interface SaveMessageResponse {
  message: {
    id: string;
    folder: {
      id: string;
    };
    flags: MessageFlags;
  };
}

// Update Message API Types
export interface UpdateMessageRequest {
  message: {
    id?: string;
    folder?: {
      id: string;
    };
    flags?: {
      spam?: string;
      read?: string;
      flagged?: string;
    };
    headers?: {
      subject?: string;
      from?: Array<{
        email: string;
        name?: string;
      }>;
      to?: Array<{
        email: string;
        name?: string;
      }>;
    };
    schemaOrg?: Array<{
      schema: {
        "@context": string;
        "@type": string;
        payload?: any;
        [key: string]: any;
      };
    }>;
    body?: {
      html?: string;
      text?: string;
    };
  };
}

export interface UpdateMessageResponse {
  // 204 No Content - empty response body
  status: 204;
}

// Delete Message API Types
export interface DeleteMessageResponse {
  // 204 No Content - empty response body
  status: 204;
}

// Triage API Types
export interface TriageRequest {
  batch: Array<{
    id: string;
    method: string;
    uri: string;
    entity: {
      message: {
        id: string;
        flags: {
          read?: number;
          flagged?: number;
        };
      };
    };
  }>;
}

export interface TriageResponse {
  batch: Array<{
    id: string;
    status: number;
    entity?: {
      message?: {
        id: string;
        flags: MessageFlags;
      };
    };
  }>;
}

// Move Messages API Types
export interface MoveMessagesRequest {
  responseType: "json";
  requests: Array<{
    id: string;
    exportResponse: boolean;
    uri: string;
    method: "POST";
    requests: Array<any>;
    filters: Record<string, any>;
    payload: {
      message: {
        folder: {
          id: string;
        };
      };
    };
    suppressResponse: boolean;
  }>;
}

export interface MoveMessagesResponse {
  requests: Array<{
    id: string;
    status: number;
    payload?: {
      message?: {
        id: string;
        folder: {
          id: string;
        };
      };
    };
  }>;
}

// Full Message Body Types
export interface FullMessageBodyResponse {
  simpleBody: {
    text: string;
    html?: string;
  };
}

// API Error Types
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface ApiResponseWrapper<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
}
