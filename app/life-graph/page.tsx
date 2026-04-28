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
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface JobStatus {
  phase: number;
  status: string;
  costSpent: number;
  errorCount: number;
  calls?: JobCall[];
  callCount?: number;
}

interface CandidateSignals {
  sentTo: boolean;
  starCount: number;
  threadCount: number;
  openWithDwellCount: number;
}

interface Candidate {
  email: string;
  name: string;
  score: number;
  signals?: CandidateSignals;
}

interface Entity {
  id: string;
  type: string;
  label: string;
  emailAddresses: string[];
  relationshipClass?: string;
  drawer: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
                <td className="px-2 py-0.5 truncate max-w-0 w-full" title={c.url}>{c.url}</td>
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

// ─── HITL: Phase 0 candidates review ──────────────────────────────────────────

function SignalPips({ signals }: { signals?: CandidateSignals }) {
  if (!signals) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {signals.sentTo && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" title="You've sent email to this person">↩ sent</span>
      )}
      {signals.starCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" title="Starred emails">★ {signals.starCount}</span>
      )}
      {signals.threadCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" title="Back-and-forth thread">⇄ {signals.threadCount}</span>
      )}
      {signals.openWithDwellCount > 0 && (
        <span className="px-1 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" title="Read emails">✓ {signals.openWithDwellCount}</span>
      )}
    </div>
  );
}

function CandidatesReview({
  candidates,
  onApprove,
  loading,
}: {
  candidates: Candidate[];
  onApprove: (approved: string[]) => void;
  loading: boolean;
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(candidates.map((c) => c.email)));

  const toggle = (email: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-amber-50 dark:bg-amber-950/20 border-amber-300">
      <div className="flex items-center gap-2">
        <UserCheck size={16} className="text-amber-600" />
        <span className="font-medium text-sm">Review Important Senders — Phase 0 complete</span>
        <Badge className="bg-amber-500 text-white">{checked.size} / {candidates.length} selected</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Senders ranked by engagement signals from your account. Uncheck anyone to exclude from deep extraction. Phase 1 will classify and profile the selected senders.
      </p>

      <div className="max-h-80 overflow-y-auto rounded border bg-background">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr className="border-b">
              <th className="px-2 py-1 w-8"></th>
              <th className="px-2 py-1 text-left">Email / Name</th>
              <th className="px-2 py-1 text-left">Signals</th>
              <th className="px-2 py-1 text-right w-14">Score</th>
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
                <td className="px-2 py-1.5">
                  <div className="font-mono truncate max-w-[220px]" title={c.email}>{c.email}</div>
                  {c.name && <div className="text-muted-foreground text-[10px] truncate max-w-[220px]">{c.name}</div>}
                </td>
                <td className="px-2 py-1.5">
                  <SignalPips signals={c.signals} />
                </td>
                <td className="px-2 py-1.5 text-right font-semibold tabular-nums">{c.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button className="text-xs text-blue-600 hover:underline" onClick={() => setChecked(new Set(candidates.map((c) => c.email)))}>Select all</button>
          <button className="text-xs text-muted-foreground hover:underline" onClick={() => setChecked(new Set())}>Deselect all</button>
        </div>
        <Button size="sm" onClick={() => onApprove(Array.from(checked))} disabled={loading || checked.size === 0}>
          {loading ? <Loader2 size={13} className="animate-spin mr-1" /> : <CheckCircle size={13} className="mr-1" />}
          Continue to Phase 1 ({checked.size} senders)
        </Button>
      </div>
    </div>
  );
}

// ─── HITL: Phase 1 entities review ───────────────────────────────────────────

function EntitiesReview({
  entities,
  onApprove,
  onDelete,
  loading,
}: {
  entities: Entity[];
  onApprove: () => void;
  onDelete: (entityId: string) => void;
  loading: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20 border-blue-300">
      <div className="flex items-center gap-2">
        <Network size={16} className="text-blue-600" />
        <span className="font-medium text-sm">Review Classified Entities — Phase 1 complete</span>
        <Badge className="bg-blue-500 text-white">{entities.length} entities</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        These entities were classified by Gemini. Remove any that were misclassified or that you don't want in your Life Graph. Remaining entities will go through deep extraction (Phases 2–4).
      </p>

      <div className="max-h-64 overflow-y-auto rounded border bg-background">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr className="border-b">
              <th className="px-2 py-1 text-left">Label</th>
              <th className="px-2 py-1 text-left">Type</th>
              <th className="px-2 py-1 text-left">Email</th>
              <th className="px-2 py-1 text-left">Class</th>
              <th className="px-2 py-1 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-b border-muted last:border-0">
                <td className="px-2 py-1 font-medium">{e.label}</td>
                <td className="px-2 py-1 text-muted-foreground">{e.type}</td>
                <td className="px-2 py-1 font-mono text-xs">{e.emailAddresses[0] ?? '—'}</td>
                <td className="px-2 py-1">{e.relationshipClass ?? '—'}</td>
                <td className="px-2 py-1 text-center">
                  <button onClick={() => onDelete(e.id)} className="text-red-500 hover:text-red-700" title="Remove entity">
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={onApprove} disabled={loading || entities.length === 0}>
          {loading ? <Loader2 size={13} className="animate-spin mr-1" /> : <Zap size={13} className="mr-1" />}
          Run Deep Extraction (Phases 2–4)
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LifeGraphDevPage() {
  const { token } = useAuth();

  const [accountId, setAccountId] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [whoamiLoading, setWhoamiLoading] = useState(false);

  const [profileResult, setProfileResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [profileUid, setProfileUid] = useState<string | null>(null);

  const [backfillStartResult, setBackfillStartResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [currentJobId, setCurrentJobId] = useState('');
  const [jobStatusResult, setJobStatusResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // HITL state
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hitlEntities, setHitlEntities] = useState<Entity[]>([]);
  const [hitlLoading, setHitlLoading] = useState(false);

  // Graph view
  const [graphEntities, setGraphEntities] = useState<Entity[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);

  // Ingest
  const [messageId, setMessageId] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [subject, setSubject] = useState('');
  const [ingestResult, setIngestResult] = useState<ApiResult>({ status: 'idle', data: null });
  const [boostMessageId, setBoostMessageId] = useState('');
  const [boostResult, setBoostResult] = useState<ApiResult>({ status: 'idle', data: null });

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // ── Core helpers ──────────────────────────────────────────────────────────

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
      if (status?.status === 'awaiting_approval') {
        stopPolling();
        if (status.phase === 1) {
          // Phase 0 done — show candidates
          const resp = result as unknown as { candidates?: Candidate[] };
          if (resp.candidates) setCandidates(resp.candidates);
        }
        if (status.phase === 2) {
          // Phase 1 done — fetch entities for review
          fetchGraphEntitiesForHitl(acctId);
        }
      }
      if (status && ['completed', 'failed', 'capped'].includes(status.status)) {
        stopPolling();
      }
      return status;
    },
    [run, callApi, stopPolling]
  );

  async function fetchGraphEntitiesForHitl(acctId: string) {
    try {
      const res = await fetch(
        `/api/life-graph/graph?accountId=${encodeURIComponent(acctId)}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      setHitlEntities((data.entities ?? []) as Entity[]);
    } catch { /* ignore */ }
  }

  const startPolling = useCallback(
    (jobId: string, acctId: string) => {
      setPolling(true);
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => fetchJobStatus(jobId, acctId), 5000);
    },
    [fetchJobStatus]
  );

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Auto-fill accountId via whoami
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

  // ── Auth guard ────────────────────────────────────────────────────────────

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

  // ── Action handlers ───────────────────────────────────────────────────────

  async function initProfile() {
    const result = await run(setProfileResult, () =>
      callApi('POST', '/api/life-graph/profile/init', { accountId })
    );
    if (result && typeof result === 'object' && 'uid' in (result as object)) {
      setProfileUid((result as Record<string, string>).uid);
    }
  }

  async function startBackfill() {
    const result = await run(setBackfillStartResult, () =>
      callApi('POST', '/api/life-graph/backfill/start', { accountId })
    );
    if (result && typeof result === 'object' && 'jobId' in (result as object)) {
      const jobId = (result as Record<string, string>).jobId;
      setCurrentJobId(jobId);
      setCandidates([]);
      setHitlEntities([]);
      startPolling(jobId, accountId);
      // Kick off the pipeline — browser fires this, server runs all phases regardless of connection
      fetch('/api/life-graph/backfill/run', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId, jobId }),
      }).catch((err) => console.warn('[backfill/run] fetch error:', err));
    }
  }

  async function approvePhase0(approvedEmails: string[]) {
    setHitlLoading(true);
    try {
      await fetch('/api/life-graph/backfill/approve', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId, jobId: currentJobId, approvedEmails }),
      });
      setCandidates([]);
      // Kick off phase 1
      fetch('/api/life-graph/backfill/run', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId, jobId: currentJobId }),
      }).catch(() => {});
      startPolling(currentJobId, accountId);
    } finally {
      setHitlLoading(false);
    }
  }

  async function approvePhase1() {
    setHitlLoading(true);
    try {
      await fetch('/api/life-graph/backfill/approve', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId, jobId: currentJobId }),
      });
      setHitlEntities([]);
      // Kick off phases 2-4
      fetch('/api/life-graph/backfill/run', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ accountId, jobId: currentJobId }),
      }).catch(() => {});
      startPolling(currentJobId, accountId);
    } finally {
      setHitlLoading(false);
    }
  }

  async function deleteHitlEntity(entityId: string) {
    await fetch(`/api/life-graph/entity/${entityId}?accountId=${encodeURIComponent(accountId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setHitlEntities((prev) => prev.filter((e) => e.id !== entityId));
  }

  async function loadGraph() {
    setGraphLoading(true);
    try {
      const res = await fetch(
        `/api/life-graph/graph?accountId=${encodeURIComponent(accountId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setGraphEntities((data.entities ?? []) as Entity[]);
    } finally {
      setGraphLoading(false);
    }
  }

  async function deleteGraph() {
    setDeleteLoading(true);
    try {
      await fetch(`/api/life-graph/delete?accountId=${encodeURIComponent(accountId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentJobId('');
      setJobStatusResult({ status: 'idle', data: null });
      setBackfillStartResult({ status: 'idle', data: null });
      setProfileResult({ status: 'idle', data: null });
      setProfileUid(null);
      setCandidates([]);
      setHitlEntities([]);
      setGraphEntities([]);
      setDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function ingestMessage() {
    await run(setIngestResult, () =>
      callApi('POST', '/api/life-graph/ingest/message', {
        accountId, messageId, conversationId: messageId,
        deliveryTime: new Date().toISOString(),
        from: { name: fromName, email: fromEmail },
        subject, snippet: '', isRead: false, isStarred: false,
      })
    );
  }

  async function retroBoost() {
    await run(setBoostResult, () =>
      callApi('POST', '/api/life-graph/ingest/message', {
        accountId, trigger: 'retroactive', messageId: boostMessageId,
        from: { name: '', email: '' }, subject: '',
        deliveryTime: new Date().toISOString(), conversationId: boostMessageId,
      })
    );
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const jobStatus = jobStatusResult.data as JobStatus | null;

  const phaseLabel = (p: number) => ['structural', 'sender profiling', 'deep extract', 'thread sweep', 'top-of-mind'][p] ?? '';

  const jobStatusColor = (s: string) =>
    s === 'completed' ? 'text-green-600'
    : s === 'failed' ? 'text-red-600'
    : s === 'capped' ? 'text-yellow-600'
    : s === 'awaiting_approval' ? 'text-amber-600'
    : 'text-blue-600';

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <Link href="/mail" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-semibold flex items-center gap-2">
            <Database size={16} /> Life Graph Dev Console
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Test the Life Graph ingestion pipeline</p>
        </div>
        {profileUid && (
          <div className="ml-auto">
            <Badge variant="outline" className="font-mono text-xs">uid: {profileUid}</Badge>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Account ID — auto-filled */}
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
            <TabsTrigger value="ingest"><Terminal size={13} className="mr-1.5" />Ongoing Ingest</TabsTrigger>
          </TabsList>

          {/* ── Pipeline tab ─────────────────────────────────────────────── */}
          <TabsContent value="pipeline" className="space-y-4">

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Step 1 — Profile</p>
            <ApiCard
              title="POST /api/life-graph/profile/init"
              description="Create or verify the user's Life Graph profile doc in Firestore."
              result={profileResult}
              onRun={initProfile}
              disabled={!accountId}
            >
              {!accountId && <p className="text-xs text-muted-foreground">Enter Account ID above first.</p>}
            </ApiCard>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">Step 2 — Cold-Start Backfill</p>
            <ApiCard
              title="POST /api/life-graph/backfill/start"
              description="Create the backfill job and start the pipeline. Phase 0 (structural scoring) runs first, then you'll review results before each subsequent phase."
              result={backfillStartResult}
              onRun={startBackfill}
              disabled={!accountId || profileResult.status !== 'success'}
            >
              {accountId && profileResult.status !== 'success' && (
                <p className="text-xs text-muted-foreground">Initialize profile first.</p>
              )}
            </ApiCard>

            {/* Job monitor */}
            {currentJobId && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">Step 3 — Monitor</p>
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
                          Phase {jobStatus.phase} — {phaseLabel(jobStatus.phase)}
                        </span>
                        <span className={jobStatusColor(jobStatus.status)}>{jobStatus.status}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            jobStatus.status === 'completed' ? 'bg-green-500'
                            : jobStatus.status === 'failed' ? 'bg-red-500'
                            : jobStatus.status === 'capped' ? 'bg-yellow-500'
                            : jobStatus.status === 'awaiting_approval' ? 'bg-amber-500'
                            : 'bg-blue-500'
                          }`}
                          style={{ width: `${(jobStatus.phase / 4) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        {['structural', 'sender profiling', 'deep extract', 'thread sweep', 'top-of-mind'].map((label, i) => (
                          <span key={i} className={jobStatus.phase >= i ? 'text-foreground font-medium' : ''}>{label}</span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground pt-1 border-t">
                        <span>Cost: <span className="text-foreground">${jobStatus.costSpent.toFixed(4)}</span></span>
                        <span>Errors: <span className={jobStatus.errorCount > 0 ? 'text-red-500' : 'text-foreground'}>{jobStatus.errorCount}</span></span>
                        <span>API calls: <span className="text-foreground">{jobStatus.callCount ?? 0}</span>
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

                {/* Phase 0 HITL — candidates review */}
                {candidates.length > 0 && (
                  <CandidatesReview
                    candidates={candidates}
                    onApprove={approvePhase0}
                    loading={hitlLoading}
                  />
                )}

                {/* Phase 1 HITL — entities review */}
                {hitlEntities.length > 0 && (
                  <EntitiesReview
                    entities={hitlEntities}
                    onApprove={approvePhase1}
                    onDelete={deleteHitlEntity}
                    loading={hitlLoading}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* ── Life Graph tab ────────────────────────────────────────────── */}
          <TabsContent value="graph" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entities in Life Graph</p>
              <Button size="sm" variant="outline" onClick={loadGraph} disabled={!accountId || graphLoading}>
                {graphLoading ? <Loader2 size={13} className="animate-spin mr-1" /> : <RefreshCw size={13} className="mr-1" />}
                Load
              </Button>
            </div>

            {graphEntities.length === 0 && !graphLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">No entities loaded. Click Load to fetch from Firestore.</p>
            )}

            {graphEntities.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-muted text-xs text-muted-foreground flex justify-between">
                  <span>{graphEntities.length} entities</span>
                  <span>Type · Email · Class</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted border-b">
                      <tr>
                        <th className="px-3 py-2 text-left">Label</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      {graphEntities.map((e) => (
                        <tr key={e.id} className="border-b border-muted last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{e.label}</td>
                          <td className="px-3 py-2 text-muted-foreground">{e.type}</td>
                          <td className="px-3 py-2 font-mono">{e.emailAddresses[0] ?? '—'}</td>
                          <td className="px-3 py-2">{e.relationshipClass ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-950/20 space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">Danger Zone</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently deletes all Life Graph data for this account — profile, entities, facts, notes, and all ingest jobs.
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

          {/* ── Ongoing Ingest tab ─────────────────────────────────────────── */}
          <TabsContent value="ingest" className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingest a Message</p>
            <div className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">POST /api/life-graph/ingest/message</span>
                    <StatusBadge status={ingestResult.status} />
                    {ingestResult.durationMs !== undefined && ingestResult.status !== 'loading' && (
                      <span className="text-xs text-muted-foreground">{ingestResult.durationMs}ms</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Classify sender, gate, run Stage A + B.</p>
                </div>
                <Button size="sm" onClick={ingestMessage} disabled={!messageId || !fromEmail || !subject || ingestResult.status === 'loading'}>
                  {ingestResult.status === 'loading' ? <Loader2 size={14} className="animate-spin mr-1" /> : <Play size={14} className="mr-1" />}Run
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Message ID', value: messageId, set: setMessageId, placeholder: 'msg_abc123', mono: true },
                  { label: 'Subject', value: subject, set: setSubject, placeholder: 'Meeting tomorrow at 10am' },
                  { label: 'From email', value: fromEmail, set: setFromEmail, placeholder: 'alice@example.com' },
                  { label: 'From name', value: fromName, set: setFromName, placeholder: 'Alice Smith' },
                ].map(({ label, value, set, placeholder, mono }) => (
                  <div key={label}>
                    <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                    <input className={`w-full border rounded px-2 py-1.5 text-xs bg-background ${mono ? 'font-mono' : ''}`} placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} />
                  </div>
                ))}
              </div>
              {ingestResult.status === 'error' && <div className="flex items-start gap-2 text-red-600 text-xs"><XCircle size={14} className="mt-0.5 shrink-0" />{ingestResult.error}</div>}
              {ingestResult.status === 'success' && <div className="flex items-center gap-2 text-green-600 text-xs"><CheckCircle size={14} />Request completed successfully</div>}
              <JsonBlock data={ingestResult.data} />
            </div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">Retroactive Boost</p>
            <div className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">POST /api/life-graph/ingest/message</span>
                    <Badge variant="outline" className="text-xs">trigger: retroactive</Badge>
                    <StatusBadge status={boostResult.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">Re-process a previously skipped email.</p>
                </div>
                <Button size="sm" onClick={retroBoost} disabled={!boostMessageId || boostResult.status === 'loading'}>
                  {boostResult.status === 'loading' ? <Loader2 size={14} className="animate-spin mr-1" /> : <Play size={14} className="mr-1" />}Run
                </Button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Message ID to boost</label>
                <input className="w-full border rounded px-2 py-1.5 text-xs font-mono bg-background" placeholder="msg_abc123" value={boostMessageId} onChange={(e) => setBoostMessageId(e.target.value)} />
              </div>
              {boostResult.status === 'error' && <div className="flex items-start gap-2 text-red-600 text-xs"><XCircle size={14} className="mt-0.5 shrink-0" />{boostResult.error}</div>}
              {boostResult.status === 'success' && <div className="flex items-center gap-2 text-green-600 text-xs"><CheckCircle size={14} />Boost complete</div>}
              <JsonBlock data={boostResult.data} />
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
