'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Play,
  ChevronDown,
  ChevronRight,
  Terminal,
  Database,
  Zap,
  ArrowLeft,
  Trash2,
  Network,
  UserCheck,
  AlertTriangle,
  Calendar,
  ListChecks,
  MessageSquare,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types (v2 wire shapes) ───────────────────────────────────────────────────

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApiResult {
  status: RequestStatus;
  data: unknown;
  error?: string;
  durationMs?: number;
}

interface JobCall {
  ts: number;
  method: 'GET' | 'POST';
  url: string;
  status: number | 'err';
}

type SenderBucket =
  | 'frequent'
  | 'occasional'
  | 'most_read'
  | 'starred_only'
  | 'most_unread'
  | 'bulk_filtered';

type UserType =
  | 'zero_inbox'
  | 'active_reader'
  | 'flooded'
  | 'provider_native_gmail'
  | 'provider_native_ymail';

interface SenderStats {
  email: string;
  name: string;
  sentToCount: number;
  replyCount: number;
  starCount: number;
  readCount: number;
  unreadCount: number;
  trashCount: number;
  archiveCount: number;
  lastSeenMs: number;
}

interface SenderRecord {
  email: string;
  name: string;
  bucket: SenderBucket;
  stats: SenderStats;
  messageIds: string[];
}

interface SelfIdentity {
  primaryEmail: string;
  aliases: string[];
  displayName: string;
}

interface V2SenderProgress {
  bucket: SenderBucket;
  email: string;
  status: 'done' | 'error';
  error?: string;
}

interface JobStatus {
  phase: number;
  status: string;
  costSpent: number;
  errorCount: number;
  calls?: JobCall[];
  callCount?: number;
  phase0Candidates?: SenderRecord[];
  approvedCandidateEmails?: string[];
  v2Self?: SelfIdentity;
  v2UserType?: UserType;
  v2BucketCounts?: Record<SenderBucket, number>;
  v2ProcessedSenders?: V2SenderProgress[];
}

interface BackfillStartResponse {
  jobId: string;
  uid: string;
  email?: string;
  candidates: SenderRecord[];
  userType: UserType;
  bucketCounts: Record<SenderBucket, number>;
}

interface BackfillRunResponse {
  jobId: string;
  accepted: number;
}

interface FirestoreTs {
  _seconds?: number;
  seconds?: number;
  _nanoseconds?: number;
  nanoseconds?: number;
}

interface Entity {
  id: string;
  type: string;
  label: string;
  drawer: string;
  emailAddresses: string[];
  aliases?: string[];
  relationshipClass?: string;
  sourceMessageIds?: string[];
  firstSeen?: FirestoreTs;
  lastUpdated?: FirestoreTs;
  dossier?: string;
  senderClass?: string;
  senderClassConfidence?: number;
}

interface PersistedThread {
  threadId: string;
  title: string;
  description: string;
  participantEmails: string[];
  triggerPhrases: string[];
  sourceMessageIds: string[];
  firstSeen: string;
  lastSeen: string;
}

interface PersistedEvent {
  eventId: string;
  title: string;
  startTimeMs: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  links?: string[];
  description?: string;
  sourceMessageIds: string[];
}

interface PersistedCommitment {
  commitmentId: string;
  title: string;
  dueDateMs: number;
  dueDate?: string;
  owedBy: 'user' | 'sender' | 'other';
  links?: string[];
  description?: string;
  sourceMessageIds: string[];
}

interface PersistedFact {
  factId: string;
  claim: string;
  relatedEntityLabel?: string;
  relatedEntityId?: string;
  sourceMessageIds: string[];
  createdAt?: FirestoreTs;
}

interface TopOfMindUpcoming {
  type: 'event' | 'commitment';
  label: string;
  when: string;
  artifacts?: {
    reservationIds?: string[];
    attachmentIds?: string[];
    links?: string[];
  };
  sourceMessageIds: string[];
}

interface TopOfMindOpenThread {
  threadId: string;
  title: string;
  summary: string;
  lastActivity: string;
}

interface TopOfMindReaderProfile {
  interests?: string;
  noise?: string;
  generatedAt?: string;
}

interface TopOfMind {
  importantFacts: Array<{
    claim: string;
    sourceMessageIds: string[];
    relatedEntityLabel?: string;
    relatedEntityId?: string;
    factId?: string;
  }>;
  upcoming: TopOfMindUpcoming[];
  openThreads: TopOfMindOpenThread[];
  readerProfile?: TopOfMindReaderProfile;
  generatedAt: string;
}

type ScreeningPriority = 'high' | 'medium' | 'low' | string;

interface ScreeningRule {
  priority?: ScreeningPriority;
  source?: string;
  justification?: string;
}

// Legacy/flat row form, kept for backward compat with older screening docs.
interface SenderScreeningRow {
  high?: string[];
  medium?: string[];
  low?: string[];
  subjectPatterns?: string[];
  justification?: string;
}

// perSender values may be either a flat rule, a legacy row, or a nested
// map of sub-keys (message ids, related sender emails) → rule.
type PerSenderValue =
  | ScreeningRule
  | SenderScreeningRow
  | Record<string, ScreeningRule>;

interface ScreeningDoc {
  perSender: Record<string, PerSenderValue>;
  denyTokens: string[];
  updatedAt?: FirestoreTs;
}

interface Note {
  id: string;
  bucket: string;
  markdown: string;
  senderEmail?: string;
  createdAt?: FirestoreTs;
}

interface GraphCounts {
  entities: number;
  threads: number;
  events: number;
  commitments: number;
  facts: number;
  notes?: number;
}

interface GraphResponse {
  entities: Entity[];
  threads: PersistedThread[];
  events: PersistedEvent[];
  commitments: PersistedCommitment[];
  facts: PersistedFact[];
  topOfMind: TopOfMind | null;
  screening: ScreeningDoc | null;
  notes?: Note[];
  counts: GraphCounts;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAILBOX_PREFIX = /^\/mailboxes\/@\.id==[^/]+/;
function stripMailboxPrefix(url: string): string {
  return url.replace(MAILBOX_PREFIX, '');
}

function tsToDate(ts: FirestoreTs | null | undefined): Date | null {
  if (!ts) return null;
  const s = ts._seconds ?? ts.seconds;
  if (typeof s !== 'number') return null;
  const ns = ts._nanoseconds ?? ts.nanoseconds ?? 0;
  return new Date(s * 1000 + Math.floor(ns / 1e6));
}

function fmtDate(ts: FirestoreTs | null | undefined): string {
  const d = tsToDate(ts);
  return d ? d.toISOString().slice(0, 10) : '—';
}

function fmtMsDate(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '—';
  return new Date(ms).toISOString().slice(0, 10);
}

function fmtMsDateTime(ms: number | null | undefined): string {
  if (!ms || ms <= 0) return '—';
  return new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
}

function fmtIso(s: string | null | undefined): string {
  if (!s) return '—';
  return s.slice(0, 16).replace('T', ' ');
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === 'idle') return <Badge variant="secondary">idle</Badge>;
  if (status === 'loading') return <Badge className="bg-yellow-500 text-white">running</Badge>;
  if (status === 'success') return <Badge className="bg-green-600 text-white">success</Badge>;
  return <Badge className="bg-red-600 text-white">error</Badge>;
}

function JsonBlock({ data }: { data: unknown }) {
  const [collapsed, setCollapsed] = useState(true);
  if (data === null || data === undefined) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-1 text-xs text-muted-foreground mb-1 hover:text-foreground"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        {collapsed ? 'show response' : 'hide response'}
      </button>
      {!collapsed && (
        <pre className="bg-muted rounded-md p-3 text-xs overflow-auto max-h-48 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function CallLogTable({ calls, total }: { calls: JobCall[]; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? calls : calls.slice(-20);
  return (
    <div className="border-t pt-2 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Yahoo API calls ({total} total)
        </span>
        {calls.length > 20 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? 'show last 20' : `show all ${calls.length}`}
          </button>
        )}
      </div>
      <div className="max-h-56 overflow-y-auto rounded border bg-muted/30">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="px-2 py-1 text-left w-14">method</th>
              <th className="px-2 py-1 text-left">url</th>
              <th className="px-2 py-1 text-right w-12">status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c, i) => (
              <tr key={i} className="border-b border-muted last:border-0">
                <td className="px-2 py-0.5 text-blue-500">{c.method}</td>
                <td className="px-2 py-0.5 truncate max-w-0 w-full" title={c.url}>{stripMailboxPrefix(c.url)}</td>
                <td className={`px-2 py-0.5 text-right ${
                  c.status === 'err' ? 'text-red-500'
                    : typeof c.status === 'number' && c.status < 300 ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiCard({
  title, description, result, children, onRun, disabled,
}: {
  title: string; description: string; result: ApiResult;
  children?: React.ReactNode; onRun: () => void; disabled?: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-sm">{title}</span>
            <StatusBadge status={result.status} />
            {result.durationMs !== undefined && result.status !== 'loading' && (
              <span className="text-xs text-muted-foreground">{result.durationMs}ms</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={onRun} disabled={disabled || result.status === 'loading'} className="shrink-0">
          {result.status === 'loading' ? <Loader2 size={14} className="animate-spin mr-1" /> : <Play size={14} className="mr-1" />}
          Run
        </Button>
      </div>
      {children}
      {result.status === 'error' && (
        <div className="flex items-start gap-2 text-red-600 text-xs">
          <XCircle size={14} className="mt-0.5 shrink-0" />{result.error}
        </div>
      )}
      {result.status === 'success' && (
        <div className="flex items-center gap-2 text-green-600 text-xs">
          <CheckCircle size={14} />Request completed successfully
        </div>
      )}
      <JsonBlock data={result.data} />
    </div>
  );
}

// ─── User type + bucket helpers ───────────────────────────────────────────────

const BUCKET_ORDER: SenderBucket[] = [
  'frequent',
  'occasional',
  'most_read',
  'starred_only',
  'most_unread',
  'bulk_filtered',
];

function bucketColor(b: SenderBucket): string {
  switch (b) {
    case 'frequent': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'occasional': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    case 'most_read': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
    case 'starred_only': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'most_unread': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    case 'bulk_filtered': return 'bg-muted text-muted-foreground';
  }
}

function BucketBadge({ bucket }: { bucket: SenderBucket }) {
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${bucketColor(bucket)}`}>
      {bucket.replace('_', ' ')}
    </span>
  );
}

function UserTypeBadge({ userType }: { userType: UserType }) {
  const copy: Record<UserType, { label: string; tone: string }> = {
    zero_inbox: { label: 'Zero inbox', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    active_reader: { label: 'Active reader', tone: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    flooded: { label: 'Flooded — selective extraction', tone: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    provider_native_gmail: { label: 'Gmail-native', tone: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
    provider_native_ymail: { label: 'Yahoo-native', tone: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  };
  const c = copy[userType] ?? { label: userType, tone: 'bg-muted text-muted-foreground' };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${c.tone}`} title={`userType = ${userType}`}>
      {c.label}
    </span>
  );
}

function BucketCountsBar({ counts }: { counts: Record<SenderBucket, number> }) {
  const total = BUCKET_ORDER.reduce((a, b) => a + (counts[b] ?? 0), 0);
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-muted-foreground">
        Found <span className="text-foreground font-medium">{total}</span> senders across buckets
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BUCKET_ORDER.map((b) => (
          <span key={b} className={`px-2 py-0.5 rounded text-[10px] font-medium ${bucketColor(b)}`}>
            {b.replace('_', ' ')} · {counts[b] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── HITL: Phase 0/1 candidates review (v2 SenderRecord) ──────────────────────

function SenderStatPills({ stats }: { stats: SenderStats }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stats.sentToCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" title="Times user sent to this sender">↩ {stats.sentToCount}</span>
      )}
      {stats.replyCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" title="Distinct conversations where user replied">⇄ {stats.replyCount}</span>
      )}
      {stats.starCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" title="Starred messages">★ {stats.starCount}</span>
      )}
      {stats.readCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" title="Read messages">✓ {stats.readCount}</span>
      )}
      {stats.unreadCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" title="Unread messages">● {stats.unreadCount}</span>
      )}
    </div>
  );
}

function CandidatesReview({
  candidates,
  userType,
  bucketCounts,
  onApprove,
  loading,
}: {
  candidates: SenderRecord[];
  userType: UserType | null;
  bucketCounts: Record<SenderBucket, number> | null;
  onApprove: (approved: string[]) => void;
  loading: boolean;
}) {
  // Server already orders candidates: frequent → occasional → most_read → starred_only.
  // Default-select all `frequent` + `occasional` (the high-signal buckets).
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(
      candidates
        .filter((c) => c.bucket === 'frequent' || c.bucket === 'occasional')
        .map((c) => c.email)
    )
  );

  const toggle = (email: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });

  const selectBucket = (b: SenderBucket) => {
    setChecked((prev) => {
      const next = new Set(prev);
      candidates.filter((c) => c.bucket === b).forEach((c) => next.add(c.email));
      return next;
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-amber-50 dark:bg-amber-950/20 border-amber-300">
      <div className="flex items-center gap-2 flex-wrap">
        <UserCheck size={16} className="text-amber-600" />
        <span className="font-medium text-sm">Review Senders</span>
        <Badge className="bg-amber-500 text-white">{checked.size} / {candidates.length} selected</Badge>
        {userType && <UserTypeBadge userType={userType} />}
      </div>

      {bucketCounts && <BucketCountsBar counts={bucketCounts} />}

      <p className="text-xs text-muted-foreground">
        Frequent + occasional senders are pre-selected (the buckets with reply signal). Add starred / most-read senders if they matter.
      </p>

      <div className="max-h-96 overflow-y-auto rounded border bg-background">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr className="border-b">
              <th className="px-2 py-1 w-8"></th>
              <th className="px-2 py-1 text-left w-24">Bucket</th>
              <th className="px-2 py-1 text-left">Email / Name</th>
              <th className="px-2 py-1 text-left">Stats</th>
              <th className="px-2 py-1 text-right w-24">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr
                key={c.email}
                className={`border-b border-muted last:border-0 cursor-pointer hover:bg-muted/50 ${!checked.has(c.email) ? 'opacity-40' : ''}`}
                onClick={() => toggle(c.email)}
              >
                <td className="px-2 py-1.5 text-center">
                  <input type="checkbox" checked={checked.has(c.email)} onChange={() => toggle(c.email)} onClick={(e) => e.stopPropagation()} />
                </td>
                <td className="px-2 py-1.5"><BucketBadge bucket={c.bucket} /></td>
                <td className="px-2 py-1.5">
                  <div className="font-mono truncate max-w-[220px]" title={c.email}>{c.email}</div>
                  {c.name && <div className="text-muted-foreground text-[10px] truncate max-w-[220px]">{c.name}</div>}
                </td>
                <td className="px-2 py-1.5">
                  <SenderStatPills stats={c.stats} />
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-[10px] text-muted-foreground">
                  {fmtMsDate(c.stats.lastSeenMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3 flex-wrap text-xs">
          <button className="text-blue-600 hover:underline" onClick={() => setChecked(new Set(candidates.map((c) => c.email)))}>Select all</button>
          <button className="text-muted-foreground hover:underline" onClick={() => setChecked(new Set())}>Deselect all</button>
          {(['frequent', 'occasional', 'most_read', 'starred_only'] as const).map((b) => (
            <button key={b} className="text-muted-foreground hover:underline" onClick={() => selectBucket(b)}>
              + {b.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => onApprove(Array.from(checked))} disabled={loading || checked.size === 0}>
          {loading ? <Loader2 size={13} className="animate-spin mr-1" /> : <Zap size={13} className="mr-1" />}
          Run Deep Extraction ({checked.size} senders)
        </Button>
      </div>
    </div>
  );
}

// ─── v2 progress log (replaces phase1SenderResults + phase2EntityProgress) ────

function V2ProgressLog({
  processed,
  approvedCount,
  v2Self,
}: {
  processed: V2SenderProgress[];
  approvedCount: number;
  v2Self: SelfIdentity | null;
}) {
  const [filter, setFilter] = useState<'all' | 'done' | 'error'>('all');
  const [search, setSearch] = useState('');

  const done = processed.filter((p) => p.status === 'done').length;
  const errors = processed.filter((p) => p.status === 'error').length;
  const pct = approvedCount > 0 ? Math.min(1, processed.length / approvedCount) : 0;

  const visible = processed.filter((p) => {
    if (filter === 'done' && p.status !== 'done') return false;
    if (filter === 'error' && p.status !== 'error') return false;
    if (search) {
      const q = search.toLowerCase();
      return p.email.toLowerCase().includes(q) || (p.error ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center gap-2 flex-wrap">
        <Terminal size={14} className="text-muted-foreground" />
        <span className="font-medium text-sm">Phase 2 — Per-sender extraction</span>
        <Badge className="bg-green-600 text-white text-xs">{done} done</Badge>
        {errors > 0 && <Badge className="bg-red-600 text-white text-xs">{errors} errors</Badge>}
        <Badge variant="secondary" className="text-xs">{processed.length} / {approvedCount}</Badge>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct * 100}%` }} />
      </div>

      {v2Self && (
        <div className="text-[11px] text-muted-foreground border-l-2 border-muted pl-2">
          <span className="font-medium">Self:</span> {v2Self.displayName || v2Self.primaryEmail}{' '}
          <span className="font-mono">{v2Self.primaryEmail}</span>
          {v2Self.aliases.length > 1 && (
            <span> · {v2Self.aliases.length} aliases</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1 text-xs bg-background w-48"
          placeholder="Filter by email / error…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex rounded border overflow-hidden text-xs">
          {(['all', 'done', 'error'] as const).map((f) => (
            <button
              key={f}
              className={`px-2 py-1 ${filter === f ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted border-b text-muted-foreground">
              <tr>
                <th className="px-2 py-1 text-left w-24">Bucket</th>
                <th className="px-2 py-1 text-left w-20">Status</th>
                <th className="px-2 py-1 text-left">Email</th>
                <th className="px-2 py-1 text-left">Error</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.email} className={`border-b border-muted last:border-0 ${p.status === 'error' ? 'opacity-80' : ''}`}>
                  <td className="px-2 py-1.5"><BucketBadge bucket={p.bucket} /></td>
                  <td className="px-2 py-1.5">
                    {p.status === 'done' ? (
                      <span className="text-green-600">✓ done</span>
                    ) : (
                      <span className="text-red-500">✗ error</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 font-mono max-w-[260px] truncate" title={p.email}>{p.email}</td>
                  <td className="px-2 py-1.5 text-[10px] text-muted-foreground font-mono max-w-[260px] truncate" title={p.error ?? ''}>
                    {p.error ?? '—'}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No rows match filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Graph view: entities / threads / events / commitments / facts / top of mind ─

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border rounded p-3 bg-muted/30 text-center">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function NoteBlock({ note }: { note: Note }) {
  return (
    <div className="border rounded-md bg-background p-2 space-y-1">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="px-1.5 py-0.5 rounded bg-muted font-medium">{note.bucket}</span>
        {note.senderEmail && <span className="font-mono truncate">{note.senderEmail}</span>}
        <span className="ml-auto">{fmtDate(note.createdAt)}</span>
      </div>
      <pre className="text-[11px] font-sans whitespace-pre-wrap leading-relaxed max-h-96 overflow-auto">
        {note.markdown}
      </pre>
    </div>
  );
}

function EntityCard({ entity, notes }: { entity: Entity; notes?: Note[] }) {
  const [open, setOpen] = useState(false);
  const entityEmails = new Set((entity.emailAddresses ?? []).map((e) => e.toLowerCase()));
  const entityNotes = (notes ?? []).filter(
    (n) => n.senderEmail && entityEmails.has(n.senderEmail.toLowerCase())
  );
  return (
    <div className="border rounded-lg bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/30 text-left"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {entity.type}
        </span>
        <span className="font-medium text-sm truncate max-w-[260px]">{entity.label}</span>
        {entity.relationshipClass && (
          <span className="text-[10px] text-muted-foreground">· {entity.relationshipClass}</span>
        )}
        {entity.emailAddresses?.[0] && (
          <span className="text-[11px] font-mono text-muted-foreground ml-1 truncate">
            {entity.emailAddresses[0]}
          </span>
        )}
        {entityNotes.length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300">
            <StickyNote size={10} />
            {entityNotes.length}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t px-4 py-3 space-y-3 text-xs">
          <dl className="space-y-0.5">
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">id</dt><dd className="font-mono text-[10px] truncate" title={entity.id}>{entity.id}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">drawer</dt><dd>{entity.drawer}</dd></div>
            {entity.emailAddresses?.length > 0 && (
              <div className="flex gap-2"><dt className="text-muted-foreground w-24">emails</dt><dd className="font-mono text-[10px]">{entity.emailAddresses.join(', ')}</dd></div>
            )}
            {entity.aliases && entity.aliases.length > 0 && (
              <div className="flex gap-2"><dt className="text-muted-foreground w-24">aliases</dt><dd>{entity.aliases.join(', ')}</dd></div>
            )}
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">first seen</dt><dd>{fmtDate(entity.firstSeen)}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">last updated</dt><dd>{fmtDate(entity.lastUpdated)}</dd></div>
            {entity.senderClass && (
              <div className="flex gap-2"><dt className="text-muted-foreground w-24">sender tier</dt><dd>{entity.senderClass}{entity.senderClassConfidence != null ? ` (${Math.round(entity.senderClassConfidence * 100)}%)` : ''}</dd></div>
            )}
          </dl>
          {entity.dossier ? (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dossier</p>
              <pre className="text-[11px] font-sans bg-background border rounded p-2 overflow-auto max-h-72 leading-relaxed whitespace-pre-wrap">
                {entity.dossier}
              </pre>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">No dossier recorded.</p>
          )}
          {entity.sourceMessageIds && entity.sourceMessageIds.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              {entity.sourceMessageIds.length} source messages
            </div>
          )}
          {entityNotes.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <StickyNote size={10} /> Notes ({entityNotes.length})
              </p>
              <div className="space-y-1.5">
                {entityNotes.map((n) => <NoteBlock key={n.id} note={n} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ThreadCard({ thread }: { thread: PersistedThread }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/30 text-left">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <MessageSquare size={12} className="text-muted-foreground" />
        <span className="font-medium text-sm truncate max-w-[320px]">{thread.title || '(untitled thread)'}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {(thread.participantEmails?.length ?? 0)} participants · {fmtIso(thread.lastSeen)}
        </span>
      </button>
      {open && (
        <div className="border-t px-4 py-3 space-y-2 text-xs">
          {thread.description && <p className="text-[12px]">{thread.description}</p>}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div><span className="text-muted-foreground">first seen:</span> {fmtIso(thread.firstSeen)}</div>
            <div><span className="text-muted-foreground">last seen:</span> {fmtIso(thread.lastSeen)}</div>
            <div><span className="text-muted-foreground">thread id:</span> <span className="font-mono">{thread.threadId}</span></div>
            <div><span className="text-muted-foreground">source msgs:</span> {thread.sourceMessageIds?.length ?? 0}</div>
          </div>
          {(thread.participantEmails?.length ?? 0) > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Participants</p>
              <div className="flex flex-wrap gap-1">
                {thread.participantEmails.map((e) => (
                  <span key={e} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">{e}</span>
                ))}
              </div>
            </div>
          )}
          {thread.triggerPhrases.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Trigger phrases</p>
              <div className="flex flex-wrap gap-1">
                {thread.triggerPhrases.map((p) => (
                  <span key={p} className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventCard({ ev }: { ev: PersistedEvent }) {
  const [open, setOpen] = useState(false);
  const [now] = useState(() => Date.now());
  const upcoming = ev.startTimeMs > now;
  return (
    <div className="border rounded-lg bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/30 text-left">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Calendar size={12} className={upcoming ? 'text-orange-500' : 'text-muted-foreground'} />
        <span className="font-medium text-sm truncate max-w-[300px]">{ev.title}</span>
        {upcoming && <span className="text-[10px] px-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">upcoming</span>}
        <span className="ml-auto text-[10px] text-muted-foreground">{fmtMsDateTime(ev.startTimeMs)}</span>
      </button>
      {open && (
        <div className="border-t px-4 py-3 space-y-2 text-xs">
          <dl className="space-y-0.5">
            {ev.startDate && <div className="flex gap-2"><dt className="text-muted-foreground w-24">start</dt><dd>{ev.startDate}</dd></div>}
            {ev.endDate && <div className="flex gap-2"><dt className="text-muted-foreground w-24">end</dt><dd>{ev.endDate}</dd></div>}
            {ev.location && <div className="flex gap-2"><dt className="text-muted-foreground w-24">location</dt><dd>{ev.location}</dd></div>}
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">eventId</dt><dd className="font-mono text-[10px]">{ev.eventId}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">source msgs</dt><dd>{ev.sourceMessageIds.length}</dd></div>
          </dl>
          {ev.description && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
              <p className="text-[12px] whitespace-pre-wrap">{ev.description}</p>
            </div>
          )}
          {ev.links && ev.links.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Links</p>
              <ul className="space-y-0.5">
                {ev.links.map((l) => (
                  <li key={l}><a href={l} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all text-[11px]">{l}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommitmentCard({ c }: { c: PersistedCommitment }) {
  const [open, setOpen] = useState(false);
  const [now] = useState(() => Date.now());
  const overdue = c.dueDateMs > 0 && c.dueDateMs < now;
  const owedByLabel = c.owedBy === 'user' ? 'you owe' : c.owedBy === 'sender' ? 'sender owes you' : 'third party';
  return (
    <div className="border rounded-lg bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/30 text-left">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <ListChecks size={12} className={overdue ? 'text-red-500' : 'text-muted-foreground'} />
        <span className="font-medium text-sm truncate max-w-[300px]">{c.title}</span>
        <span className={`text-[10px] px-1 rounded ${
          c.owedBy === 'user' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
          c.owedBy === 'sender' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
          'bg-muted text-muted-foreground'
        }`}>{owedByLabel}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{fmtMsDate(c.dueDateMs)}</span>
      </button>
      {open && (
        <div className="border-t px-4 py-3 space-y-2 text-xs">
          <dl className="space-y-0.5">
            {c.dueDate && <div className="flex gap-2"><dt className="text-muted-foreground w-24">due</dt><dd>{c.dueDate}</dd></div>}
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">owed by</dt><dd>{c.owedBy}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">commitmentId</dt><dd className="font-mono text-[10px]">{c.commitmentId}</dd></div>
            <div className="flex gap-2"><dt className="text-muted-foreground w-24">source msgs</dt><dd>{c.sourceMessageIds.length}</dd></div>
          </dl>
          {c.description && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</p>
              <p className="text-[12px] whitespace-pre-wrap">{c.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FactCard({ fact }: { fact: PersistedFact }) {
  return (
    <div className="border rounded-lg p-3 bg-card flex items-start gap-2 text-xs">
      <Sparkles size={12} className="text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-[12px]">{fact.claim}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {fact.relatedEntityLabel && (
            <span>about: <span className="font-medium text-foreground">{fact.relatedEntityLabel}</span></span>
          )}
          <span>· {fact.sourceMessageIds.length} sources</span>
          {fact.relatedEntityId && <span className="font-mono">· {fact.relatedEntityId.slice(0, 16)}…</span>}
        </div>
      </div>
    </div>
  );
}

function TopOfMindView({ tom }: { tom: TopOfMind }) {
  return (
    <div className="space-y-4">
      <div className="text-[11px] text-muted-foreground">
        Generated {fmtIso(tom.generatedAt)} · {tom.importantFacts.length} facts · {tom.upcoming.length} upcoming · {tom.openThreads.length} open threads
      </div>

      {tom.readerProfile && (tom.readerProfile.interests || tom.readerProfile.noise) && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Reader profile</p>
          <div className="border rounded-lg p-3 bg-card text-xs space-y-2">
            {tom.readerProfile.interests && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Interests</p>
                <p className="text-[12px] whitespace-pre-wrap">{tom.readerProfile.interests}</p>
              </div>
            )}
            {tom.readerProfile.noise && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Noise</p>
                <p className="text-[12px] whitespace-pre-wrap">{tom.readerProfile.noise}</p>
              </div>
            )}
            {tom.readerProfile.generatedAt && (
              <p className="text-[10px] text-muted-foreground">Generated {fmtIso(tom.readerProfile.generatedAt)}</p>
            )}
          </div>
        </div>
      )}

      {tom.upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</p>
          <div className="space-y-1.5">
            {tom.upcoming.map((u, i) => (
              <div key={`${u.label}-${i}`} className="border rounded-lg p-3 bg-card flex items-center gap-2 text-xs">
                {u.type === 'event' ? <Calendar size={12} className="text-orange-500" /> : <ListChecks size={12} className="text-rose-500" />}
                <span className="font-medium">{u.label}</span>
                <span className="text-[10px] px-1 rounded bg-muted">{u.type}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{fmtIso(u.when)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tom.openThreads.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Open threads</p>
          <div className="space-y-1.5">
            {tom.openThreads.map((t) => (
              <div key={t.threadId} className="border rounded-lg p-3 bg-card text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare size={12} className="text-muted-foreground" />
                  <span className="font-medium truncate max-w-[320px]">{t.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{fmtIso(t.lastActivity)}</span>
                </div>
                {t.summary && <p className="text-[11px] text-muted-foreground">{t.summary}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tom.importantFacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Important facts</p>
          <div className="space-y-1.5">
            {tom.importantFacts.map((f, i) => (
              <div key={i} className="border rounded-lg p-3 bg-card flex items-start gap-2 text-xs">
                <Sparkles size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px]">{f.claim}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    {f.relatedEntityLabel && (
                      <span>about: <span className="font-medium text-foreground">{f.relatedEntityLabel}</span></span>
                    )}
                    <span>{f.relatedEntityLabel ? '· ' : ''}{f.sourceMessageIds.length} sources</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function priorityTone(p: string | undefined): string {
  switch ((p ?? '').toLowerCase()) {
    case 'high': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
    case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

function isRule(v: unknown): v is ScreeningRule {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  return typeof r.priority === 'string' || typeof r.source === 'string' || typeof r.justification === 'string';
}

function RuleRow({ label, rule }: { label?: string; rule: ScreeningRule }) {
  return (
    <div className="flex items-start gap-2 text-[11px] py-1">
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${priorityTone(rule.priority)}`}>
        {rule.priority ?? '—'}
      </span>
      <div className="flex-1 min-w-0 space-y-0.5">
        {label && <div className="font-mono text-[10px] text-muted-foreground truncate" title={label}>{label}</div>}
        {rule.source && (
          <div><span className="text-muted-foreground">source:</span> <span className="font-mono">{rule.source}</span></div>
        )}
        {rule.justification && (
          <div className="text-[11px]">{rule.justification}</div>
        )}
      </div>
    </div>
  );
}

function SenderScreeningCard({ email, value }: { email: string; value: PerSenderValue }) {
  const [open, setOpen] = useState(false);

  // Three shapes:
  //  - direct rule: { priority, source, justification }
  //  - nested: { [msgIdOrEmail]: rule }
  //  - legacy row: { high?: [], medium?: [], low?: [], subjectPatterns?: [], justification? }
  const asRule = isRule(value) ? (value as ScreeningRule) : null;
  const nestedEntries: Array<[string, ScreeningRule]> = [];
  const legacy = !asRule && value && typeof value === 'object'
    ? (value as SenderScreeningRow & Record<string, unknown>)
    : null;
  if (!asRule && legacy) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (['high', 'medium', 'low', 'subjectPatterns', 'justification'].includes(k)) continue;
      if (isRule(v)) nestedEntries.push([k, v]);
    }
  }

  const topPriority = asRule?.priority
    ?? (legacy && (legacy.high?.length ? 'high' : legacy.medium?.length ? 'medium' : legacy.low?.length ? 'low' : undefined))
    ?? (nestedEntries.find(([, r]) => r.priority === 'high')?.[1].priority
        ?? nestedEntries.find(([, r]) => r.priority === 'medium')?.[1].priority
        ?? nestedEntries[0]?.[1].priority);
  const childCount = nestedEntries.length;

  return (
    <div className="border rounded-lg bg-card">
      <button onClick={() => setOpen((o) => !o)} className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/30 text-left">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityTone(topPriority)}`}>
          {topPriority ?? '—'}
        </span>
        <span className="font-mono text-xs truncate max-w-[320px]" title={email}>{email}</span>
        {childCount > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">{childCount} rules</span>
        )}
      </button>
      {open && (
        <div className="border-t px-4 py-3 space-y-2 text-xs">
          {asRule && <RuleRow rule={asRule} />}
          {legacy && (legacy.high?.length || legacy.medium?.length || legacy.low?.length || legacy.subjectPatterns?.length) ? (
            <dl className="space-y-1">
              {(['high', 'medium', 'low'] as const).map((p) =>
                legacy[p] && legacy[p]!.length > 0 ? (
                  <div key={p} className="flex gap-2">
                    <dt><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityTone(p)}`}>{p}</span></dt>
                    <dd className="flex flex-wrap gap-1">
                      {legacy[p]!.map((s) => <span key={s} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">{s}</span>)}
                    </dd>
                  </div>
                ) : null
              )}
              {legacy.subjectPatterns && legacy.subjectPatterns.length > 0 && (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">subjects</dt>
                  <dd className="flex flex-wrap gap-1">
                    {legacy.subjectPatterns.map((s) => <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{s}</span>)}
                  </dd>
                </div>
              )}
              {legacy.justification && (
                <div className="text-[11px] text-muted-foreground italic">{legacy.justification}</div>
              )}
            </dl>
          ) : null}
          {nestedEntries.length > 0 && (
            <div className="divide-y">
              {nestedEntries.map(([k, r]) => <RuleRow key={k} label={k} rule={r} />)}
            </div>
          )}
          {!asRule && nestedEntries.length === 0 && !legacy && (
            <p className="text-muted-foreground italic">No screening rule data.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ScreeningView({ screening, search }: { screening: ScreeningDoc; search: string }) {
  const senderEntries = Object.entries(screening.perSender ?? {}).filter(([email]) => {
    if (!search) return true;
    return email.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="space-y-4">
      <div className="text-[11px] text-muted-foreground">
        {Object.keys(screening.perSender ?? {}).length} senders · {(screening.denyTokens ?? []).length} deny tokens · updated {fmtDate(screening.updatedAt)}
      </div>

      {(screening.denyTokens?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Deny tokens</p>
          <div className="flex flex-wrap gap-1">
            {screening.denyTokens.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Per-sender ({senderEntries.length})</p>
        {senderEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No senders match the filter.</p>
        ) : (
          <div className="space-y-1.5">
            {senderEntries.map(([email, value]) => (
              <SenderScreeningCard key={email} email={email} value={value} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LifeGraphView({ graph }: { graph: GraphResponse }) {
  const [tab, setTab] = useState<'topOfMind' | 'entities' | 'threads' | 'events' | 'commitments' | 'facts' | 'notes' | 'screening'>(
    graph.topOfMind ? 'topOfMind' : 'entities'
  );
  const [search, setSearch] = useState('');
  const notes = graph.notes ?? [];

  const filterEntities = graph.entities.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.label.toLowerCase().includes(q) || e.emailAddresses?.some((a) => a.toLowerCase().includes(q));
  });
  const filterThreads = graph.threads.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
  });
  const filterEvents = [...graph.events]
    .sort((a, b) => a.startTimeMs - b.startTimeMs)
    .filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()));
  const filterCommitments = [...graph.commitments]
    .sort((a, b) => a.dueDateMs - b.dueDateMs)
    .filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()));
  const filterFacts = graph.facts.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.claim.toLowerCase().includes(q) || (f.relatedEntityLabel ?? '').toLowerCase().includes(q);
  });
  const filterNotes = notes.filter((n) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.markdown.toLowerCase().includes(q) ||
      (n.senderEmail ?? '').toLowerCase().includes(q) ||
      n.bucket.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        <StatCard label="Entities" value={graph.counts.entities} />
        <StatCard label="Threads" value={graph.counts.threads} />
        <StatCard label="Events" value={graph.counts.events} />
        <StatCard label="Commitments" value={graph.counts.commitments} />
        <StatCard label="Facts" value={graph.counts.facts} />
        <StatCard label="Notes" value={graph.counts.notes ?? notes.length} />
      </div>

      <input
        className="border rounded px-2 py-1 text-xs bg-background w-72"
        placeholder="Filter…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex rounded border overflow-hidden text-xs w-fit flex-wrap">
        {([
          ['topOfMind', `Top of Mind${graph.topOfMind ? '' : ' (—)'}`, !graph.topOfMind],
          ['entities', `Entities (${graph.entities.length})`, false],
          ['threads', `Threads (${graph.threads.length})`, false],
          ['events', `Events (${graph.events.length})`, false],
          ['commitments', `Commitments (${graph.commitments.length})`, false],
          ['facts', `Facts (${graph.facts.length})`, false],
          ['notes', `Notes (${notes.length})`, notes.length === 0],
          ['screening', `Screening (${Object.keys(graph.screening?.perSender ?? {}).length})`, !graph.screening],
        ] as const).map(([key, label, disabled]) => (
          <button
            key={key}
            disabled={disabled}
            className={`px-2 py-1 ${tab === key ? 'bg-muted font-medium' : 'hover:bg-muted/50'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            onClick={() => setTab(key as typeof tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'topOfMind' && (
        graph.topOfMind
          ? <TopOfMindView tom={graph.topOfMind} />
          : <p className="text-sm text-muted-foreground text-center py-8">Top of Mind not yet generated. Run a full backfill to populate it.</p>
      )}

      {tab === 'entities' && (
        <div className="space-y-1.5">
          {filterEntities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No entities match the filter.</p>
          ) : filterEntities.map((e, idx) => <EntityCard key={`${e.id ?? 'no-id'}-${idx}`} entity={e} notes={notes} />)}
        </div>
      )}

      {tab === 'threads' && (
        <div className="space-y-1.5">
          {filterThreads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No threads.</p>
          ) : filterThreads.map((t) => <ThreadCard key={t.threadId} thread={t} />)}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-1.5">
          {filterEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No events.</p>
          ) : filterEvents.map((e) => <EventCard key={e.eventId} ev={e} />)}
        </div>
      )}

      {tab === 'commitments' && (
        <div className="space-y-1.5">
          {filterCommitments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No commitments.</p>
          ) : filterCommitments.map((c) => <CommitmentCard key={c.commitmentId} c={c} />)}
        </div>
      )}

      {tab === 'facts' && (
        <div className="space-y-1.5">
          {filterFacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No facts.</p>
          ) : filterFacts.map((f) => <FactCard key={f.factId} fact={f} />)}
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-1.5">
          {filterNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notes.</p>
          ) : filterNotes.map((n) => <NoteBlock key={n.id} note={n} />)}
        </div>
      )}

      {tab === 'screening' && (
        graph.screening
          ? <ScreeningView screening={graph.screening} search={search} />
          : <p className="text-sm text-muted-foreground text-center py-8">No screening doc available.</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PHASE_LABELS = ['phase 0 corpus', 'phase 1 segmentation', 'phase 2 extraction', 'phase 3 consolidation', 'phase 4 top-of-mind'];

export default function LifeGraphDevPage() {
  const { token } = useAuth();

  const [accountId, setAccountId] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [whoamiLoading, setWhoamiLoading] = useState(false);

  const [backfillStartResult, setBackfillStartResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [backfillRunResult, setBackfillRunResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [currentJobId, setCurrentJobId] = useState('');
  const [profileUid, setProfileUid] = useState<string | null>(null);
  const [jobStatusResult, setJobStatusResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Candidate review + v2 extraction progress
  const [candidates, setCandidates] = useState<SenderRecord[]>([]);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [bucketCounts, setBucketCounts] = useState<Record<SenderBucket, number> | null>(null);
  const [hitlLoading, setHitlLoading] = useState(false);
  const [v2Processed, setV2Processed] = useState<V2SenderProgress[]>([]);
  const [v2Self, setV2Self] = useState<SelfIdentity | null>(null);
  const [approvedCount, setApprovedCount] = useState(0);

  // Graph view
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }),
    [token]
  );

  const callApi = useCallback(
    async (method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown) => {
      const start = Date.now();
      const res = await fetch(path, {
        method,
        headers: authHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      return { data, durationMs: Date.now() - start };
    },
    [authHeaders]
  );

  const run = useCallback(
    async (setter: (r: ApiResult) => void, fn: () => Promise<{ data: unknown; durationMs: number }>) => {
      setter({ status: 'loading', data: null });
      try {
        const { data, durationMs } = await fn();
        const hasError = data && typeof data === 'object' && 'error' in (data as object);
        setter({
          status: hasError ? 'error' : 'success',
          data,
          error: hasError ? String((data as Record<string, unknown>).error) : undefined,
          durationMs,
        });
        return data;
      } catch (err) {
        setter({ status: 'error', data: null, error: String(err) });
        return null;
      }
    },
    []
  );

  const stopPolling = useCallback(() => {
    setPolling(false);
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  const fetchJobStatus = useCallback(
    async (jobId: string, acctId: string) => {
      const result = await run(setJobStatusResult, () =>
        callApi('GET', `/api/life-graph/backfill/status/${jobId}?accountId=${encodeURIComponent(acctId)}`)
      );
      const status = result as JobStatus | null;
      if (!status) return null;

      if (status.v2ProcessedSenders && status.v2ProcessedSenders.length > 0) {
        setV2Processed(status.v2ProcessedSenders);
      }
      if (status.v2Self) setV2Self(status.v2Self);
      if (status.v2UserType && !userType) setUserType(status.v2UserType);
      if (status.v2BucketCounts && !bucketCounts) setBucketCounts(status.v2BucketCounts);
      if (status.approvedCandidateEmails && approvedCount === 0) {
        setApprovedCount(status.approvedCandidateEmails.length);
      }
      if (['completed', 'failed', 'capped'].includes(status.status)) {
        stopPolling();
      }
      return status;
    },
    [run, callApi, stopPolling, userType, bucketCounts, approvedCount]
  );

  const startPolling = useCallback(
    (jobId: string, acctId: string) => {
      setPolling(true);
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => fetchJobStatus(jobId, acctId), 5000);
    },
    [fetchJobStatus]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Cut-over hygiene: any locally-cached jobId from v1 is meaningless under v2.
  // We don't persist jobId across sessions today, so this is a no-op; leaving a
  // hook here in case localStorage caching is added later.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem('life-graph:v1:jobId');
    } catch {}
  }, []);

  useEffect(() => {
    if (!token || accountId) return;
    setWhoamiLoading(true);
    fetch('/api/life-graph/whoami', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.accountId) { setAccountId(d.accountId); setAccountEmail(d.email ?? ''); }
      })
      .catch(() => {})
      .finally(() => setWhoamiLoading(false));
  }, [token, accountId]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Not authenticated.</p>
          <Link href="/login"><Button size="sm">Go to login</Button></Link>
        </div>
      </div>
    );
  }

  async function startBackfill() {
    // Reset all v2 state from any previous run.
    setBackfillRunResult({ status: 'idle', data: null });
    setCandidates([]);
    setUserType(null);
    setBucketCounts(null);
    setV2Processed([]);
    setV2Self(null);
    setApprovedCount(0);

    const result = await run(setBackfillStartResult, () =>
      callApi('POST', '/api/life-graph/backfill/start', { accountId })
    );
    if (!result || typeof result !== 'object' || !('jobId' in (result as object))) return;
    const resp = result as BackfillStartResponse;

    setCurrentJobId(resp.jobId);
    if (resp.uid) setProfileUid(resp.uid);
    setCandidates(resp.candidates ?? []);
    setUserType(resp.userType ?? null);
    setBucketCounts(resp.bucketCounts ?? null);
  }

  // Auto-run: single call that runs phase 0 + 1, auto-accepts all top
  // candidates ("select all"), and kicks off phase 2→3→4 in the background.
  // No approval UI — read jobId from the 202 and poll status immediately.
  async function runAutoBackfill() {
    // Reset all v2 state from any previous run.
    setBackfillStartResult({ status: 'idle', data: null });
    setCandidates([]);
    setUserType(null);
    setBucketCounts(null);
    setV2Processed([]);
    setV2Self(null);
    setApprovedCount(0);

    const result = await run(setBackfillRunResult, () =>
      callApi('POST', '/api/life-graph/backfill/run', { accountId })
    );
    if (!result || typeof result !== 'object' || !('jobId' in (result as object))) return;
    const resp = result as BackfillRunResponse;

    setCurrentJobId(resp.jobId);
    setApprovedCount(resp.accepted ?? 0);
    startPolling(resp.jobId, accountId);
  }

  async function runDeepExtraction(approvedEmails: string[]) {
    setHitlLoading(true);
    setApprovedCount(approvedEmails.length);
    try {
      await fetch('/api/life-graph/backfill/runDeepExtraction', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId, jobId: currentJobId, approvedEmails }),
      });
      setCandidates([]);
      startPolling(currentJobId, accountId);
    } finally {
      setHitlLoading(false);
    }
  }

  async function loadGraph() {
    setGraphLoading(true);
    try {
      const res = await fetch(
        `/api/life-graph/graph?accountId=${encodeURIComponent(accountId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = (await res.json()) as GraphResponse;
      setGraph(data);
    } finally {
      setGraphLoading(false);
    }
  }

  async function deleteGraph() {
    setDeleteLoading(true);
    try {
      await fetch('/api/life-graph/delete', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId }),
      });
      setCurrentJobId('');
      setJobStatusResult({ status: 'idle', data: null });
      setBackfillStartResult({ status: 'idle', data: null });
      setBackfillRunResult({ status: 'idle', data: null });
      setProfileUid(null);
      setCandidates([]);
      setUserType(null);
      setBucketCounts(null);
      setV2Processed([]);
      setV2Self(null);
      setApprovedCount(0);
      setGraph(null);
      setDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  const jobStatus = jobStatusResult.data as JobStatus | null;

  const jobStatusColor = (s: string) =>
    s === 'completed' ? 'text-green-600'
    : s === 'failed' ? 'text-red-600'
    : s === 'capped' ? 'text-yellow-600'
    : 'text-blue-600';

  const phaseProgressPct = jobStatus
    ? Math.min(1, jobStatus.phase / 4)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <Link href="/mail" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-semibold flex items-center gap-2">
            <Database size={16} /> Life Graph Dev Console
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">v2 — backed by yai-node-server /yai/life-graph-agent</p>
        </div>
        {profileUid && (
          <div className="ml-auto">
            <Badge variant="outline" className="font-mono text-xs">uid: {profileUid}</Badge>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        <div className="border rounded-lg p-4 bg-card space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Account ID</label>
            {whoamiLoading && <Loader2 size={13} className="animate-spin text-muted-foreground" />}
            {accountEmail && <span className="text-xs text-muted-foreground">{accountEmail}</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            Auto-filled from your session. Used as part of the user namespace (<code>guid_accountId</code>).
          </p>
          <input
            className="w-full border rounded px-3 py-2 text-sm font-mono bg-background"
            placeholder="e.g. 180001"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value.trim())}
          />
        </div>

        <Tabs defaultValue="pipeline">
          <TabsList className="mb-4">
            <TabsTrigger value="pipeline"><Zap size={13} className="mr-1.5" />Pipeline</TabsTrigger>
            <TabsTrigger value="graph"><Network size={13} className="mr-1.5" />Life Graph</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-4">

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Step 1 — Auto-run (one call)</p>
            <ApiCard
              title="POST /api/life-graph/backfill/run"
              description="Single-call backfill: runs phase 0 + 1, auto-accepts all top candidates (&quot;select all&quot;), and kicks off phase 2→3→4 in the background. Returns 202 with { jobId, accepted }. No approval UI — polling starts immediately."
              result={backfillRunResult}
              onRun={runAutoBackfill}
              disabled={!accountId}
            >
              {!accountId && <p className="text-xs text-muted-foreground">Enter Account ID above first.</p>}
              {backfillRunResult.status === 'success' && (
                <p className="text-xs text-muted-foreground">
                  Auto-accepted{' '}
                  <span className="text-foreground font-medium">
                    {(backfillRunResult.data as BackfillRunResponse | null)?.accepted ?? 0}
                  </span>{' '}
                  senders into extraction. Monitor progress below.
                </p>
              )}
            </ApiCard>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">or pick senders manually</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Step 1 — Start Backfill (manual approval)</p>
            <ApiCard
              title="POST /api/life-graph/backfill/start"
              description="Runs phase 0 (Yahoo corpus) + phase 1 (segmentation) synchronously. No LLM calls in this step — returns in seconds. Response includes SenderRecord[] candidates, userType, and bucketCounts."
              result={backfillStartResult}
              onRun={startBackfill}
              disabled={!accountId}
            >
              {!accountId && <p className="text-xs text-muted-foreground">Enter Account ID above first.</p>}
            </ApiCard>

            {currentJobId && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">Step 2 — Monitor</p>
                <div className="border rounded-lg p-4 space-y-3 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">
                          GET /api/life-graph/backfill/status/{currentJobId.slice(0, 8)}…
                        </span>
                        <StatusBadge status={jobStatusResult.status} />
                        {polling && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            <Loader2 size={10} className="animate-spin mr-1" />polling 5s
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{currentJobId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => fetchJobStatus(currentJobId, accountId)} disabled={jobStatusResult.status === 'loading'}>
                        <RefreshCw size={13} className={jobStatusResult.status === 'loading' ? 'animate-spin' : ''} />
                      </Button>
                      {polling ? (
                        <Button size="sm" variant="destructive" onClick={stopPolling}>Stop</Button>
                      ) : (
                        <Button size="sm" onClick={() => startPolling(currentJobId, accountId)}>
                          <Play size={13} className="mr-1" />Poll
                        </Button>
                      )}
                    </div>
                  </div>

                  {jobStatus && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {PHASE_LABELS[jobStatus.phase] ?? `phase ${jobStatus.phase}`}
                        </span>
                        <span className={jobStatusColor(jobStatus.status)}>{jobStatus.status}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            jobStatus.status === 'completed' ? 'bg-green-500'
                            : jobStatus.status === 'failed' ? 'bg-red-500'
                            : jobStatus.status === 'capped' ? 'bg-yellow-500'
                            : 'bg-blue-500'
                          }`}
                          style={{ width: `${phaseProgressPct * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        {PHASE_LABELS.map((label, i) => (
                          <span key={i} className={jobStatus.phase >= i ? 'text-foreground font-medium' : ''}>{label.replace(/^phase \d+ /, '')}</span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground pt-1 border-t">
                        <span>Cost: <span className="text-foreground">${jobStatus.costSpent.toFixed(4)}</span></span>
                        <span>Errors: <span className={jobStatus.errorCount > 0 ? 'text-red-500' : 'text-foreground'}>{jobStatus.errorCount}</span></span>
                        <span>Yahoo calls: <span className="text-foreground">{jobStatus.callCount ?? 0}</span>
                          {(jobStatus.callCount ?? 0) > (jobStatus.calls?.length ?? 0) && (
                            <span className="text-muted-foreground"> (showing first {jobStatus.calls?.length})</span>
                          )}
                        </span>
                      </div>

                      {(jobStatus.calls?.length ?? 0) > 0 && (
                        <CallLogTable calls={jobStatus.calls!} total={jobStatus.callCount ?? jobStatus.calls!.length} />
                      )}
                    </div>
                  )}
                </div>

                {candidates.length > 0 && (
                  <CandidatesReview
                    candidates={candidates}
                    userType={userType}
                    bucketCounts={bucketCounts}
                    onApprove={runDeepExtraction}
                    loading={hitlLoading}
                  />
                )}

                {v2Processed.length > 0 && (
                  <V2ProgressLog
                    processed={v2Processed}
                    approvedCount={approvedCount || v2Processed.length}
                    v2Self={v2Self}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="graph" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Life Graph</p>
              <Button size="sm" variant="outline" onClick={loadGraph} disabled={!accountId || graphLoading}>
                {graphLoading ? <Loader2 size={13} className="animate-spin mr-1" /> : <RefreshCw size={13} className="mr-1" />}
                Load
              </Button>
            </div>

            {!graph && !graphLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">No graph loaded. Click Load to fetch from the server.</p>
            )}

            {graph && <LifeGraphView graph={graph} />}

            <div className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-950/20 space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">Danger Zone</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently deletes everything for this account — entities, threads, events, commitments, facts, raw info, screening, top-of-mind, owner info, ingest jobs, and the profile doc.
              </p>
              {!deleteConfirm ? (
                <Button size="sm" variant="destructive" onClick={() => setDeleteConfirm(true)} disabled={!accountId}>
                  <Trash2 size={13} className="mr-1" />Delete Life Graph
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">Are you sure? This cannot be undone.</span>
                  <Button size="sm" variant="destructive" onClick={deleteGraph} disabled={deleteLoading}>
                    {deleteLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                    Yes, delete everything
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center pb-4">
          Logs stream to the Next.js server console · Auth token from session
        </p>
      </div>
    </div>
  );
}
