'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { MailProvider } from '@/lib/imap/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const PROVIDERS: { id: MailProvider; label: string; placeholder: string; domain: string }[] = [
  {
    id: 'gmail',
    label: 'Google',
    placeholder: 'you@gmail.com',
    domain: 'gmail.com',
  },
  {
    id: 'yahoo',
    label: 'Yahoo',
    placeholder: 'you@yahoo.com',
    domain: 'yahoo.com',
  },
];

const APP_PASSWORD_INSTRUCTIONS: Record<MailProvider, { title: string; steps: string[] }> = {
  gmail: {
    title: 'How to get a Gmail app password',
    steps: [
      'Google Account → Security → 2-Step Verification',
      'Scroll down to App passwords',
      'Select Mail + Other device → Generate',
      'Use the 16-character password above',
    ],
  },
  yahoo: {
    title: 'How to get a Yahoo app password',
    steps: [
      'Yahoo Account Security → Generate app password',
      'Select "Other app" and name it',
      'Copy the generated password',
      'Use that password above (spaces optional)',
    ],
  },
};

function LoginForm() {
  const [provider, setProvider] = useState<MailProvider>('gmail');
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleProviderSwitch = (newProvider: MailProvider) => {
    setProvider(newProvider);
    setEmail('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !appPassword.trim()) {
      setError('Please enter your email and app password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), appPassword: appPassword.trim(), provider });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const instructions = APP_PASSWORD_INSTRUCTIONS[provider];
  const currentProvider = PROVIDERS.find((p) => p.id === provider)!;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Image
              src="/logo.png"
              alt="Oath Mail Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Oath Mail
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your emails
          </p>
        </div>

        {/* Provider switcher */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleProviderSwitch(p.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                provider === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {p.id === 'gmail' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M22 6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  />
                </svg>
              )}
              {p.label}
            </button>
          ))}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in with your {currentProvider.label} address and app password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{currentProvider.label} address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={currentProvider.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appPassword">App password</Label>
                <Input
                  id="appPassword"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <span className="font-medium">Sign in</span>
                )}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                  {instructions.title}
                </h3>
                <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  {instructions.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Credentials are stored locally in your browser only
          </p>
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
