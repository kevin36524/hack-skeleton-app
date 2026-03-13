'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/services/api-client';
import { ApiResponse, ListConversationsApiResponse } from '@/lib/types/api';
import { Message } from '@/lib/types/api';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertCircle, Star, Paperclip, BarChart3, ChevronDown, ChevronRight, Trash2, Archive, BookOpen, SkipForward } from 'lucide-react';

interface DigestViewProps {
  mailboxId: string;
  onMessageSelected: (message: Message) => void;
  selectedMessageId?: string;
}

type ButtonAction = 'DELETE' | 'ARCHIVE' | 'STAR' | 'READ' | 'SKIP';

type GroupBy = 'sender' | 'delete_decos' | 'open_decos';

interface DigestPrefs {
  lastVisitTime: number;
  groupby?: GroupBy;
  buttons: ButtonAction[];
  extraQueryParams?: string;
}

const INBOX_FOLDER_ID = '1';

const DEFAULT_PREFS: Omit<DigestPrefs, 'lastVisitTime'> = {
  buttons: ['SKIP', 'DELETE'],
};

function readPrefs(mailboxId: string): DigestPrefs | null {
  try {
    const raw = localStorage.getItem(`digest_prefs_${mailboxId}`);
    if (!raw) return null;
    return JSON.parse(raw) as DigestPrefs;
  } catch {
    return null;
  }
}

function writePrefs(mailboxId: string, prefs: DigestPrefs) {
  try {
    localStorage.setItem(`digest_prefs_${mailboxId}`, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

// ── Action button ─────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<ButtonAction, { label: string; icon: React.ReactNode; className: string }> = {
  DELETE:  { label: 'Delete',   icon: <Trash2 className="h-4 w-4" />,      className: 'text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30' },
  ARCHIVE: { label: 'Archive',  icon: <Archive className="h-4 w-4" />,     className: 'text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30' },
  STAR:    { label: 'Star',     icon: <Star className="h-4 w-4" />,        className: 'text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-950/30' },
  READ:    { label: 'Read',     icon: <BookOpen className="h-4 w-4" />,    className: 'text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30' },
  SKIP:    { label: 'Skip',     icon: <SkipForward className="h-4 w-4" />, className: 'text-gray-500 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800/50' },
};

function ActionButtons({ buttons }: { buttons: ButtonAction[] }) {
  return (
    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
      {buttons.map((action) => {
        const cfg = ACTION_CONFIG[action];
        return (
          <button
            key={action}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              cfg.className
            )}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Single message row ────────────────────────────────────────────────────────

function MessageRow({
  message,
  selected,
  onClick,
}: {
  message: Message;
  selected: boolean;
  onClick: () => void;
}) {
  const isUnread = !message.flags.read;
  const from = message.headers.from[0];
  const senderName = from?.name || from?.email || 'Unknown';
  const initials = senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-colors duration-150',
        'hover:bg-gray-50 dark:hover:bg-gray-800/80',
        selected ? 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-l-purple-600' : 'border border-transparent'
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
          <AvatarFallback className={cn(
            'text-xs font-medium',
            isUnread ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm truncate', isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300')}>
              {senderName}
            </p>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {message.flags.flagged && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
              {message.attachments.length > 0 && <Paperclip className="h-3 w-3 text-gray-400" />}
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {message.headers.internalDate
                  ? formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true })
                  : ''}
              </span>
            </div>
          </div>
          <p className={cn('text-sm truncate mt-0.5', isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>
            {message.headers.subject || '(No subject)'}
          </p>
          {message.snippet && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{message.snippet}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sender bundle (collapsed/expanded) ───────────────────────────────────────

function SenderBundle({
  senderName,
  messages,
  selectedMessageId,
  onMessageSelected,
}: {
  senderName: string;
  messages: Message[];
  selectedMessageId?: string;
  onMessageSelected: (m: Message) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const initials = senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const latestMessage = messages[0];
  const unreadCount = messages.filter(m => !m.flags.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Bundle header */}
      <div
        className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className={cn(
            'text-xs font-medium',
            hasUnread ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className={cn('text-sm truncate', hasUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300')}>
              {senderName}
            </p>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {messages.length}
            </Badge>
            {hasUnread && (
              <Badge className="text-xs flex-shrink-0 bg-purple-500 text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {!expanded && latestMessage && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {latestMessage.headers.subject || '(No subject)'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-gray-400">
            {latestMessage?.headers.internalDate
              ? formatDistanceToNow(new Date(parseInt(latestMessage.headers.internalDate) * 1000), { addSuffix: true })
              : ''}
          </span>
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded messages */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {messages.map(msg => (
            <div key={msg.id} className="px-2 py-1">
              <MessageRow
                message={msg}
                selected={selectedMessageId === msg.id}
                onClick={() => onMessageSelected(msg)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DigestView({ mailboxId, onMessageSelected, selectedMessageId }: DigestViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinceLabel, setSinceLabel] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<DigestPrefs | null>(null);
  const [dismissedCount, setDismissedCount] = useState(0);

  const fetchDigest = useCallback(async () => {
    if (!mailboxId) return;
    try {
      setLoading(true);
      setError(null);

      const existing = readPrefs(mailboxId);
      const now = Math.floor(Date.now() / 1000);

      writePrefs(mailboxId, {
        lastVisitTime: now,
        buttons: existing?.buttons ?? DEFAULT_PREFS.buttons,
        ...(existing?.groupby !== undefined && { groupby: existing.groupby }),
        ...(existing?.extraQueryParams !== undefined && { extraQueryParams: existing.extraQueryParams }),
      });

      setPrefs(existing);

      const lastVisit = existing?.lastVisitTime ?? null;
      const extraQueryParams = existing?.extraQueryParams ?? '';

      let query: string;
      if (!lastVisit) {
        query = `folderId:${INBOX_FOLDER_ID}+count:300${extraQueryParams ? `+${extraQueryParams}` : ''}`;
        setSinceLabel(null);
      } else {
        query = `folderId:${INBOX_FOLDER_ID}+date:{${lastVisit}%20TO%20*}+count:300${extraQueryParams ? `+${extraQueryParams}` : ''}`;
        setSinceLabel(formatDistanceToNow(new Date(lastVisit * 1000), { addSuffix: true }));
      }

      const response = await apiClient.get<ApiResponse<ListConversationsApiResponse>>(
        `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}`
      );
      setMessages(response.result.messages || []);
      setDismissedCount(0);
    } catch (err) {
      setError('Failed to load digest');
      console.error('DigestView fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [mailboxId]);

  useEffect(() => {
    if (mailboxId) fetchDigest();
  }, [fetchDigest]);

  const buttons = prefs?.buttons ?? DEFAULT_PREFS.buttons;
  const groupBySender = prefs?.groupby === 'sender';

  // Flat list sorted newest first
  const sortedMessages = useMemo(() =>
    [...messages].sort((a, b) => {
      const da = a.headers.internalDate ? parseInt(a.headers.internalDate) : 0;
      const db = b.headers.internalDate ? parseInt(b.headers.internalDate) : 0;
      return db - da;
    }),
    [messages]
  );

  // Grouped by sender (preserves recency order of first occurrence)
  const senderGroups = useMemo(() => {
    const map = new Map<string, { senderName: string; messages: Message[] }>();
    for (const msg of sortedMessages) {
      const from = msg.headers.from[0];
      const key = from?.email || from?.name || 'Unknown';
      const name = from?.name || from?.email || 'Unknown';
      if (!map.has(key)) map.set(key, { senderName: name, messages: [] });
      map.get(key)!.messages.push(msg);
    }
    return Array.from(map.values());
  }, [sortedMessages]);

  const visibleMessages = sortedMessages.slice(dismissedCount);
  const visibleGroups = senderGroups.slice(dismissedCount);
  const visibleItems = groupBySender ? visibleGroups : visibleMessages;

  const handleDismiss = () => setDismissedCount(c => c + 1);

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-gray-600 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDigest}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Inbox Digest</span>
          {sortedMessages.length > 0 && (
            <Badge variant="secondary" className="text-xs">{sortedMessages.length}</Badge>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {sinceLabel ? `since ${sinceLabel}` : 'all inbox'}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">You're all caught up</p>
            <p className="text-sm text-gray-400 mt-1">No new messages since your last visit</p>
          </div>
        ) : groupBySender ? (
          <div className="space-y-2 p-2 pb-24">
            {visibleGroups.map(({ senderName, messages: msgs }) => (
              <SenderBundle
                key={senderName}
                senderName={senderName}
                messages={msgs}
                selectedMessageId={selectedMessageId}
                onMessageSelected={onMessageSelected}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-0.5 p-2 pb-24">
            {visibleMessages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                selected={selectedMessageId === message.id}
                onClick={() => onMessageSelected(message)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating action buttons — sit to the left of the AI FAB */}
      {visibleItems.length > 0 && (
        <div className="fixed bottom-5 right-20 z-30 flex gap-2">
          {buttons.map((action) => {
            const cfg = ACTION_CONFIG[action];
            return (
              <button
                key={action}
                onClick={handleDismiss}
                className={cn(
                  'h-14 px-4 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-lg border bg-white dark:bg-gray-800 transition-colors',
                  cfg.className
                )}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
