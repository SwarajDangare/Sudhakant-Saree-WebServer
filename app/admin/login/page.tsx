'use client';

import { useState, useEffect, useMemo } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import PasswordInput from '@/components/PasswordInput';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Memoize callbackUrl to prevent unnecessary re-renders
  const callbackUrl = useMemo(
    () => searchParams.get('callbackUrl') || '/admin/dashboard',
    [searchParams]
  );

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    // Only redirect if status is definitely 'authenticated' (not 'loading')
    if (status === 'authenticated' && session) {
      console.log('User already authenticated, redirecting...');
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting sign in...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.error('SignIn error:', result.error);
        setError(result.error);
      } else if (result?.ok) {
        console.log('SignIn successful, redirecting to:', callbackUrl);
        // Use router.push for client-side navigation
        router.push(callbackUrl);
      } else {
        console.error('Unknown signIn state:', result);
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Exception during sign in:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-maroon via-indian-red to-saffron flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-silk-white mx-auto"></div>
          <p className="mt-4 text-silk-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon via-indian-red to-saffron flex items-center justify-center p-4">
      <div className="pattern-bg absolute inset-0 opacity-10"></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-silk-white mb-2">
            Sudhakant Sarees
          </h1>
          <p className="text-silk-white/80 text-lg">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-maroon mb-6 text-center">
            Sign In
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-3 rounded-md font-semibold hover:bg-deep-maroon transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Forgot your password?{' '}
              <a href="mailto:admin@sudhakantsarees.com" className="text-maroon hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-silk-white/60 text-sm">
            © 2025 Sudhakant Sarees. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
