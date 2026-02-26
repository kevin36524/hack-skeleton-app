'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  User,
  Loader2,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const PROFILE_STORAGE_KEY = 'user_gmail_profile';

interface UserProfile {
  profile: string;
  emailAddress: string;
  generatedAt: string;
  stats: {
    totalEmailsFetched: number;
    uniqueEmails: number;
    categoryCounts: Record<string, number>;
    topSenders: { email: string; name?: string; count: number }[];
  };
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
  { id: 'fetch-all-categories', label: 'Fetching emails from categories', status: 'pending' },
  { id: 'deduplicate-and-annotate', label: 'Deduplicating and annotating emails', status: 'pending' },
  { id: 'fetch-all-metadata', label: 'Fetching email metadata', status: 'pending' },
  { id: 'generate-profile', label: 'Generating your profile', status: 'pending' },
];

// ── Inline markdown renderer ──────────────────────────────────────────────────

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

    // Headers
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
    }
    // Horizontal rule
    else if (/^[-*]{3,}$/.test(trimmed)) {
      elements.push(
        <hr key={nextKey()} className="my-5 border-gray-200 dark:border-gray-700" />
      );
      i++;
    }
    // Unordered list – collect consecutive items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
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
    }
    // Ordered list – collect consecutive items
    else if (/^\d+\. /.test(trimmed)) {
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
    }
    // Empty line → small spacer
    else if (trimmed === '') {
      elements.push(<div key={nextKey()} className="h-1" />);
      i++;
    }
    // Normal paragraph
    else {
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

// ── Step indicator ────────────────────────────────────────────────────────────

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
            <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
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
            step.status === 'running' && 'text-purple-600 dark:text-purple-400 font-medium',
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

// ── Main page ─────────────────────────────────────────────────────────────────

function ProfilePageContent() {
  const { getValidAccessToken, logout, tokenData } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [generating, setGenerating] = useState(false);
  const [streamingProfile, setStreamingProfile] = useState('');
  const [maxResultsPerCategory, setMaxResultsPerCategory] = useState(20);
  const [selectedModel, setSelectedModel] = useState<'gemini-flash-lite' | 'groq' | 'kimi'>('gemini-flash-lite');
  const [costPerMInput, setCostPerMInput] = useState(0.10);
  const [costPerMOutput, setCostPerMOutput] = useState(0.40);

  const MODEL_PRICING: Record<'gemini-flash-lite' | 'groq' | 'kimi', { input: number; output: number }> = {
    'gemini-flash-lite': { input: 0.10, output: 0.40 },
    'groq': { input: 0.15, output: 0.60 },
    'kimi': { input: 0.60, output: 2.50 },
  };
  const [steps, setSteps] = useState<GenerationStep[]>(
    INITIAL_STEPS.map((s) => ({ ...s }))
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error('[PROFILE] Error loading from localStorage:', e);
    }
  }, []);

  const resetSteps = () => {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' as StepStatus })));
    setExpandedSteps(new Set());
    setStreamingProfile('');
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
    } else if (eventType === 'profile-chunk') {
      const { token } = data ?? {};
      if (token) setStreamingProfile((prev) => prev + token);
    } else if (eventType === 'workflow-complete') {
      const result = data?.result;
      if (result?.profile) {
        const profileData: UserProfile = {
          profile: result.profile,
          emailAddress: result.emailAddress,
          generatedAt: result.generatedAt,
          stats: result.stats,
          usage: result.usage,
        };
        setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'done' as StepStatus })));
        setProfile(profileData);
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
        } catch (e) {
          console.error('[PROFILE] Error saving to localStorage:', e);
        }
      }
      setGenerating(false);
    }
  };

  const generateProfile = async () => {
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

      const response = await fetch('/api/gmail/user-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Mail-Provider': tokenData?.provider ?? 'gmail',
        },
        body: JSON.stringify({
          maxResultsPerCategory,
          maxPerSender: 20,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate profile' }));
        throw new Error(errorData.error || 'Failed to generate profile');
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
                // non-JSON chunk – skip
              }
            } else if (line === '') {
              currentEventType = '';
            }
          }
        }
      } finally {
        // Ensure generating is always cleared when the stream ends
        setGenerating(false);
      }
    } catch (err: any) {
      console.error('[PROFILE] Generation error:', err);
      setError(err.message || 'Failed to generate profile. Please try again.');
      setGenerating(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    resetSteps();
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch (e) {
      console.error('[PROFILE] Error clearing localStorage:', e);
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
                  alt="Oath Mail Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
                  User Profile
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

            {/* ── Empty state ───────────────────────────────────────────── */}
            {!profile && !generating && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/40 mb-4 mx-auto">
                    <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Your Email Profile
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm leading-relaxed">
                    Generate a comprehensive personal profile based on your Gmail emails. The AI
                    analyzes your email patterns, contacts, and activities to build a rich summary.
                  </p>

                  <div className="mb-5 text-left">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Emails per category
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={maxResultsPerCategory}
                      onChange={e => setMaxResultsPerCategory(Math.max(5, Math.min(200, Number(e.target.value))))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Fetches this many emails from each of the 5 categories (5–200)
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
                              ? 'bg-purple-600 text-white'
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
                    onClick={generateProfile}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Generate Profile
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    Analyzes top {maxResultsPerCategory} emails × 5 categories
                  </p>
                </div>
              </div>
            )}

            {/* ── Generating state ──────────────────────────────────────── */}
            {generating && (
              streamingProfile ? (
                // Live preview: split layout — steps sidebar + streaming markdown
                <div className="h-full flex gap-4">
                  {/* Steps sidebar */}
                  <div className="w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sticky top-0">
                      <div className="flex items-center space-x-2 mb-4">
                        <Loader2 className="h-4 w-4 text-purple-500 animate-spin flex-shrink-0" />
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

                  {/* Streaming profile content */}
                  <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <ScrollArea className="h-full">
                      <div className="px-8 py-6">
                        <MarkdownContent content={streamingProfile} />
                        {/* Blinking cursor at the end */}
                        <span className="inline-block w-0.5 h-4 bg-purple-500 animate-pulse ml-0.5 align-middle" />
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                // Initial state before any streaming text arrives
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full">
                    <div className="flex justify-center mb-6">
                      <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
                      Generating Your Profile
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
                      Please keep this page open — this can take 1–3 minutes
                    </p>
                  </div>
                </div>
              )
            )}

            {/* ── Profile display ───────────────────────────────────────── */}
            {profile && !generating && (
              <div className="h-full flex flex-col gap-4">
                {/* Profile card header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-5 w-5 text-purple-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {profile.emailAddress}
                        </h2>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Generated {formatDate(profile.generatedAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full font-medium">
                          {profile.stats.uniqueEmails.toLocaleString()} emails analyzed
                        </span>
                      </div>
                      {profile.usage && (
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">{profile.usage.promptTokens.toLocaleString()}</span> in
                              {' · '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">{profile.usage.completionTokens.toLocaleString()}</span> out
                              {' · '}
                              <span className="font-medium text-gray-700 dark:text-gray-300">{profile.usage.totalTokens.toLocaleString()}</span> total tokens
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
                                onChange={e => setCostPerMInput(parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                              />
                            </label>
                            <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              out
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={costPerMOutput}
                                onChange={e => setCostPerMOutput(parseFloat(e.target.value) || 0)}
                                className="w-16 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-400"
                              />
                            </label>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              = ${(
                                (profile.usage.promptTokens / 1_000_000) * costPerMInput +
                                (profile.usage.completionTokens / 1_000_000) * costPerMOutput
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
                        onClick={generateProfile}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Regenerate</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearProfile}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Clear</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Profile markdown content */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <ScrollArea className="h-full">
                    <div className="px-8 py-6">
                      <MarkdownContent content={profile.profile} />
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

export default function ProfilePage() {
  return <ProfilePageContent />;
}
