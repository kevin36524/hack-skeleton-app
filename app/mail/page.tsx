'use client';

import '../email.css';
import { Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/protected-route';
import { Box, HStack, VStack, Text, Icon, IconButton, Button, DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';
import { Sun, CrescentMoon, Cog, MagnifyingGlass, Refresh as RefreshIcon, Add, LogOut } from '@yahoo/uds-icons';
import { AvatarText } from '@yahoo/uds';
import { MailboxSelector } from '@/components/mailbox-selector';
import { AccountSwitcher } from '@/components/account-switcher';
import { FolderSidebar } from '@/components/folder-sidebar';
import { MessageList } from '@/components/message-list';
import { MessageDetail } from '@/components/message-detail';
import { MobileHeader } from '@/components/mobile-header';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSearchParams, useRouter } from 'next/navigation';
import { Message, Account } from '@/lib/types/api';
import { ResizablePanels } from '@/components/ui/resizable-panels';
import { accountService } from '@/lib/services/account-service';
import { Badge } from '@yahoo/uds';

function MailPageContent() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mailboxId, setMailboxId] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [folderId, setFolderId] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [panelSizes, setPanelSizes] = useState<number[]>([25, 35, 40]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Initialize folderId from URL on mount
  useEffect(() => {
    const folderFromUrl = searchParams.get('folder');
    if (folderFromUrl && folderFromUrl !== folderId) {
      setFolderId(folderFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('MailPage: mailboxId:', mailboxId, 'accountId:', selectedAccount?.id, 'folderId:', folderId);
  }, [mailboxId, selectedAccount, folderId]);

  // Load accounts when mailboxId is available
  useEffect(() => {
    const loadAccounts = async () => {
      if (mailboxId) {
        try {
          const enabledAccounts = await accountService.getEnabledAccounts(mailboxId);
          setAccounts(enabledAccounts);
        } catch (err) {
          console.error('Error loading accounts:', err);
        }
      }
    };
    loadAccounts();
  }, [mailboxId]);

  // Load desktop sidebar collapsed state and panel sizes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar-collapsed');
      if (stored !== null) {
        setDesktopSidebarCollapsed(JSON.parse(stored));
      }

      const storedSizes = localStorage.getItem('panel-sizes');
      if (storedSizes !== null) {
        setPanelSizes(JSON.parse(storedSizes));
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error);
    }
  }, []);

  // Save desktop sidebar collapsed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(desktopSidebarCollapsed));
    } catch (error) {
      console.error('Error saving sidebar collapsed state:', error);
    }
  }, [desktopSidebarCollapsed]);

  // Save panel sizes to localStorage
  const handlePanelResize = (sizes: number[]) => {
    setPanelSizes(sizes);
    try {
      localStorage.setItem('panel-sizes', JSON.stringify(sizes));
    } catch (error) {
      console.error('Error saving panel sizes:', error);
    }
  };

  const handleMailboxSelected = (id: string) => {
    console.log('MailPage: Mailbox selected:', id);
    setMailboxId(id);
  };

  const handleAccountSelected = (account: Account) => {
    console.log('MailPage: Account selected:', account.id);
    setSelectedAccount(account);
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'YM';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isReady = mailboxId;

  return (
    <ProtectedRoute>
      <Box
        display="flex"
        flexDirection="column"
        backgroundColor="primary"
        className={`uds-email h-screen w-full ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}
      >
        {/* Mobile Header */}
        <div className="md:hidden">
          <MobileHeader
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onMailboxSelected={handleMailboxSelected}
            onAccountSelected={handleAccountSelected}
            mailboxId={mailboxId}
            onLogout={handleLogout}
            onRefresh={refreshData}
          />
        </div>

        {/* Hidden components for functionality */}
        <div className="hidden">
          <MailboxSelector onMailboxSelected={handleMailboxSelected} />
          <AccountSwitcher
            mailboxId={mailboxId}
            onAccountSelected={handleAccountSelected}
          />
        </div>

        {/* Desktop Header */}
        <Box
          display="flex"
          flexDirection="row"
          spacingHorizontal="4"
          spacingVertical="2"
          borderBottomWidth="thin"
          borderColor="secondary"
          alignItems="center"
          justifyContent="space-between"
          className="hidden md:flex"
        >
          <HStack gap="4" alignItems="center" justifyContent="flex-start">
            <Text variant="title3" color="brand">
              Yahoo Mail
            </Text>
          </HStack>

          <HStack gap="2" alignItems="center" justifyContent="flex-end" className="flex-1 max-w-md">
            <Box
              display="flex"
              flexDirection="row"
              columnGap="2"
              spacing="2"
              backgroundColor="secondary"
              borderRadius="md"
              alignItems="center"
              className="flex-1"
            >
              <Icon name={MagnifyingGlass} size="sm" color="secondary" />
              <Text variant="label2" color="tertiary">
                Search mail
              </Text>
            </Box>
          </HStack>

          <HStack gap="2" alignItems="center" justifyContent="flex-end">
            <IconButton
              key={isDarkMode ? 'dark' : 'light'}
              name={isDarkMode ? CrescentMoon : Sun}
              variant="tertiary"
              size="sm"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            />
            <IconButton
              name={Cog}
              variant="tertiary"
              size="sm"
              aria-label="Settings"
            />
            <Box position="relative">
              <button
                onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                className="cursor-pointer"
              >
                <AvatarText
                  initials={getInitials(selectedAccount?.sendingName || selectedAccount?.email)}
                  size="sm"
                />
              </button>
              {showAccountSwitcher && accounts.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAccountSwitcher(false)}
                  />
                  <Box
                    position="absolute"
                    backgroundColor="primary"
                    borderWidth="thin"
                    borderColor="secondary"
                    borderRadius="md"
                    spacing="2"
                    className="right-0 top-full mt-2 min-w-[280px] z-50 shadow-lg"
                  >
                    <VStack gap="0" alignItems="stretch">
                      {accounts.map((account) => (
                        <Box
                          key={account.id}
                          spacing="3"
                          className="cursor-pointer transition-colors hover:bg-[var(--color-bg-secondary)]"
                          onClick={() => {
                            handleAccountSelected(account);
                            setShowAccountSwitcher(false);
                          }}
                          backgroundColor={account.id === selectedAccount?.id ? "brand-secondary" : undefined}
                        >
                          <HStack gap="2" alignItems="center" justifyContent="space-between">
                            <VStack gap="0" className="flex-1 min-w-0">
                              <Text variant="label2" color="primary" className="truncate">
                                {account.email}
                              </Text>
                              {account.sendingName && (
                                <Text variant="caption2" color="secondary" className="truncate">
                                  {account.sendingName}
                                </Text>
                              )}
                            </VStack>
                            {account.isPrimary && (
                              <Badge variant="brand" size="sm">Primary</Badge>
                            )}
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                </>
              )}
            </Box>
            <IconButton
              name={LogOut}
              variant="tertiary"
              size="sm"
              aria-label="Logout"
              onClick={handleLogout}
            />
          </HStack>
        </Box>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Mobile Layout */}
          <div className="md:hidden h-full flex overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50"
                onClick={toggleSidebar}
              />
            )}

            {/* Mobile Sidebar */}
            <aside className={`
              fixed inset-y-0 left-0 z-50
              w-64 border-r flex flex-col
              transform transition-transform duration-200 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `} style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border-secondary)' }}>
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Folders</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="sr-only">Close</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>×</span>
                </button>
              </div>
              <div className="flex-1">
                {isReady ? (
                  <FolderSidebar
                    mailboxId={mailboxId}
                    account={selectedAccount}
                    selectedFolderId={folderId}
                    onFolderSelected={(id) => {
                      handleFolderSelected(id);
                      setSidebarOpen(false);
                    }}
                  />
                ) : (
                  <div className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading folders...</div>
                )}
              </div>
            </aside>

            {/* Mobile Main Content Area */}
            <div className="flex-1 flex">
              {/* Message List */}
              <div className={`
                w-full md:w-96 border-r flex flex-col
                ${mobileView === 'list' ? 'block' : 'hidden md:block'}
              `}>
                <div className="flex-1 overflow-hidden">
                  {isReady ? (
                    <MessageList
                      mailboxId={mailboxId}
                      folderId={folderId}
                      onMessageSelected={handleMessageSelected}
                      selectedMessageId={selectedMessage?.id}
                    />
                  ) : (
                    <div className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Select a folder to view messages</div>
                  )}
                </div>
              </div>

              {/* Message Detail */}
              <div className={`
                flex-1 flex flex-col
                ${mobileView === 'detail' ? 'block' : 'hidden md:block'}
                ${!selectedMessage && 'md:block'}
              `}>
                <div className="p-4 border-b flex justify-end items-center md:hidden" style={{ borderColor: 'var(--color-border-secondary)' }}>
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 rounded"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                  >
                    Back to list
                  </button>
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

          {/* Desktop Layout with Resizable Panels */}
          <div className="hidden md:block h-full w-full">
            <ResizablePanels
              defaultSizes={panelSizes}
              minSizes={[15, 20, 30]}
              onResize={handlePanelResize}
            >
              {/* Sidebar Panel */}
              <aside className="h-full border-r flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {isReady ? (
                  <FolderSidebar
                    mailboxId={mailboxId}
                    account={selectedAccount}
                    selectedFolderId={folderId}
                    onFolderSelected={handleFolderSelected}
                    isCollapsed={desktopSidebarCollapsed}
                    onCollapsedChange={setDesktopSidebarCollapsed}
                  />
                ) : (
                  <div className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading folders...</div>
                )}
              </aside>

              {/* Message List Panel */}
              <div className="h-full flex flex-col border-r" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                <div className="flex-1 overflow-hidden">
                  {isReady ? (
                    <MessageList
                      mailboxId={mailboxId}
                      folderId={folderId}
                      onMessageSelected={handleMessageSelected}
                      selectedMessageId={selectedMessage?.id}
                    />
                  ) : (
                    <div className="p-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Select a folder to view messages</div>
                  )}
                </div>
              </div>

              {/* Message Detail Panel */}
              <div className="h-full flex flex-col">
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
      </Box>
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
