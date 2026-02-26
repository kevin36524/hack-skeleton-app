'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ChevronDown,
  Mail,
  Eye,
  Archive,
  Check,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SUMMARY_STORAGE_KEY = 'user_gmail_summary';
const PROFILE_STORAGE_KEY = 'user_gmail_profile';

type SectionType = 'read_now' | 'worth_a_glance' | 'low_priority';

interface ClassifiedEmail {
  id: string;
  from: string;
  subject: string;
  section: SectionType;
  subsection?: string;
}

interface InboxSummary {
  short_summary: string;
  emails: ClassifiedEmail[];
  emailAddress: string;
  generatedAt: string;
  stats: {
    totalEmailsFetched: number;
    uniqueSenders: number;
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
  { id: 'fetch-inbox-emails', label: 'Fetching inbox emails', status: 'pending' },
  { id: 'generate-summary', label: 'Generating summary', status: 'pending' },
];

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

// ── Section Card Components ───────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  icon: Icon,
  colorClass,
}: {
  title: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{count} emails</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-lg font-bold",
          colorClass.replace('bg-', 'text-').replace('/10', '')
        )}>
          {count}
        </span>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}

function EmailItem({ email }: { email: ClassifiedEmail }) {
  // Extract sender name from "Name <email>" format
  const senderName = email.from.match(/^(.+?)\s*</)?.[1]?.replace(/"/g, '') || email.from;
  const senderEmail = email.from.match(/<(.+?)>/)?.[1] || email.from;
  
  // Get initials for avatar
  const initials = senderName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{senderName}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{email.subject}</p>
      </div>
    </div>
  );
}

function SubsectionGroup({
  subsection,
  emails,
}: {
  subsection: string;
  emails: ClassifiedEmail[];
}) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Get unique sender initials for the avatar stack
  const uniqueSenders = [...new Set(emails.map(e => e.from.match(/^(.+?)\s*</)?.[1]?.replace(/"/g, '') || e.from))].slice(0, 4);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 -mx-2 transition-colors">
          <div className="flex items-center gap-3">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {uniqueSenders.map((sender, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-white",
                    i === 0 && "bg-blue-500",
                    i === 1 && "bg-green-500",
                    i === 2 && "bg-purple-500",
                    i === 3 && "bg-orange-500"
                  )}
                >
                  {sender.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 1)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{subsection}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{emails.length} emails</p>
            </div>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 mt-2">
          {emails.map((email) => (
            <EmailItem key={email.id} email={email} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ReadNowSection({ emails }: { emails: ClassifiedEmail[] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (emails.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <SectionHeader
            title="Read now"
            count={emails.length}
            icon={Mail}
            colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-1">
            {emails.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 px-4 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2">
            Mark as done
            <Check className="h-4 w-4" />
          </button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function WorthAGlanceSection({ emails }: { emails: ClassifiedEmail[] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (emails.length === 0) return null;

  // Group by subsection
  const grouped = emails.reduce((acc, email) => {
    const subsection = email.subsection || 'other';
    if (!acc[subsection]) acc[subsection] = [];
    acc[subsection].push(email);
    return acc;
  }, {} as Record<string, ClassifiedEmail[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <SectionHeader
            title="Worth a glance"
            count={emails.length}
            icon={Eye}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-2">
            {Object.entries(grouped).map(([subsection, subsectionEmails]) => (
              <SubsectionGroup
                key={subsection}
                subsection={subsection}
                emails={subsectionEmails}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function LowPrioritySection({ emails }: { emails: ClassifiedEmail[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (emails.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <SectionHeader
            title="Low priority"
            count={emails.length}
            icon={Archive}
            colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-1">
            {emails.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function SummaryPageContent() {
  const { getValidAccessToken, tokenData, logout } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<InboxSummary | null>(null);
  const [userProfile, setUserProfile] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [maxResults, setMaxResults] = useState(50);
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

  // Load summary and user profile from localStorage on mount
  useEffect(() => {
    try {
      const storedSummary = localStorage.getItem(SUMMARY_STORAGE_KEY);
      if (storedSummary) {
        setSummary(JSON.parse(storedSummary));
      }
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        setUserProfile(profileData.profile || '');
      }
    } catch (e) {
      console.error('[SUMMARY] Error loading from localStorage:', e);
    }
  }, []);

  const resetSteps = () => {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' as StepStatus })));
    setExpandedSteps(new Set());
    setStreamingText('');
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
      if (token) setStreamingText((prev) => prev + token);
    } else if (eventType === 'workflow-complete') {
      const result = data?.result;
      if (result?.emails) {
        const summaryData: InboxSummary = {
          short_summary: result.short_summary,
          emails: result.emails,
          emailAddress: result.emailAddress,
          generatedAt: result.generatedAt,
          stats: result.stats,
          usage: result.usage,
        };
        setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'done' as StepStatus })));
        setSummary(summaryData);
        try {
          localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaryData));
        } catch (e) {
          console.error('[SUMMARY] Error saving to localStorage:', e);
        }
      }
      setGenerating(false);
    }
  };

  const generateSummary = async () => {
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

      const response = await fetch('/api/gmail/summary', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Mail-Provider': tokenData?.provider ?? 'gmail',
        },
        body: JSON.stringify({
          maxResults,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          model: selectedModel,
          userProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate summary' }));
        throw new Error(errorData.error || 'Failed to generate summary');
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
        setGenerating(false);
      }
    } catch (err: any) {
      console.error('[SUMMARY] Generation error:', err);
      setError(err.message || 'Failed to generate summary. Please try again.');
      setGenerating(false);
    }
  };

  const clearSummary = () => {
    setSummary(null);
    resetSteps();
    try {
      localStorage.removeItem(SUMMARY_STORAGE_KEY);
    } catch (e) {
      console.error('[SUMMARY] Error clearing localStorage:', e);
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

  // Group emails by section
  const readNowEmails = summary?.emails.filter(e => e.section === 'read_now') || [];
  const worthAGlanceEmails = summary?.emails.filter(e => e.section === 'worth_a_glance') || [];
  const lowPriorityEmails = summary?.emails.filter(e => e.section === 'low_priority') || [];

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
                  Inbox Summary
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
          <div className="h-full max-w-2xl mx-auto px-4 py-6">

            {/* ── Empty state ───────────────────────────────────────────── */}
            {!summary && !generating && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4 mx-auto">
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Your Inbox Summary
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm leading-relaxed">
                    Generate a personalized summary of your inbox emails. The AI analyzes your top emails
                    and creates a context-aware summary based on your user profile.
                  </p>

                  <div className="mb-5 text-left">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Max emails to analyze
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={maxResults}
                      onChange={e => setMaxResults(Math.max(10, Math.min(100, Number(e.target.value))))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Fetches this many emails from your inbox (10–100)
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

                  {!userProfile && (
                    <div className="mb-5 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start space-x-2 text-yellow-700 dark:text-yellow-400 text-sm text-left">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>
                        No user profile found. Generate a profile first for personalized summaries, 
                        or continue with a generic summary.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm text-left">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={generateSummary}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Summary
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    Analyzes top {maxResults} emails from your inbox
                  </p>
                </div>
              </div>
            )}

            {/* ── Generating state ──────────────────────────────────────── */}
            {generating && (
              streamingText ? (
                // Live preview: split layout — steps sidebar + streaming text
                <div className="h-full flex gap-4">
                  {/* Steps sidebar */}
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

                  {/* Streaming content */}
                  <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <ScrollArea className="h-full">
                      <div className="px-8 py-6">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                          {streamingText}
                        </pre>
                        <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                // Initial state before any streaming text arrives
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-md w-full">
                    <div className="flex justify-center mb-6">
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
                      Generating Your Summary
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
                      Please keep this page open — this can take 30–60 seconds
                    </p>
                  </div>
                </div>
              )
            )}

            {/* ── Summary display ───────────────────────────────────────── */}
            {summary && !generating && (
              <div className="space-y-4">
                {/* Header greeting */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Good morning
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Since you were last here you have {summary.emails.length} emails to review
                  </p>
                </div>

                {/* Read Now Section */}
                <ReadNowSection emails={readNowEmails} />

                {/* Worth a Glance Section */}
                <WorthAGlanceSection emails={worthAGlanceEmails} />

                {/* Low Priority Section */}
                <LowPrioritySection emails={lowPriorityEmails} />

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Generated {formatDate(summary.generatedAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateSummary}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Regenerate</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSummary}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Clear</span>
                    </Button>
                  </div>
                </div>

                {/* Token usage (collapsible) */}
                {summary.usage && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    {summary.usage.totalTokens.toLocaleString()} tokens · 
                    ${((summary.usage.promptTokens / 1_000_000) * costPerMInput +
                       (summary.usage.completionTokens / 1_000_000) * costPerMOutput).toFixed(4)} USD
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SummaryPage() {
  return <SummaryPageContent />;
}
