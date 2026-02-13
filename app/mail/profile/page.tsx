'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { LogOut, Mail, ArrowLeft, User, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';
import { setAccessToken } from '@/lib/services/gmail-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProfileData {
  profile: string;
  emailsAnalyzed: number;
  analysisTimestamp: string;
}

function ProfilePageContent() {
  const { logout, getValidAccessToken } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure we have a valid access token
      const token = await getValidAccessToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Update token in gmail client
      setAccessToken(token);

      console.log('[PROFILE] Fetching user profile analysis...');

      const response = await fetch('/api/gmail/user-profile?maxEmails=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
      console.log('[PROFILE] Profile loaded:', data.emailsAnalyzed, 'emails analyzed');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [getValidAccessToken]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
  };

  const handleBackToMail = () => {
    router.push('/mail');
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
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
                  onClick={handleBackToMail}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <Mail className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
                  User Profile Analysis
                </h1>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchProfile}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
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
          <div className="h-full max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 border-b px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Email Profile
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-powered analysis of your last 100 read emails
                  </p>
                </div>
                {profile && (
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {profile.emailsAnalyzed} emails analyzed
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Generated: {formatTimestamp(profile.analysisTimestamp)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="h-[calc(100vh-140px)]">
              <div className="p-6">
                {loading && !profile ? (
                  // Loading State
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <div className="mt-8 space-y-3">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mt-8 space-y-3">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ) : error ? (
                  // Error State
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Failed to load profile
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
                      {error}
                    </p>
                    <Button onClick={fetchProfile} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : profile ? (
                  // Profile Content
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                    <div className="p-6">
                      <div className={cn(
                        "max-w-none",
                        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:dark:text-white [&_h1]:mb-4",
                        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-6 [&_h2]:mb-3",
                        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-4 [&_h3]:mb-2",
                        "[&_p]:text-gray-600 [&_p]:dark:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-3",
                        "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5",
                        "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5",
                        "[&_li]:my-1 [&_li]:text-gray-600 [&_li]:dark:text-gray-300",
                        "[&_strong]:font-semibold [&_strong]:text-gray-900 [&_strong]:dark:text-white",
                        "[&_a]:text-purple-600 [&_a]:dark:text-purple-400 [&_a]:underline",
                        "[&_blockquote]:border-l-4 [&_blockquote]:border-purple-300 [&_blockquote]:dark:border-purple-700 [&_blockquote]:pl-4 [&_blockquote]:italic",
                        "[&_code]:bg-gray-100 [&_code]:dark:bg-gray-700 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
                        "[&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-700 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto",
                        "[&_hr]:my-6 [&_hr]:border-gray-200 [&_hr]:dark:border-gray-700"
                      )}>
                        {/* Render markdown content with proper styling */}
                        <div dangerouslySetInnerHTML={{ 
                          __html: profile.profile
                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/`([^`]+)`/g, '<code>$1</code>')
                            .replace(/\n\n/g, '</p><p>')
                            .replace(/^- (.*$)/gim, '<li>$1</li>')
                            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                        }} />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
