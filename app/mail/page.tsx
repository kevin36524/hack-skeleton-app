'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { MailboxSelector } from '@/components/mailbox-selector';
import { AccountSwitcher } from '@/components/account-switcher';
import { FolderSidebar } from '@/components/folder-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageDetail } from '@/components/message-detail';
import { LogOut, Mail, RefreshCw, Menu, X, Users } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSearchParams, useRouter } from 'next/navigation';
import { Message } from '@/lib/types/api';

function MailPageContent() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mailboxId, setMailboxId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Initialize folderId from URL on mount
  useEffect(() => {
    const folderFromUrl = searchParams.get('folder');
    if (folderFromUrl && folderFromUrl !== folderId) {
      setFolderId(folderFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('MailPage: mailboxId:', mailboxId, 'accountId:', accountId, 'folderId:', folderId);
  }, [mailboxId, accountId, folderId]);

  const handleMailboxSelected = (id: string) => {
    console.log('MailPage: Mailbox selected:', id);
    setMailboxId(id);
  };

  const handleAccountSelected = (account: { id: string }) => {
    console.log('MailPage: Account selected:', account.id);
    setAccountId(account.id);
  };

  const handleFolderSelected = (id: string) => {
    setFolderId(id);
    setSelectedMessage(null);
    setMobileView('list');
    // Update URL without causing re-render loop
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('folder', id);
    router.replace(`/mail?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleMessageSelected = (message: Message) => {
    setSelectedMessage(message);
    setMobileView('detail');
  };

  const handleBackToList = () => {
    setMobileView('list');
    setSelectedMessage(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const refreshData = () => {
    window.location.reload();
  };

  const handleViewBySender = () => {
    if (mailboxId && folderId) {
      router.push(`/mail/by-sender?mailboxId=${mailboxId}&folderId=${folderId}`);
    }
  };

  const isReady = mailboxId;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

        {/* Mobile Header */}
        <MobileHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
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
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                onClick={toggleSidebar}
              />
            )}

            {/* Sidebar */}
            <aside className={`
              fixed md:relative inset-y-0 left-0 z-50
              w-64 bg-white dark:bg-gray-800 border-r flex flex-col
              transform transition-transform duration-200 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0
            `}>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Folders</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                {isReady ? (
                  <FolderSidebar
                    mailboxId={mailboxId}
                    accountId={accountId}
                    selectedFolderId={folderId}
                    onFolderSelected={(id) => {
                      handleFolderSelected(id);
                      setSidebarOpen(false);
                    }}
                  />
                ) : (
                  <div className="p-4 text-sm text-gray-500">Loading folders...</div>
                )}
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex">

              {/* Message List */}
              <div className={`
                w-full md:w-96 border-r flex flex-col
                ${mobileView === 'list' ? 'block' : 'hidden md:block'}
              `}>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Messages
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewBySender}
                      disabled={!isReady || !folderId}
                      className="flex items-center space-x-2"
                      title="View messages grouped by sender"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">By Sender</span>
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {isReady ? (
                    <MessageList
                      mailboxId={mailboxId}
                      folderId={folderId}
                      onMessageSelected={handleMessageSelected}
                      selectedMessageId={selectedMessage?.id}
                    />
                  ) : (
                    <div className="p-4 text-sm text-gray-500">Select a folder to view messages</div>
                  )}
                </div>
              </div>

              {/* Message Detail */}
              <div className={`
                flex-1 flex flex-col
                ${mobileView === 'detail' ? 'block' : 'hidden md:block'}
                ${!selectedMessage && 'md:block'}
              `}>
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Message Details
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="md:hidden"
                  >
                    Back to list
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
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function MailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <MailPageContent />
    </Suspense>
  );
}
