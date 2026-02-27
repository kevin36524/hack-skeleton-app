'use client';

import { useState, useEffect } from 'react';
import { useAuth, refreshTokenStandalone } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Newspaper,
  Loader2,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const DIGEST_STORAGE_KEY = 'user_gmail_digest';
const PROFILE_STORAGE_KEY = 'user_gmail_profile';

interface DigestResult {
  summary: string;
  emailCount: number;
  generatedAt: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface GenerationStep {
  id: string;
  label: string;
  status: StepStatus;
  input?: unknown;
  output?: unknown;
}

const INITIAL_STEPS: GenerationStep[] = [
  { id: 'fetch-inbox-messages', label: 'Fetching inbox from last 24 hours', status: 'pending' },
  { id: 'fetch-message-metadata', label: 'Loading email details', status: 'pending' },
  { id: 'generate-summary', label: 'Generating your digest', status: 'pending' },
];

// ── Inline markdown renderer ───────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900 dark:text-gray-100">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      parts.push(<em key={match.index}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      parts.push(
        <code
          key={match.index}
          className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono"
        >
          {match[3]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;
  const nextKey = () => String(keyCounter++);

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={nextKey()} className="text-2xl font-bold mt-8 mb-3 text-gray-900 dark:text-gray-100">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={nextKey()}
          className="text-xl font-semibold mt-6 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        >
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={nextKey()} className="text-base font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={nextKey()} className="text-sm font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">
          {renderInline(trimmed.slice(5))}
        </h4>
      );
      i++;
    } else if (/^[-*]{3,}$/.test(trimmed)) {
      elements.push(<hr key={nextKey()} className="my-5 border-gray-200 dark:border-gray-700" />);
      i++;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        const itemText = lines[i].trim().slice(2);
        items.push(
          <li key={i} className="mb-1 leading-relaxed">
            {renderInline(itemText)}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={nextKey()} className="list-disc ml-5 my-2 space-y-0.5 text-gray-700 dark:text-gray-300">
          {items}
        </ul>
      );
    } else if (/^\d+\. /.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\. /, '');
        items.push(
          <li key={i} className="mb-1 leading-relaxed">
            {renderInline(itemText)}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={nextKey()} className="list-decimal ml-5 my-2 space-y-0.5 text-gray-700 dark:text-gray-300">
          {items}
        </ol>
      );
    } else if (trimmed === '') {
      elements.push(<div key={nextKey()} className="h-1" />);
      i++;
    } else {
      elements.push(
        <p key={nextKey()} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2 text-sm">
          {renderInline(trimmed)}
        </p>
      );
      i++;
    }
  }

  return <div>{elements}</div>;
}

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({
  step,
  expanded,
  onToggle,
}: {
  step: GenerationStep;
  expanded: boolean;
  onToggle: () => void;
}) {
  const canExpand = step.status !== 'pending' && (step.input !== undefined || step.output !== undefined);

  return (
    <div>
      <button
        className={cn(
          'flex items-center space-x-3 w-full text-left rounded-md px-1 py-0.5 -mx-1',
          canExpand && 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer',
          !canExpand && 'cursor-default'
        )}
        onClick={canExpand ? onToggle : undefined}
        disabled={!canExpand}
      >
        <span className="flex-shrink-0">
          {step.status === 'pending' && (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          )}
          {step.status === 'running' && (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          )}
          {step.status === 'done' && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {step.status === 'error' && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </span>
        <span
          className={cn(
            'text-sm flex-1',
            step.status === 'running' && 'text-blue-600 dark:text-blue-400 font-medium',
            step.status === 'done' && 'text-gray-500 dark:text-gray-400',
            step.status === 'error' && 'text-red-500',
            step.status === 'pending' && 'text-gray-400 dark:text-gray-500'
          )}
        >
          {step.label}
        </span>
        {canExpand && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-gray-400 flex-shrink-0 transition-transform duration-150',
              expanded && 'rotate-180'
            )}
          />
        )}
      </button>

      {expanded && canExpand && (
        <div className="mt-2 ml-8 space-y-2">
          {step.input !== undefined && (
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                Input
              </p>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-2.5 overflow-auto max-h-40 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}
          {step.output !== undefined && (
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                Output
              </p>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-2.5 overflow-auto max-h-40 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function DigestPageContent() {
  const { getValidAccessToken, logout } = useAuth();
  const router = useRouter();

  const [digest, setDigest] = useState<DigestResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [streamingSummary, setStreamingSummary] = useState('');
  const [maxResults, setMaxResults] = useState('50');
  const [hasProfile, setHasProfile] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-flash-lite' | 'groq' | 'kimi'>('gemini-flash-lite');
  const [costPerMInput, setCostPerMInput] = useState(0.10);
  const [costPerMOutput, setCostPerMOutput] = useState(0.40);

  const MODEL_PRICING: Record<'gemini-flash-lite' | 'groq' | 'kimi', { input: number; output: number }> = {
    'gemini-flash-lite': { input: 0.10, output: 0.40 },
    'groq': { input: 0.15, output: 0.60 },
    'kimi': { input: 0.60, output: 2.50 },
  };

  const [steps, setSteps] = useState<GenerationStep[]>(INITIAL_STEPS.map((s) => ({ ...s })));
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load digest and check for saved profile on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DIGEST_STORAGE_KEY);
      if (stored) setDigest(JSON.parse(stored));

      const profile = localStorage.getItem(PROFILE_STORAGE_KEY);
      setHasProfile(!!profile);
    } catch (e) {
      console.error('[DIGEST] Error loading from localStorage:', e);
    }
  }, []);

  const resetSteps = () => {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' as StepStatus })));
    setExpandedSteps(new Set());
    setStreamingSummary('');
  };

  const updateStep = (stepId: string, patch: Partial<GenerationStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s)));

  const toggleStep = (stepId: string) =>
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });

  const handleStreamEvent = (eventType: string, data: any) => {
    if (eventType === 'step-start') {
      const { stepId, input } = data ?? {};
      if (stepId) updateStep(stepId, { status: 'running', input });
    } else if (eventType === 'step-complete') {
      const { stepId, input, output } = data ?? {};
      if (stepId) updateStep(stepId, { status: 'done', input, output });
    } else if (eventType === 'step-error') {
      const { stepId } = data ?? {};
      if (stepId) updateStep(stepId, { status: 'error' });
    } else if (eventType === 'summary-chunk') {
      const { token } = data ?? {};
      if (token) setStreamingSummary((prev) => prev + token);
    } else if (eventType === 'workflow-complete') {
      const result = data?.result;
      if (result?.summary) {
        const digestData: DigestResult = {
          summary: result.summary,
          emailCount: result.emailCount,
          generatedAt: result.generatedAt,
          usage: result.usage,
        };
        setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'done' as StepStatus })));
        setDigest(digestData);
        try {
          localStorage.setItem(DIGEST_STORAGE_KEY, JSON.stringify(digestData));
        } catch (e) {
          console.error('[DIGEST] Error saving to localStorage:', e);
        }
      }
      setGenerating(false);
    }
  };

  const generateDigest = async () => {
    // Validate and clamp only on submit
    const parsed = parseInt(maxResults, 10);
    const clamped = Math.max(10, Math.min(200, isNaN(parsed) ? 50 : parsed));
    setMaxResults(String(clamped));

    setGenerating(true);
    setError(null);
    resetSteps();

    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setGenerating(false);
        return;
      }

      // Read saved user profile from localStorage if available
      let userProfile = '';
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          userProfile = parsed.profile ?? '';
        }
      } catch {
        // profile unavailable — proceed without it
      }

      let response = await fetch('/api/gmail/inbox-summary', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxResults: clamped, userProfile, model: selectedModel }),
      });

      if (response.status === 401) {
        const newToken = await refreshTokenStandalone();
        if (newToken) {
          response = await fetch('/api/gmail/inbox-summary', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ maxResults: clamped, userProfile, model: selectedModel }),
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate digest' }));
        throw new Error(errorData.error || 'Failed to generate digest');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEventType = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim();
              if (!dataStr || dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                handleStreamEvent(currentEventType, parsed);
              } catch {
                // non-JSON chunk — skip
              }
            } else if (line === '') {
              currentEventType = '';
            }
          }
        }
      } finally {
        setGenerating(false);
      }
    } catch (err: any) {
      console.error('[DIGEST] Generation error:', err);
      setError(err.message || 'Failed to generate digest. Please try again.');
      setGenerating(false);
    }
  };

  const clearDigest = () => {
    setDigest(null);
    resetSteps();
    try {
      localStorage.removeItem(DIGEST_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/mail')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <Image
                  src="/logo.png"
                  alt="Test Mail Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
                  Daily Digest
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

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-4xl mx-auto px-4 py-8">

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {!digest && !generating && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4 mx-auto">
                    <Newspaper className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Daily Digest
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm leading-relaxed">
                    Get a personalized AI summary of everything that landed in your inbox
                    in the last 24 hours, tailored to what matters most to you.
                  </p>

                  {hasProfile && (
                    <div className="mb-5 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-xs text-left">
                      <User className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Your saved profile will be used to personalize this digest.</span>
                    </div>
                  )}

                  <div className="mb-5 text-left">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Max emails to fetch
                    </label>
                    <input
                      type="number"
                      value={maxResults}
                      onChange={(e) => setMaxResults(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Fetches up to this many inbox emails from the last 24 hours (10–200)
                    </p>
                  </div>

                  <div className="mb-5 text-left">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Model
                    </label>
                    <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                      {([
                        { id: 'gemini-flash-lite', label: 'Gemini' },
                        { id: 'groq', label: 'Groq' },
                        { id: 'kimi', label: 'Kimi' },
                      ] as const).map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(id);
                            setCostPerMInput(MODEL_PRICING[id].input);
                            setCostPerMOutput(MODEL_PRICING[id].output);
                          }}
                          className={cn(
                            'flex-1 py-2 text-sm font-medium transition-colors',
                            selectedModel === id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm text-left">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={generateDigest}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Newspaper className="h-4 w-4 mr-2" />
                    Generate Digest
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    Analyzes up to {maxResults || 50} inbox emails from the last 24 hours
                  </p>
                </div>
              </div>
            )}

            {/* ── Generating state ───────────────────────────────────────────── */}
            {generating && (
              streamingSummary ? (
                // Live preview: steps sidebar + streaming markdown
                <div className="h-full flex gap-4">
                  <div className="w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sticky top-0">
                      <div className="flex items-center space-x-2 mb-4">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Generating…</span>
                      </div>
                      <div className="space-y-3">
                        {steps.map((step) => (
                          <StepIndicator
                            key={step.id}
                            step={step}
                            expanded={expandedSteps.has(step.id)}
                            onToggle={() => toggleStep(step.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <ScrollArea className="h-full">
                      <div className="px-8 py-6">
                        <MarkdownContent content={streamingSummary} />
                        <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                // Pre-stream loading state
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full">
                    <div className="flex justify-center mb-6">
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
                      Building Your Digest
                    </h2>
                    <div className="space-y-3">
                      {steps.map((step) => (
                        <StepIndicator
                          key={step.id}
                          step={step}
                          expanded={expandedSteps.has(step.id)}
                          onToggle={() => toggleStep(step.id)}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-8">
                      Fetching and summarizing your inbox…
                    </p>
                  </div>
                </div>
              )
            )}

            {/* ── Digest display ─────────────────────────────────────────────── */}
            {digest && !generating && (
              <div className="h-full flex flex-col gap-4">
                {/* Header card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Newspaper className="h-5 w-5 text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Inbox Digest
                        </h2>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Generated {formatDate(digest.generatedAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                          {digest.emailCount} email{digest.emailCount !== 1 ? 's' : ''} summarized
                        </span>
                      </div>
                      {digest.usage && (
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {digest.usage.promptTokens.toLocaleString()}
                              </span>{' '}in{' · '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {digest.usage.completionTokens.toLocaleString()}
                              </span>{' '}out{' · '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {digest.usage.totalTokens.toLocaleString()}
                              </span>{' '}total tokens
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-gray-400 dark:text-gray-500">$/M tokens:</span>
                            <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              in
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={costPerMInput}
                                onChange={(e) => setCostPerMInput(parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </label>
                            <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              out
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={costPerMOutput}
                                onChange={(e) => setCostPerMOutput(parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </label>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              = ${(
                                (digest.usage.promptTokens / 1_000_000) * costPerMInput +
                                (digest.usage.completionTokens / 1_000_000) * costPerMOutput
                              ).toFixed(4)} USD
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateDigest}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Regenerate</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDigest}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Digest markdown content */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <ScrollArea className="h-full">
                    <div className="px-8 py-6">
                      <MarkdownContent content={digest.summary} />
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function DigestPage() {
  return <DigestPageContent />;
}
