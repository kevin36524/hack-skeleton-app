'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ResizablePanels } from '@/components/ui/resizable-panels';
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Star, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Send,
  Bot,
  User,
  CheckSquare,
  Pin,
  MoreHorizontal
} from 'lucide-react';

// Mock data for the daily digest
const mockDigestData = {
  date: new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  todayItems: [
    {
      id: '1',
      type: 'email',
      priority: 'high',
      subject: 'Project deadline reminder',
      sender: 'manager@company.com',
      preview: 'The project deadline is approaching and we need to review the final deliverables...',
      time: '9:00 AM',
      action: 'Respond by 2pm'
    },
    {
      id: '2',
      type: 'email',
      priority: 'high',
      subject: 'Meeting rescheduled',
      sender: 'admin@company.com',
      preview: 'Your 2pm meeting has been moved to 4pm today. Please confirm your availability.',
      time: '10:30 AM',
      action: 'Confirm attendance'
    },
    {
      id: '3',
      type: 'task',
      priority: 'medium',
      title: 'Review quarterly report',
      description: 'Go through the Q4 financial report and prepare notes for discussion',
      time: 'Due by 5pm',
      action: 'Start review'
    },
    {
      id: '4',
      type: 'email',
      priority: 'medium',
      subject: 'Quarterly report draft',
      sender: 'finance@company.com',
      preview: 'Please review the attached quarterly report before our meeting tomorrow.',
      time: '11:00 AM',
      action: 'Review & comment'
    },
    {
      id: '5',
      type: 'task',
      priority: 'low',
      title: 'Archive old emails',
      description: 'Clean up inbox by archiving emails older than 3 months',
      time: 'Anytime today',
      action: 'Start cleanup'
    }
  ]
};

// Types for chat messages
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// AI Assistant Chat Component
function AIAssistantPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Good morning! I\'m your AI assistant. I can help you:\n\n• Summarize your emails\n• Draft responses\n• Prioritize your tasks\n• Answer questions about your inbox\n\nWhat would you like help with today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual Mastra agent integration)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateMockResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes('summarize') || lower.includes('summary')) {
      return 'Based on your inbox today:\n\n**High Priority:**\n• Project deadline reminder from your manager (needs response by 2pm)\n• Meeting rescheduled to 4pm (confirmation needed)\n\n**Medium Priority:**\n• Quarterly report to review before tomorrow\'s meeting\n\n**Quick Wins:**\n• 3 newsletters you can batch-archive\n• 2 automated notifications requiring no action\n\nWould you like me to draft responses to any of these?';
    }
    if (lower.includes('draft') || lower.includes('write')) {
      return 'I can help draft that response! Here\'s a suggestion:\n\n---\n\nHi [Name],\n\nThank you for the update. I\'ve noted the deadline and will have the deliverables ready for review by end of day. I\'ll send over the final documents by 5pm today.\n\nBest regards\n\n---\n\nWould you like me to adjust the tone or add anything specific?';
    }
    if (lower.includes('prioritize') || lower.includes('important')) {
      return 'Here\'s what I recommend tackling first:\n\n1. **Respond to manager** (2pm deadline) - 15 mins\n2. **Confirm meeting attendance** - 2 mins\n3. **Review quarterly report** - 45 mins\n4. **Archive old emails** - 10 mins\n\nTotal: ~72 minutes of focused work. Want me to block time on your calendar?';
    }
    return 'I understand. I can help with that. Could you provide a bit more detail about what you\'d like me to do? For example, I can:\n\n• Summarize specific emails or threads\n• Draft professional responses\n• Help prioritize your workload\n• Search through your inbox for specific information';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 px-4 py-3 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything about your emails & tasks</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className={`h-8 w-8 ${message.role === 'assistant' ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <AvatarFallback>
                    {message.role === 'assistant' ? <Bot className="h-4 w-4 text-purple-600" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 bg-purple-100 dark:bg-purple-900/50">
                  <AvatarFallback><Bot className="h-4 w-4 text-purple-600" /></AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me to summarize emails, draft responses, or prioritize tasks..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => setInput('Summarize my important emails')}>
            Summarize emails
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => setInput('Help me prioritize my day')}>
            Prioritize tasks
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => setInput('Draft a response to my manager')}>
            Draft response
          </Button>
        </div>
      </div>
    </div>
  );
}

// Today's Important Items Panel
function TodayItemsPanel() {
  const router = useRouter();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleComplete = (id: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const highPriorityItems = mockDigestData.todayItems.filter(item => item.priority === 'high');
  const mediumPriorityItems = mockDigestData.todayItems.filter(item => item.priority === 'medium');
  const lowPriorityItems = mockDigestData.todayItems.filter(item => item.priority === 'low');

  const renderItem = (item: typeof mockDigestData.todayItems[0]) => {
    const isCompleted = completedItems.has(item.id);
    const isEmail = item.type === 'email';

    return (
      <Card 
        key={item.id} 
        className={`transition-all duration-200 ${isCompleted ? 'opacity-50' : ''} ${
          item.priority === 'high' ? 'border-l-4 border-l-red-500' : 
          item.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : 
          'border-l-4 border-l-green-500'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-auto ${isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
              onClick={() => toggleComplete(item.id)}
            >
              <CheckSquare className={`h-5 w-5 ${isCompleted ? 'fill-current' : ''}`} />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isEmail ? (
                  <Mail className="h-4 w-4 text-blue-500" />
                ) : (
                  <CheckSquare className="h-4 w-4 text-purple-500" />
                )}
                <span className="text-xs text-gray-500">{item.time}</span>
                {item.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">High Priority</Badge>
                )}
              </div>
              
              <h3 className={`font-medium text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>
                {isEmail ? item.subject : item.title}
              </h3>
              
              {isEmail ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.sender}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.preview}</p>
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              )}
              
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  {item.action}
                </Button>
                {isEmail && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => router.push('/mail')}>
                    View in Mail
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-800">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Pin className="h-5 w-5 text-red-500" />
            Today&apos;s Focus
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{mockDigestData.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {completedItems.size}/{mockDigestData.todayItems.length} Done
          </Badge>
        </div>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4">
          {/* High Priority Section */}
          {highPriorityItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                High Priority
              </h3>
              <div className="space-y-3">
                {highPriorityItems.map(renderItem)}
              </div>
            </div>
          )}

          {/* Medium Priority Section */}
          {mediumPriorityItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Medium Priority
              </h3>
              <div className="space-y-3">
                {mediumPriorityItems.map(renderItem)}
              </div>
            </div>
          )}

          {/* Low Priority Section */}
          {lowPriorityItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                When You Have Time
              </h3>
              <div className="space-y-3">
                {lowPriorityItems.map(renderItem)}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedItems.size}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockDigestData.todayItems.length - completedItems.size}</p>
                <p className="text-xs text-gray-500">Remaining</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((completedItems.size / mockDigestData.todayItems.length) * 100)}%
                </p>
                <p className="text-xs text-gray-500">Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
}

function DailyDigestContent() {
  const router = useRouter();

  const handleBackToMail = () => {
    router.push('/mail');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMail}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Mail</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Digest
              </h1>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Two-Pane Layout */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanels 
          defaultSizes={[45, 55]} 
          minSizes={[30, 30]}
          className="h-full"
        >
          <AIAssistantPanel />
          <TodayItemsPanel />
        </ResizablePanels>
      </main>
    </div>
  );
}

export default function DailyDigestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ProtectedRoute>
        <DailyDigestContent />
      </ProtectedRoute>
    </Suspense>
  );
}
