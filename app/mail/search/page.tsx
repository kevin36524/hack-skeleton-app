'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageDetail } from '@/components/message-detail';
import { LogOut, Mail, Search, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSearchParams, useRouter } from 'next/navigation';
import { Message } from '@/lib/types/api';
import { ResizablePanels } from '@/components/ui/resizable-panels';
import { messageService } from '@/lib/services/message-service';
import { setAccessToken } from '@/lib/services/gmail-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Star, Paperclip, AlertCircle } from 'lucide-react';
import { useMailbox } from '@/lib/hooks/use-yahoo-mail';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SearchResultMessage {
  id: string;
  conversationId: string;
  headers: {
    from: Array<{ name?: string; email: string }>;
    to: Array<{ name?: string; email: string }>;
    subject: string;
    internalDate: string;
  };
  flags: {
    read: boolean;
    flagged: boolean;
  };
  snippet: string;
  attachments: any[];
  hasAttachment: boolean;
}

interface IntelligentSearchResult {
  query: string;
  labelIds: string[];
  explanation: string;
  detectedParams: {
    from?: string;
    to?: string;
    subject?: string;
    folder?: string;
    hasAttachment?: boolean;
    isUnread?: boolean;
    isStarred?: boolean;
    dateRange?: string;
    keywords?: string[];
  };
  messages: any[];
}

function SearchPageContent() {
  const { logout, getValidAccessToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: mailboxData } = useMailbox();

  // Get mailbox ID from mailbox data
  const mailboxId = mailboxData?.mailboxes?.[0]?.id || '';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [panelSizes, setPanelSizes] = useState<number[]>([40, 60]);
  
  // Intelligent search state
  const [useIntelligentSearch, setUseIntelligentSearch] = useState(true);
  const [intelligentResult, setIntelligentResult] = useState<IntelligentSearchResult | null>(null);

  // Initialize search query from URL
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      performSearch(queryFromUrl);
    }
  }, [searchParams]);

  // Load panel sizes from localStorage
  useEffect(() => {
    try {
      const storedSizes = localStorage.getItem('search-panel-sizes');
      if (storedSizes !== null) {
        setPanelSizes(JSON.parse(storedSizes));
      }
      
      // Load intelligent search preference
      const intelligentPref = localStorage.getItem('intelligent-search-enabled');
      if (intelligentPref !== null) {
        setUseIntelligentSearch(JSON.parse(intelligentPref));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  // Save intelligent search preference
  useEffect(() => {
    try {
      localStorage.setItem('intelligent-search-enabled', JSON.stringify(useIntelligentSearch));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [useIntelligentSearch]);

  // Save panel sizes to localStorage
  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes(sizes);
    try {
      localStorage.setItem('search-panel-sizes', JSON.stringify(sizes));
    } catch (error) {
      console.error('Error saving panel sizes:', error);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      setIntelligentResult(null);

      // Ensure we have a valid access token
      const token = await getValidAccessToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Update token in gmail client
      setAccessToken(token);

      let transformedMessages: SearchResultMessage[] = [];

      if (useIntelligentSearch) {
        // Use intelligent search
        console.log('[SEARCH] Using intelligent search for:', query);
        const result = await messageService.intelligentSearch(query, 50, true);
        setIntelligentResult(result);
        
        // Transform messages from intelligent search
        transformedMessages = result.messages.map((msg: any) => {
          const headers = msg.payload?.headers || [];

          // Helper to get header value
          const getHeader = (name: string) => {
            const header = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase());
            return header?.value || '';
          };

          // Parse From header
          const fromHeader = getHeader('from');
          const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [];
          const fromName = fromMatch[1]?.trim().replace(/^["']|["']$/g, '') || '';
          const fromEmail = fromMatch[2]?.trim() || fromHeader.trim();

          // Parse To header
          const toHeader = getHeader('to');
          const toEmails = toHeader.split(',').map((email: string) => {
            const match = email.trim().match(/^(.+?)\s*<(.+?)>$/) || [];
            return {
              name: match[1]?.trim().replace(/^["']|["']$/g, '') || '',
              email: match[2]?.trim() || email.trim(),
            };
          });

          // Check if message is unread
          const isUnread = (msg.labelIds || []).includes('UNREAD');
          const isStarred = (msg.labelIds || []).includes('STARRED');

          return {
            id: msg.id,
            conversationId: msg.threadId,
            headers: {
              from: [{
                name: fromName,
                email: fromEmail,
              }],
              to: toEmails,
              subject: getHeader('subject'),
              internalDate: Math.floor(parseInt(msg.internalDate || '0') / 1000).toString(),
            },
            flags: {
              read: !isUnread,
              flagged: isStarred,
            },
            snippet: msg.snippet || '',
            attachments: [],
            hasAttachment: msg.snippet?.includes('attachment') || false,
          };
        });
      } else {
        // Use regular search
        console.log('[SEARCH] Using regular search for:', query);
        const messages = await messageService.searchMessages(query, 50);

        // Transform messages into the expected format
        transformedMessages = messages.map((msg: any) => {
          const headers = msg.payload?.headers || [];

          // Helper to get header value
          const getHeader = (name: string) => {
            const header = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase());
            return header?.value || '';
          };

          // Parse From header
          const fromHeader = getHeader('from');
          const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [];
          const fromName = fromMatch[1]?.trim().replace(/^["']|["']$/g, '') || '';
          const fromEmail = fromMatch[2]?.trim() || fromHeader.trim();

          // Parse To header
          const toHeader = getHeader('to');
          const toEmails = toHeader.split(',').map((email: string) => {
            const match = email.trim().match(/^(.+?)\s*<(.+?)>$/) || [];
            return {
              name: match[1]?.trim().replace(/^["']|["']$/g, '') || '',
              email: match[2]?.trim() || email.trim(),
            };
          });

          // Check if message is unread
          const isUnread = (msg.labelIds || []).includes('UNREAD');
          const isStarred = (msg.labelIds || []).includes('STARRED');

          return {
            id: msg.id,
            conversationId: msg.threadId,
            headers: {
              from: [{
                name: fromName,
                email: fromEmail,
              }],
              to: toEmails,
              subject: getHeader('subject'),
              internalDate: Math.floor(parseInt(msg.internalDate || '0') / 1000).toString(),
            },
            flags: {
              read: !isUnread,
              flagged: isStarred,
            },
            snippet: msg.snippet || '',
            attachments: [],
            hasAttachment: msg.snippet?.includes('attachment') || false,
          };
        });
      }

      setSearchResults(transformedMessages);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to search messages';
      setError(errorMessage);
      console.error('Error searching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [getValidAccessToken, useIntelligentSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('q', searchQuery);
      router.replace(`/mail/search?${newSearchParams.toString()}`, { scroll: false });
      performSearch(searchQuery);
    }
  };

  const handleMessageSelected = (message: SearchResultMessage) => {
    // Convert SearchResultMessage to Message format
    const fullMessage: Message = {
      ...message,
      folder: {
        id: '',
        name: '',
        types: [],
        unread: 0,
        total: 0,
        acctId: '',
        highestModSeq: 0,
      },
      decos: [],
      dedupId: 0,
      modSeq: 0,
    };
    setSelectedMessage(fullMessage);
  };

  const handleLogout = () => {
    logout();
  };

  const handleBackToMail = () => {
    router.push('/mail');
  };

  const getSenderName = (message: SearchResultMessage) => {
    const from = message.headers.from[0];
    return from?.name || from?.email || 'Unknown';
  };

  const getSenderEmail = (message: SearchResultMessage) => {
    const from = message.headers.from[0];
    return from?.email || '';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Desktop Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMail}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <Mail className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">Search</h1>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={useIntelligentSearch ? "Try: emails from niti about birthday in inbox..." : "Search emails..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                  {loading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>
              </form>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Intelligent Search Toggle */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Sparkles className={cn(
                    "h-4 w-4 transition-colors",
                    useIntelligentSearch ? "text-purple-500" : "text-gray-400"
                  )} />
                  <Switch
                    id="intelligent-search"
                    checked={useIntelligentSearch}
                    onCheckedChange={setUseIntelligentSearch}
                  />
                  <Label 
                    htmlFor="intelligent-search" 
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    AI
                  </Label>
                </div>
                
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Mobile Layout */}
          <div className="md:hidden h-full flex flex-col">
            {/* Mobile Search Form */}
            <div className="p-4 border-b bg-white dark:bg-gray-800 space-y-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={useIntelligentSearch ? "Try: emails from niti..." : "Search emails..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                  {loading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                </div>
              </form>
              
              {/* Mobile Intelligent Search Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className={cn(
                    "h-4 w-4",
                    useIntelligentSearch ? "text-purple-500" : "text-gray-400"
                  )} />
                  <Switch
                    id="intelligent-search-mobile"
                    checked={useIntelligentSearch}
                    onCheckedChange={setUseIntelligentSearch}
                  />
                  <Label 
                    htmlFor="intelligent-search-mobile" 
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    AI Search
                  </Label>
                </div>
              </div>
            </div>

            {/* Mobile Results */}
            <div className="flex-1 overflow-hidden">
              {!hasSearched ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <Search className="h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-center">
                    {useIntelligentSearch 
                      ? "Try natural language like 'emails from niti about birthday'"
                      : "Enter a search query to find emails"}
                  </p>
                </div>
              ) : loading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Search failed</h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">{error}</p>
                  <Button variant="outline" onClick={() => performSearch(searchQuery)}>
                    Try Again
                  </Button>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <Search className="h-12 w-12 mb-4 text-gray-300" />
                  <p>No messages found</p>
                  {intelligentResult && (
                    <p className="text-sm text-gray-400 mt-2 text-center">
                      Query: {intelligentResult.query}
                    </p>
                  )}
                </div>
              ) : selectedMessage ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">Message Details</h2>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMessage(null)}>
                      Back to results
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <MessageDetail
                      message={selectedMessage}
                      mailboxId={mailboxId}
                      onMarkAsRead={(messageId) => console.log('Mark as read:', messageId)}
                      onMarkAsUnread={(messageId) => console.log('Mark as unread:', messageId)}
                      onToggleStar={(messageId) => console.log('Toggle star:', messageId)}
                      onReply={(message) => console.log('Reply to:', message.id)}
                      onForward={(message) => console.log('Forward:', message.id)}
                      onDelete={(messageId) => console.log('Delete:', messageId)}
                      onArchive={(messageId) => console.log('Archive:', messageId)}
                    />
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-2 space-y-1">
                    {/* Show generated query info */}
                    {intelligentResult && (
                      <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-2">
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          <span className="font-medium">AI Query:</span> {intelligentResult.query}
                        </p>
                      </div>
                    )}
                    
                    {searchResults.map((message) => {
                      const isUnread = !message.flags.read;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-lg cursor-pointer transition-colors duration-150 border border-transparent',
                            selectedMessage?.id === message.id && 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-l-purple-600 border-purple-300 dark:border-purple-700'
                          )}
                          onClick={() => handleMessageSelected(message)}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                            <AvatarFallback className={cn(
                              "text-xs font-medium flex items-center justify-center",
                              isUnread ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            )}>
                              {getInitials(getSenderName(message))}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className={cn(
                                  "text-sm font-medium truncate max-w-full",
                                  isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                                )}>
                                  {getSenderName(message)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full overflow-hidden">
                                  {getSenderEmail(message)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                <span className="whitespace-nowrap">
                                  {message.headers.internalDate ? formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true }) : 'Unknown time'}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {message.flags.flagged && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                                  {message.hasAttachment && <Paperclip className="h-3 w-3 text-gray-400" />}
                                </div>
                              </div>
                            </div>

                            <div className="mt-1">
                              <p className={cn(
                                "text-sm text-gray-700 dark:text-gray-300 line-clamp-2 break-words overflow-hidden",
                                isUnread ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                              )}>
                                {message.headers.subject || '(No subject)'}
                              </p>
                              <p className={cn(
                                "text-sm line-clamp-1 mt-1 break-words overflow-hidden",
                                isUnread ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"
                              )}>
                                {message.snippet}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Desktop Layout with Resizable Panels */}
          <div className="hidden md:block h-full w-full">
            <ResizablePanels
              defaultSizes={panelSizes}
              minSizes={[30, 40]}
              onResize={handlePanelResize}
            >
              {/* Search Results Panel */}
              <div className="h-full flex flex-col border-r bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Search Results
                      {hasSearched && !loading && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({searchResults.length} found)
                        </span>
                      )}
                    </h2>
                    {intelligentResult && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  
                  {/* Show generated query */}
                  {intelligentResult && (
                    <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                      <p className="text-purple-700 dark:text-purple-300">
                        <span className="font-medium">Generated query:</span> {intelligentResult.query}
                      </p>
                      {intelligentResult.explanation && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          {intelligentResult.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Search className="h-16 w-16 mb-4 text-gray-300" />
                      <p className="text-center max-w-xs">
                        {useIntelligentSearch 
                          ? "Try natural language like 'emails from niti about birthday in inbox'"
                          : "Enter a search query to find emails"}
                      </p>
                      {useIntelligentSearch && (
                        <div className="mt-4 text-xs text-gray-400 text-center max-w-xs">
                          <p>Examples:</p>
                          <ul className="mt-1 space-y-1">
                            <li>"unread emails from john with attachments"</li>
                            <li>"emails about project from last week"</li>
                            <li>"starred emails in important"</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : loading ? (
                    <div className="p-4 space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Search failed</h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">{error}</p>
                      <Button variant="outline" onClick={() => performSearch(searchQuery)}>
                        Try Again
                      </Button>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Search className="h-16 w-16 mb-4 text-gray-300" />
                      <p>No messages found</p>
                      {intelligentResult && (
                        <div className="mt-2 text-sm text-gray-400 text-center">
                          <p>Query: {intelligentResult.query}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="h-full">
                      <div className="p-2 space-y-1">
                        {searchResults.map((message) => {
                          const isUnread = !message.flags.read;
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                'flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-lg cursor-pointer transition-colors duration-150 border border-transparent',
                                selectedMessage?.id === message.id && 'bg-purple-100 dark:bg-purple-900/40 border-l-4 border-l-purple-600 border-purple-300 dark:border-purple-700'
                              )}
                              onClick={() => handleMessageSelected(message)}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                                <AvatarFallback className={cn(
                                  "text-xs font-medium flex items-center justify-center",
                                  isUnread ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                )}>
                                  {getInitials(getSenderName(message))}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className={cn(
                                      "text-sm font-medium truncate max-w-full",
                                      isUnread ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                                    )}>
                                      {getSenderName(message)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full overflow-hidden">
                                      {getSenderEmail(message)}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    <span className="whitespace-nowrap">
                                      {message.headers.internalDate ? formatDistanceToNow(new Date(parseInt(message.headers.internalDate) * 1000), { addSuffix: true }) : 'Unknown time'}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      {message.flags.flagged && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                                      {message.hasAttachment && <Paperclip className="h-3 w-3 text-gray-400" />}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-1">
                                  <p className={cn(
                                    "text-sm text-gray-700 dark:text-gray-300 line-clamp-2 break-words overflow-hidden",
                                    isUnread ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                  )}>
                                    {message.headers.subject || '(No subject)'}
                                  </p>
                                  <p className={cn(
                                    "text-sm line-clamp-1 mt-1 break-words overflow-hidden",
                                    isUnread ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"
                                  )}>
                                    {message.snippet}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>

              {/* Message Detail Panel */}
              <div className="h-full flex flex-col bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Message Details
                  </h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageDetail
                    message={selectedMessage}
                    mailboxId={mailboxId}
                    onMarkAsRead={(messageId) => console.log('Mark as read:', messageId)}
                    onMarkAsUnread={(messageId) => console.log('Mark as unread:', messageId)}
                    onToggleStar={(messageId) => console.log('Toggle star:', messageId)}
                    onReply={(message) => console.log('Reply to:', message.id)}
                    onForward={(message) => console.log('Forward:', message.id)}
                    onDelete={(messageId) => console.log('Delete:', messageId)}
                    onArchive={(messageId) => console.log('Archive:', messageId)}
                  />
                </div>
              </div>
            </ResizablePanels>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
