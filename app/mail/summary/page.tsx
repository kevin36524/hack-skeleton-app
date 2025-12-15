'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from '@/components/mailbox-selector';
import { AccountSwitcher } from '@/components/account-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Mail, RefreshCw, Sparkles, ArrowLeft, Inbox, Send, AlertCircle } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';

function SummaryPageContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [mailboxId, setMailboxId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleMailboxSelected = (id: string) => {
    console.log('SummaryPage: Mailbox selected:', id);
    setMailboxId(id);
  };

  const handleAccountSelected = (account: { id: string }) => {
    console.log('SummaryPage: Account selected:', account.id);
    setAccountId(account.id);
  };

  const handleLogout = () => {
    logout();
  };

  const refreshData = () => {
    window.location.reload();
  };

  const goBackToMail = () => {
    router.push('/mail');
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call to generate summary
      // For now, we'll show a placeholder
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSummary({
        totalEmails: 127,
        unreadEmails: 15,
        importantEmails: 3,
        categories: [
          { name: 'Work', count: 45, unread: 8 },
          { name: 'Personal', count: 32, unread: 3 },
          { name: 'Promotions', count: 28, unread: 2 },
          { name: 'Social', count: 22, unread: 2 }
        ],
        recentHighlights: [
          'Meeting reminder for tomorrow at 10 AM',
          'Package delivery notification',
          'Newsletter from your favorite blog'
        ]
      });
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Mobile Header */}
        <MobileHeader
          sidebarOpen={false}
          onToggleSidebar={() => {}}
          onMailboxSelected={handleMailboxSelected}
          onAccountSelected={handleAccountSelected}
          mailboxId={mailboxId}
          onLogout={handleLogout}
          onRefresh={refreshData}
        />

        {/* Desktop Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b hidden md:block">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Mail className="h-8 w-8 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Yahoo Mail</h1>
                <MailboxSelector onMailboxSelected={handleMailboxSelected} />
              </div>

              <div className="flex items-center space-x-4">
                <AccountSwitcher
                  mailboxId={mailboxId}
                  onAccountSelected={handleAccountSelected}
                />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={goBackToMail}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mail
            </Button>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  YMAIL Summary
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Get an AI-powered overview of your mailbox
              </p>
            </div>

            {/* Summary Cards */}
            {!summary ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Generate Your Email Summary</CardTitle>
                  <CardDescription>
                    Click the button below to generate an AI-powered summary of your emails
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={generateSummary}
                    disabled={loading || !mailboxId}
                    className="w-full md:w-auto"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                  {!mailboxId && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Please select a mailbox first
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Inbox className="h-5 w-5 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {summary.totalEmails}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Unread Emails
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Send className="h-5 w-5 text-purple-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {summary.unreadEmails}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Important
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {summary.importantEmails}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Email Categories</CardTitle>
                    <CardDescription>
                      Your emails organized by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.categories.map((category: any) => (
                        <div
                          key={category.name}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-600 rounded-full" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Total: {category.count}
                            </span>
                            {category.unread > 0 && (
                              <span className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full">
                                {category.unread} unread
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Highlights</CardTitle>
                    <CardDescription>
                      Key points from your recent emails
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.recentHighlights.map((highlight: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Regenerate Button */}
                <div className="flex justify-center">
                  <Button onClick={generateSummary} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Summary
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SummaryPageContent />
    </Suspense>
  );
}
