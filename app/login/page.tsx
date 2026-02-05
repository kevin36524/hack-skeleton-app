'use client';

import '../email.css';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Box, VStack, HStack, Text, Button, Input, Icon, IconButton, Link, DARK_COLOR_MODE_CLASSNAME, LIGHT_COLOR_MODE_CLASSNAME } from '@yahoo/uds';
import { Envelope, Eye, EyeShut, Sun, CrescentMoon } from '@yahoo/uds-icons';
import { UDSIcons } from '@/lib/uds-icons-map';

type TestAccount = {
  id: string;
  email: string;
  oauth_token: string;
  created_at: string;
  is_active: boolean;
};

function HeaderSection() {
  return (
    <VStack gap="2" alignItems="center" justifyContent="center">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        backgroundColor="brand"
        borderRadius="full"
        className="w-12 h-12"
      >
        <Icon name={Envelope} variant="fill" size="md" color="on-color" />
      </Box>
      <Text variant="title3" color="primary">
        Yahoo Mail
      </Text>
    </VStack>
  );
}

function HelpSection() {
  return (
    <VStack gap="1" alignItems="flex-start" justifyContent="flex-start">
      <Text variant="caption1" color="secondary">
        How to get your OAuth token:
      </Text>
      <Link
        href="chrome-extension://odhagnabplejhdpdonnogliflgblpimn/simpleLogin.html"
        target="_blank"
        rel="noopener noreferrer"
        textVariant="caption1"
        variant="tertiary"
      >
        Get Access Token
      </Link>
      <Link
        href="https://chromewebstore.google.com/detail/yahoo-oauth-token-helper/odhagnabplejhdpdonnogliflgblpimn"
        target="_blank"
        rel="noopener noreferrer"
        textVariant="caption1"
        variant="tertiary"
      >
        Install Extension
      </Link>
    </VStack>
  );
}

function LoginFormContent() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>([]);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // false = light mode by default
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle URL query parameter for token
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      const sanitizedToken = urlToken.trim();
      setToken(sanitizedToken);

      if (sanitizedToken.length > 10) {
        handleLoginWithToken(sanitizedToken);
      }
    }
  }, [searchParams]);

  // Fetch test accounts
  useEffect(() => {
    const fetchTestAccounts = async () => {
      try {
        const response = await fetch('/api/test-accounts');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.accounts) {
            setTestAccounts(data.accounts);
          }
        }
      } catch (err) {
        console.error('Failed to fetch test accounts:', err);
      }
    };

    fetchTestAccounts();
  }, []);

  const handleLoginWithToken = async (tokenToLogin: string) => {
    setIsLoading(true);
    setError('');

    try {
      await login(tokenToLogin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLoginWithToken(token);
  };

  const handleTestAccountSelect = (account: TestAccount) => {
    setToken(account.oauth_token);
    handleLoginWithToken(account.oauth_token);
  };

  const validateTokenFormat = (tokenValue: string) => {
    if (!tokenValue || tokenValue.trim().length < 10) {
      return false;
    }
    const tokenPattern = /^[A-Za-z.0-9\-_]+$/;
    return tokenPattern.test(tokenValue.trim());
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      backgroundColor="secondary"
      className={`uds-email min-h-screen ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}
    >
      {/* Theme Toggle */}
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
        spacing="4"
      >
        <IconButton
          key={isDarkMode ? 'dark' : 'light'}
          name={isDarkMode ? CrescentMoon : Sun}
          variant="tertiary"
          size="sm"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        />
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        rowGap="6"
        spacing="6"
        className="flex-1"
      >
        <HeaderSection />

        <Box
          display="flex"
          flexDirection="column"
          rowGap="5"
          backgroundColor="primary"
          borderRadius="xl"
          borderWidth="thin"
          borderColor="secondary"
          spacing="6"
          className="w-full max-w-sm"
        >
          {/* Error Message */}
          {error && (
            <Box
              backgroundColor="alert-secondary"
              borderWidth="thin"
              borderColor="alert"
              borderRadius="md"
              spacing="3"
            >
              <Text variant="caption1" color="alert">
                {error}
              </Text>
            </Box>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <VStack gap="5" alignItems="stretch">
              {/* Token Input */}
              <Box display="flex" flexDirection="column" rowGap="1" className="relative w-full">
                <Input
                  placeholder="Enter your Yahoo OAuth token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError('');
                  }}
                  size="md"
                  required
                  minLength={10}
                  pattern="[A-Za-z.0-9\-_]+"
                  title="Token should only contain letters, numbers, hyphens, and underscores"
                />
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  className="absolute right-2 bottom-1.5"
                >
                  <IconButton
                    name={showToken ? EyeShut : Eye}
                    variant="tertiary"
                    size="xs"
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                    onClick={() => setShowToken(!showToken)}
                  />
                </Box>
              </Box>

              <HelpSection />

              {/* Test Accounts Section */}
              {testAccounts.length > 0 && (
                <VStack gap="2" alignItems="stretch">
                  <HStack justifyContent="space-between" alignItems="center" className="w-full">
                    <Text variant="caption1" color="secondary">
                      Or use a test account
                    </Text>
                    <button
                      type="button"
                      onClick={() => setShowTestAccounts(!showTestAccounts)}
                      className="cursor-pointer"
                    >
                      <Text variant="caption1" color="brand">
                        {showTestAccounts ? 'Hide' : 'Show'} ({testAccounts.length})
                      </Text>
                    </button>
                  </HStack>

                  {showTestAccounts && (
                    <VStack gap="1" className="max-h-48 overflow-y-auto">
                      {testAccounts.map((account) => (
                        <Box
                          key={account.id}
                          backgroundColor="secondary"
                          borderRadius="md"
                          spacing="2"
                          className="cursor-pointer transition-colors hover:bg-[var(--color-bg-tertiary)]"
                          onClick={() => handleTestAccountSelect(account)}
                        >
                          <HStack gap="2" alignItems="center">
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              backgroundColor="brand-secondary"
                              borderRadius="full"
                              className="w-8 h-8 flex-shrink-0"
                            >
                              <Icon name={UDSIcons.User} size="sm" color="brand" />
                            </Box>
                            <VStack gap="0" className="flex-1 min-w-0">
                              <Text variant="caption1" color="primary" className="truncate">
                                {account.email}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              )}

              <Button
                type="submit"
                variant="brand"
                size="md"
                width="full"
                disabled={isLoading || !validateTokenFormat(token)}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </VStack>
          </form>
        </Box>

        <Link
          href="https://developer.yahoo.com/oauth2/guide/flows_authcode/"
          target="_blank"
          rel="noopener noreferrer"
          textVariant="caption2"
          variant="tertiary"
        >
          Learn more about Yahoo OAuth
        </Link>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          backgroundColor="primary"
          className="uds-email min-h-screen"
        >
          <VStack gap="4" alignItems="center">
            <Icon name={UDSIcons.Loader2} size="lg" color="brand" className="animate-spin" />
            <Text variant="body1" color="secondary">
              Loading...
            </Text>
          </VStack>
        </Box>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
