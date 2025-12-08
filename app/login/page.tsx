'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail } from 'lucide-react';

function LoginForm() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();

  // Handle URL query parameter for token
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      // Sanitize the token input
      const sanitizedToken = urlToken.trim();
      setToken(sanitizedToken);

      // Optionally auto-login if token is provided via URL
      if (sanitizedToken.length > 10) {
        handleLoginWithToken(sanitizedToken);
      }
    }
  }, [searchParams]);

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

  const validateTokenFormat = (value: string) => {
    const tokenPattern = /^[A-Za-z.0-9\-_]+$/;
    return tokenPattern.test(value.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Yahoo Mail
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your emails
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your Yahoo OAuth token to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="token">OAuth Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? 'text' : 'password'}
                    placeholder="Enter your Yahoo OAuth token"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      setError('');
                    }}
                    className="pr-10"
                    required
                    minLength={10}
                    pattern="[A-Za-z.0-9\-_]+"
                    title="Token should only contain letters, numbers, hyphens, and underscores"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Your token will be stored locally and persist across sessions.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-100 mb-2">
                  How to get your OAuth token:
                </h3>
                <ol className="text-xs text-purple-800 dark:text-purple-200 space-y-1 list-decimal list-inside">
                  <li>Go to the Yahoo Developer Console</li>
                  <li>Create an app or use an existing one</li>
                  <li>Generate an OAuth 2.0 access token</li>
                  <li>Copy and paste the token above</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !validateTokenFormat(token)}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-4">
          <a
            href="https://developer.yahoo.com/oauth2/guide/flows_authcode/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Learn more about Yahoo OAuth
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
