'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Plus, ChevronDown, ChevronRight, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface UserMessage {
  id: string;
  kind: 'user';
  content: string;
}

interface AssistantMessage {
  id: string;
  kind: 'assistant';
  content: string;
  streaming?: boolean;
}

interface ToolPendingMessage {
  id: string;
  kind: 'tool-pending';
  runId: string;
  toolName: string;
  input: Record<string, unknown>;
}

interface ToolResultMessage {
  id: string;
  kind: 'tool-result';
  toolName: string;
  result: unknown;
}

interface ErrorMessage {
  id: string;
  kind: 'error';
  content: string;
}

type ChatMessage =
  | UserMessage
  | AssistantMessage
  | ToolPendingMessage
  | ToolResultMessage
  | ErrorMessage;

type ChatStatus = 'idle' | 'streaming' | 'awaiting-approval';

export interface AgentChatProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  userGuid: string;
  accountId: string;
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function formatToolName(name: string) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ToolInputDetails({ input }: { input: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 text-orange-700 dark:text-orange-300 hover:underline"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {expanded ? 'Hide details' : 'Show details'}
      </button>
      {expanded && (
        <pre className="mt-1 p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-800 dark:text-orange-200 overflow-auto max-h-32 whitespace-pre-wrap break-words">
          {JSON.stringify(input, null, 2)}
        </pre>
      )}
    </div>
  );
}

function ToolResultDetails({ result }: { result: unknown }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-1 text-xs">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex items-center gap-1 text-green-700 dark:text-green-300 hover:underline"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {expanded ? 'Hide result' : 'Show result'}
      </button>
      {expanded && (
        <pre className="mt-1 p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-800 dark:text-green-200 overflow-auto max-h-40 whitespace-pre-wrap break-words text-[10px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AgentChat({ isOpen, onClose, token, userGuid, accountId }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── SSE consumer ──────────────────────────────────────────────────────────

  const consumeStream = useCallback(async (response: Response) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const finaliseAssistant = () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.kind === 'assistant' && last.streaming) {
          return [...prev.slice(0, -1), { ...last, streaming: false }];
        }
        return prev;
      });
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          switch (event.type) {
            case 'text-delta': {
              const delta = event.textDelta as string;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.kind === 'assistant' && last.streaming) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + delta },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    kind: 'assistant' as const,
                    content: delta,
                    streaming: true,
                  },
                ];
              });
              break;
            }

            case 'tool-call-pending': {
              finaliseAssistant();
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  kind: 'tool-pending' as const,
                  runId: event.runId as string,
                  toolName: event.toolName as string,
                  input: (event.input ?? {}) as Record<string, unknown>,
                },
              ]);
              setStatus('awaiting-approval');
              // Stop consuming — wait for HITL response
              return;
            }

            case 'tool-result': {
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  kind: 'tool-result' as const,
                  toolName: event.toolName as string,
                  result: event.result,
                },
              ]);
              break;
            }

            case 'finish': {
              finaliseAssistant();
              setStatus('idle');
              break;
            }

            case 'error': {
              finaliseAssistant();
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  kind: 'error' as const,
                  content: (event.error as string) ?? 'Something went wrong.',
                },
              ]);
              setStatus('idle');
              break;
            }
          }
        }
      }
    } finally {
      finaliseAssistant();
      setStatus((s) => (s === 'streaming' ? 'idle' : s));
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || status !== 'idle') return;

    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), kind: 'user', content: text },
    ]);
    setStatus('streaming');

    try {
      abortRef.current = new AbortController();
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text, userGuid, accountId, sessionId }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      await consumeStream(response);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'error',
          content: err instanceof Error ? err.message : 'Request failed.',
        },
      ]);
      setStatus('idle');
    }
  }, [input, status, token, userGuid, accountId, sessionId, consumeStream]);

  const handleApprove = useCallback(
    async (runId: string) => {
      setMessages((prev) =>
        prev.filter((m) => !(m.kind === 'tool-pending' && (m as ToolPendingMessage).runId === runId))
      );
      setStatus('streaming');

      try {
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'approve', runId }),
        });

        if (!response.ok) throw new Error(`Approve failed (${response.status})`);
        await consumeStream(response);
      } catch (err: unknown) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            kind: 'error',
            content: err instanceof Error ? err.message : 'Approve failed.',
          },
        ]);
        setStatus('idle');
      }
    },
    [token, consumeStream]
  );

  const handleDecline = useCallback(
    async (runId: string) => {
      setMessages((prev) =>
        prev.filter((m) => !(m.kind === 'tool-pending' && (m as ToolPendingMessage).runId === runId))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'assistant',
          content: 'Action cancelled.',
          streaming: false,
        },
      ]);
      setStatus('idle');

      // Best-effort decline notification to server
      fetch('/api/agent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'decline', runId }),
      }).catch(() => undefined);
    },
    [token]
  );

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setStatus('idle');
    setSessionId(crypto.randomUUID());
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  const inputPlaceholder =
    status === 'awaiting-approval'
      ? 'Approve or decline the action above...'
      : status === 'streaming'
      ? 'Agent is responding...'
      : 'Ask the mail agent...';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full md:w-[420px] flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Mail Agent</span>
            {status === 'streaming' && (
              <span className="text-xs text-gray-400 animate-pulse">Thinking…</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              title="New conversation"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <Bot className="h-12 w-12 text-purple-200 dark:text-purple-800" />
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[280px] leading-relaxed">
                Ask me to help manage your mail — find messages, mark as read, move, star, or delete.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.kind === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (msg.kind === 'assistant') {
              return (
                <div key={msg.id} className="flex justify-start">
                  <div
                    className={cn(
                      'max-w-[85%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                      msg.streaming &&
                        "after:content-['▍'] after:ml-0.5 after:animate-pulse after:text-purple-500"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            }

            if (msg.kind === 'tool-pending') {
              return (
                <div
                  key={msg.id}
                  className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 p-3"
                >
                  <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 mb-0.5">
                    Action required
                  </p>
                  <p className="text-sm text-orange-900 dark:text-orange-200 font-medium">
                    {formatToolName(msg.toolName)}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    The agent wants to perform this write action. Do you approve?
                  </p>
                  <ToolInputDetails input={msg.input} />
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs gap-1"
                      onClick={() => handleApprove(msg.runId)}
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30 h-8 text-xs gap-1"
                      onClick={() => handleDecline(msg.runId)}
                    >
                      <XCircle className="h-3 w-3" />
                      Decline
                    </Button>
                  </div>
                </div>
              );
            }

            if (msg.kind === 'tool-result') {
              return (
                <div
                  key={msg.id}
                  className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 p-3"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800 dark:text-green-300">
                    <Check className="h-3.5 w-3.5" />
                    {formatToolName(msg.toolName)} completed
                  </div>
                  <ToolResultDetails result={msg.result} />
                </div>
              );
            }

            if (msg.kind === 'error') {
              return (
                <div
                  key={msg.id}
                  className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300"
                >
                  {msg.content}
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              disabled={status !== 'idle'}
              className="flex-1 text-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || status !== 'idle'}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
