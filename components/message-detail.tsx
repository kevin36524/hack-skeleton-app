'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Attachment } from '@/lib/types/api';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Star,
  Reply,
  Forward,
  Paperclip,
  Download,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { messageService } from '@/lib/services/message-service';

interface MessageDetailProps {
  message: Message | null;
  mailboxId?: string;
  onToggleStar?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
}

export function MessageDetail({
  message,
  mailboxId,
  onToggleStar,
  onReply,
  onForward
}: MessageDetailProps) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [fullBody, setFullBody] = useState<{ text: string; html?: string } | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState('100%');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch full message body when message changes
  useEffect(() => {
    if (message && mailboxId) {
      const fetchFullBody = async () => {
        setLoadingBody(true);
        setBodyError(null);
        setFullBody(null);

        try {
          const response = await messageService.getFullMessageBody(mailboxId, message.id);
          setFullBody(response.simpleBody);
        } catch (error) {
          console.error('Failed to fetch full message body:', error);
          setBodyError('Failed to load message content');
        } finally {
          setLoadingBody(false);
        }
      };

      fetchFullBody();
    } else {
      setFullBody(null);
      setBodyError(null);
    }
  }, [message?.id, mailboxId]);

  // Handle iframe load and resize - MUST be before any conditional returns
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        const doc = iframe.contentWindow.document;
        const height = doc.body.scrollHeight;
        setIframeHeight(`${height + 32}px`); // Add some padding
      } catch {
        // Fallback if cross-origin issues
        setIframeHeight('100%');
      }
    }
  }, []);

  // Listen for messages from iframe - MUST be before any conditional returns
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'email-height') {
        setIframeHeight(`${event.data.height + 32}px`);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Early return MUST come after all hooks are defined
  if (!message) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a message to view its contents
      </div>
    );
  }

  const getSenderName = (from?: Array<{name?: string; email: string}>) => {
    if (!from || from.length === 0) return 'Unknown';
    const sender = from[0];
    return sender?.name || sender?.email || 'Unknown';
  };

  const getSenderEmail = (from?: Array<{name?: string; email: string}>) => {
    if (!from || from.length === 0) return '';
    const sender = from[0];
    return sender?.email || '';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRecipients = (recipients?: Array<{name?: string; email: string}>) => {
    if (!recipients || recipients.length === 0) return '';
    return recipients
      .map(r => r.name ? `${r.name} <${r.email}>` : r.email)
      .join(', ');
  };

  const downloadAttachment = (attachment: Attachment) => {
    // This would typically involve creating a blob and downloading
    console.log('Downloading attachment:', attachment);
  };

  // Prepare isolated HTML content for iframe
  const getIsolatedHtmlContent = (htmlContent: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* Reset styles to prevent bleeding */
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background: transparent;
    }
    /* Ensure images don't overflow */
    img {
      max-width: 100%;
      height: auto;
    }
    /* Basic table styling reset */
    table {
      max-width: 100%;
    }
    /* Link styling */
    a {
      color: #2563eb;
    }
    /* Prevent horizontal scroll */
    pre, code {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  ${htmlContent}
  <script>
    // Auto-resize parent iframe
    function notifyParent() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: 'email-height', height: height }, '*');
    }
    
    // Notify on load
    window.addEventListener('load', notifyParent);
    
    // Notify on image load
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', notifyParent);
    });
    
    // Initial notification
    notifyParent();
  </script>
</body>
</html>
    `;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {message.headers.subject || '(No subject)'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStar?.(message.id)}
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  message.flags.flagged && 'text-yellow-500 fill-current'
                )}
              />
            </Button>

          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Sender Info */}
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(getSenderName(message.headers.from))}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{getSenderName(message.headers.from)}</p>
              <p className="text-sm text-gray-500">{getSenderEmail(message.headers.from)}</p>
            </div>
            <div className="ml-auto text-sm text-gray-500">
              {message.headers.internalDate ? format(new Date(parseInt(message.headers.internalDate) * 1000), 'PPpp') : 'Unknown date'}
            </div>
          </div>

          <Separator />

          {/* Recipients */}
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">From: </span>
              <span>{formatRecipients(message.headers.from)}</span>
            </div>
            <div>
              <span className="font-medium">To: </span>
              <span>{formatRecipients(message.headers.to)}</span>
            </div>
            {message.headers.replyTo && (
              <div>
                <span className="font-medium">Reply-To: </span>
                <span>{formatRecipients(message.headers.replyTo)}</span>
              </div>
            )}
            {message.headers.inReplyTo && (
              <div>
                <span className="font-medium">In-Reply-To: </span>
                <span className="text-xs font-mono">{message.headers.inReplyTo}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Message Body */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {loadingBody ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading message content...</span>
              </div>
            ) : bodyError ? (
              <div className="text-red-500 py-4">
                {bodyError}
                <div className="mt-2 text-sm text-gray-600">
                  Showing snippet instead:
                </div>
                <div className="whitespace-pre-wrap mt-2 text-gray-700">{message.snippet}</div>
              </div>
            ) : fullBody?.html ? (
              <iframe
                ref={iframeRef}
                srcDoc={getIsolatedHtmlContent(fullBody.html)}
                onLoad={handleIframeLoad}
                style={{
                  width: '100%',
                  height: iframeHeight,
                  border: 'none',
                  background: 'transparent',
                }}
                sandbox="allow-same-origin"
                title="Email content"
              />
            ) : fullBody?.text ? (
              <div className="whitespace-pre-wrap">{fullBody.text}</div>
            ) : (
              <div className="whitespace-pre-wrap">{message.snippet}</div>
            )}
          </div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Attachments</h4>
                <div className="grid gap-2">
                  {message.attachments.map((attachment, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm font-medium">{(attachment.filename as string) || `Attachment ${index + 1}`}</span>
                          <Badge variant="outline" className="text-xs">
                            {(attachment.size as string) || 'Unknown size'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadAttachment(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message Headers */}
          <div>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHeaders(!showHeaders)}
              className="flex items-center space-x-2"
            >
              {showHeaders ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showHeaders ? 'Hide' : 'Show'} headers</span>
            </Button>
            
            {showHeaders && (
              <Card className="mt-2">
                <CardContent className="p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(message, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Action Bar */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onReply?.(message)}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline" size="sm" onClick={() => onForward?.(message)}>
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}