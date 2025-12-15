'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, Pause, Volume2, Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PodcastSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string | null;
  loading: boolean;
  emailCount: number;
}

export function PodcastSummaryModal({
  open,
  onOpenChange,
  summary,
  loading,
  emailCount,
}: PodcastSummaryModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio when modal closes
  useEffect(() => {
    if (!open) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
      setAudioUrl(null);
      setAudioError(null);
    }
  }, [open]);

  const handleGenerateAudio = async () => {
    if (!summary) return;

    setAudioLoading(true);
    setAudioError(null);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: summary,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      // Convert base64 to blob and create URL
      const audioBase64 = data.data.audioBase64;
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.data.contentType });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);

      // Create audio element
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', () => {
        setAudioError('Failed to load audio');
        setIsPlaying(false);
      });

      // Auto-play the audio
      audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error generating audio:', error);
      setAudioError(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `podcast-summary-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopySummary = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col" onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            Podcast Email Summary
          </DialogTitle>
          <DialogDescription>
            Summary of {emailCount} {emailCount === 1 ? 'email' : 'emails'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generating your podcast summary...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  This may take a moment
                </p>
              </div>
            </div>
          ) : summary ? (
            <>
              <ScrollArea className="flex-1 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {summary}
                  </p>
                </div>
              </ScrollArea>

              <div className="flex flex-wrap gap-2">
                {!audioUrl ? (
                  <Button
                    onClick={handleGenerateAudio}
                    disabled={audioLoading}
                    className="flex items-center gap-2"
                  >
                    {audioLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Audio...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        Listen to Summary
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={togglePlayPause}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadAudio}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Audio
                    </Button>
                  </>
                )}

                <Button
                  onClick={handleCopySummary}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Summary
                    </>
                  )}
                </Button>
              </div>

              {audioError && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {audioError}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                No summary available
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
