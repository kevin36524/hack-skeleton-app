'use client';

import { useState } from 'react';
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
  MoreVertical,
  Paperclip,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageDetailProps {
  message: Message | null;
  onMarkAsRead?: (messageId: string) => void;
  onMarkAsUnread?: (messageId: string) => void;
  onToggleStar?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onArchive?: (messageId: string) => void;
}

export function MessageDetail({
  message,
  onMarkAsRead,
  onMarkAsUnread,
  onToggleStar,
  onReply,
  onForward,
  onDelete,
  onArchive
}: MessageDetailProps) {
  const [showHeaders, setShowHeaders] = useState(false);

  if (!message) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a message to view its contents
      </div>
    );
  }

  const getSenderName = (from: Array<{name?: string; email: string}>) => {
    const sender = from[0];
    return sender?.name || sender?.email || 'Unknown';
  };

  const getSenderEmail = (from: Array<{name?: string; email: string}>) => {
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

  const formatRecipients = (recipients: Array<{name?: string; email: string}>) => {
    return recipients
      .map(r => r.name ? `${r.name} <${r.email}>` : r.email)
      .join(', ');
  };

  const downloadAttachment = (attachment: Attachment) => {
    // This would typically involve creating a blob and downloading
    console.log('Downloading attachment:', attachment);
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onMarkAsRead?.(message.id)}>
                  Mark as read
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMarkAsUnread?.(message.id)}>
                  Mark as unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onForward?.(message)}>
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive?.(message.id)}>
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(message.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <div className="whitespace-pre-wrap">{message.snippet}</div>
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