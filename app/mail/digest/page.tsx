'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import { useMailbox } from '@/lib/hooks/use-yahoo-mail';
import ProtectedRoute from '@/components/protected-route';
import { apiClient } from '@/lib/services/api-client';
import { accountService } from '@/lib/services/account-service';
import { folderService } from '@/lib/services/folder-service';
import { ApiResponse, ListConversationsApiResponse, Message } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  LogOut,
  AlertCircle,
  Star,
  Paperclip,
  BarChart3,
  Flame,
  TrendingUp,
  Minus,
  TrendingDown,
  Snowflake,
  Tag,
  ChevronDown,
  ChevronRight,
  Newspaper,
  ShoppingBag,
} from 'lucide-react';

const MAX_RESULTS = 100;

// Display order. Newsletters & Shopping sit between the high-intent ON buckets
// and the "least likely to open" bucket. Category decos (NER / SH / CPN) take
// precedence over ON open-probability scores when routing a message.
const DECO_ORDER = [
  'ON4',
  'ON3',
  'ON2',
  'NEWSLETTERS',
  'SHOPPING',
  'ON1',
  'ON5',
  'UNCATEGORIZED',
] as const;
type DecoKey = (typeof DECO_ORDER)[number];

// Sections whose sender-bundle list is capped at a preview count with a
// "Show N more" toggle.
const PREVIEW_LIMIT = 6;
const PREVIEW_SECTIONS: ReadonlySet<DecoKey> = new Set(['NEWSLETTERS', 'SHOPPING']);

const DECO_META: Record<
  DecoKey,
  { label: string; sublabel: string; icon: React.ElementType; headerClass: string }
> = {
  NEWSLETTERS: {
    label: 'Newsletters',
    sublabel: 'NER',
    icon: Newspaper,
    headerClass: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  SHOPPING: {
    label: 'Shopping',
    sublabel: 'SH / CPN',
    icon: ShoppingBag,
    headerClass: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  },
  ON4: {
    label: 'Most likely to open',
    sublabel: 'ON4',
    icon: Flame,
    headerClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  ON3: {
    label: 'Likely to open',
    sublabel: 'ON3',
    icon: TrendingUp,
    headerClass: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  ON2: {
    label: 'Less likely to open',
    sublabel: 'ON2',
    icon: TrendingDown,
    headerClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  ON1: {
    label: 'Least likely to open',
    sublabel: 'ON1',
    icon: Snowflake,
    headerClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  ON5: {
    label: 'Other',
    sublabel: 'ON5',
    icon: Tag,
    headerClass: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  UNCATEGORIZED: {
    label: 'Uncategorized',
    sublabel: 'No matching deco',
    icon: Minus,
    headerClass: 'bg-gray-50 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
  },
};

function pickDecoKey(message: Message): DecoKey {
  const ids = new Set(message.decos.map((d) => d.id));
  if (ids.has('NER')) return 'NEWSLETTERS';
  if (ids.has('SH') || ids.has('CPN')) return 'SHOPPING';
  // ON4 → ON3 → ON2 → ON1 → ON5
  if (ids.has('ON4')) return 'ON4';
  if (ids.has('ON3')) return 'ON3';
  if (ids.has('ON2')) return 'ON2';
  if (ids.has('ON1')) return 'ON1';
  if (ids.has('ON5')) return 'ON5';
  return 'UNCATEGORIZED';
}

interface SenderGroup {
  senderKey: string;
  senderName: string;
  messages: Message[];
}

function buildSenderGroups(messages: Message[]): SenderGroup[] {
  const map = new Map<string, SenderGroup>();
  for (const msg of messages) {
    const from = msg.headers.from[0];
    const key = from?.email?.toLowerCase() || from?.name?.toLowerCase() || 'unknown';
    const name = from?.name || from?.email || 'Unknown';
    const existing = map.get(key);
    if (existing) {
      existing.messages.push(msg);
    } else {
      map.set(key, { senderKey: key, senderName: name, messages: [msg] });
    }
  }

  const internalDate = (m: Message) =>
    m.headers.internalDate ? parseInt(m.headers.internalDate) : 0;

  const groups = Array.from(map.values());
  for (const g of groups) {
    g.messages.sort((a, b) => internalDate(b) - internalDate(a));
  }
  // Sort groups by the latest message date in each group (newest first).
  groups.sort((a, b) => internalDate(b.messages[0]) - internalDate(a.messages[0]));
  return groups;
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SenderBundle({ group }: { group: SenderGroup }) {
  const [expanded, setExpanded] = useState(false);
  const latest = group.messages[0];
  const unreadCount = group.messages.filter((m) => !m.flags.read).length;
  const hasUnread = unreadCount > 0;
  const initials = initialsOf(group.senderName);
  const date = latest.headers.internalDate
    ? formatDistanceToNow(new Date(parseInt(latest.headers.internalDate) * 1000), { addSuffix: true })
    : '';

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
      >
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback
            className={cn(
              'text-xs font-medium',
              hasUnread
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm truncate',
                hasUnread
                  ? 'font-bold text-gray-900 dark:text-white'
                  : 'font-medium text-gray-700 dark:text-gray-300'
              )}
            >
              {group.senderName}
            </p>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {group.messages.length}
            </Badge>
            {hasUnread && (
              <Badge className="text-xs flex-shrink-0 bg-purple-500 text-white">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {!expanded && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {latest.headers.subject || '(No subject)'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-gray-400 whitespace-nowrap">{date}</span>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {group.messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  const isUnread = !message.flags.read;
  const from = message.headers.from[0];
  const name = from?.name || from?.email || 'Unknown';
  const initials = initialsOf(name);
  const date = message.headers.internalDate
    ? formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true })
    : '';

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
      <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
        <AvatarFallback
          className={cn(
            'text-xs font-medium',
            isUnread
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm truncate',
              isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'
            )}
          >
            {name}
          </p>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {message.flags.flagged && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
            {message.attachments.length > 0 && <Paperclip className="h-3 w-3 text-gray-400" />}
            <span className="text-xs text-gray-400 whitespace-nowrap">{date}</span>
          </div>
        </div>
        <p
          className={cn(
            'text-sm truncate mt-0.5',
            isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
          )}
        >
          {message.headers.subject || '(No subject)'}
        </p>
        {message.snippet && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{message.snippet}</p>
        )}
      </div>
    </div>
  );
}

function DigestPageContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: mailboxData, isLoading: mailboxLoading } = useMailbox();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primaryMailbox = mailboxData?.mailboxes.find((m) => m.isPrimary && m.isSelected);
  const mailboxId = primaryMailbox?.id;

  useEffect(() => {
    if (!mailboxId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Resolve the active account — selected if present, else primary, else first enabled.
        const enabled = await accountService.getEnabledAccounts(mailboxId);
        const activeAccount =
          enabled.find((a) => a.isSelected) ||
          enabled.find((a) => a.isPrimary) ||
          enabled[0];
        if (!activeAccount) {
          throw new Error('No active account available');
        }

        // Resolve the inbox folder for the active account.
        const { inbox } = await folderService.getFoldersByType(mailboxId, activeAccount.id);
        if (!inbox) {
          throw new Error('No inbox folder found for the active account');
        }

        const query = `folderId:${inbox.id}+count:${MAX_RESULTS}`;
        const response = await apiClient.get<ApiResponse<ListConversationsApiResponse>>(
          `/mailboxes/@.id==${mailboxId}/messages/@.select==q?q=${query}`
        );
        if (!cancelled) setMessages(response.result.messages || []);
      } catch (err) {
        console.error('Digest fetch error:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load digest');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mailboxId]);

  const grouped = useMemo(() => {
    const byDeco = new Map<DecoKey, Message[]>();
    for (const key of DECO_ORDER) byDeco.set(key, []);
    for (const msg of messages) {
      byDeco.get(pickDecoKey(msg))!.push(msg);
    }
    const result = new Map<DecoKey, { messages: Message[]; senders: SenderGroup[] }>();
    for (const [key, list] of byDeco.entries()) {
      result.set(key, { messages: list, senders: buildSenderGroups(list) });
    }
    return result;
  }, [messages]);

  const [collapsedSections, setCollapsedSections] = useState<Record<DecoKey, boolean>>({
    NEWSLETTERS: false,
    SHOPPING: false,
    ON4: false,
    ON3: false,
    ON2: false,
    ON1: true, // least-likely: collapsed by default
    ON5: false,
    UNCATEGORIZED: false,
  });

  const toggleSection = (key: DecoKey) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [expandedPreviews, setExpandedPreviews] = useState<Set<DecoKey>>(new Set());
  const togglePreview = (key: DecoKey) =>
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const isLoading = loading || mailboxLoading;
  const hasAnyMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/mail')}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Mail className="h-7 w-7 text-purple-600" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
                Inbox Digest
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="mb-5 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Top {MAX_RESULTS} inbox emails, grouped by open probability
              </h2>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <Skeleton className="h-5 w-44 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!isLoading && !error && !hasAnyMessages && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                No emails found in your inbox.
              </div>
            )}

            {!isLoading && !error && hasAnyMessages && (
              <div className="space-y-4">
                {DECO_ORDER.map((key) => {
                  const bucket = grouped.get(key);
                  if (!bucket || bucket.messages.length === 0) return null;
                  const meta = DECO_META[key];
                  const Icon = meta.icon;
                  const collapsed = collapsedSections[key];
                  return (
                    <section
                      key={key}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5',
                          !collapsed && 'border-b border-gray-200 dark:border-gray-700',
                          meta.headerClass
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <Icon className="h-4 w-4" />
                          <span className="font-semibold text-sm">{meta.label}</span>
                          <span className="text-xs opacity-70">({meta.sublabel})</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {bucket.messages.length}
                        </Badge>
                      </button>
                      {!collapsed && (() => {
                        const isPreview = PREVIEW_SECTIONS.has(key);
                        const showAll = expandedPreviews.has(key);
                        const sendersToShow =
                          isPreview && !showAll
                            ? bucket.senders.slice(0, PREVIEW_LIMIT)
                            : bucket.senders;
                        const hiddenCount = bucket.senders.length - sendersToShow.length;
                        return (
                          <>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {sendersToShow.map((g) =>
                                g.messages.length === 1 ? (
                                  <MessageRow key={g.messages[0].id} message={g.messages[0]} />
                                ) : (
                                  <SenderBundle key={g.senderKey} group={g} />
                                )
                              )}
                            </div>
                            {isPreview && (hiddenCount > 0 || showAll) && (
                              <button
                                type="button"
                                onClick={() => togglePreview(key)}
                                className="w-full px-4 py-2.5 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-gray-50 dark:hover:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 transition-colors"
                              >
                                {showAll ? 'Show less' : `Show ${hiddenCount} more`}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default function DigestPage() {
  return (
    <ProtectedRoute>
      <DigestPageContent />
    </ProtectedRoute>
  );
}
