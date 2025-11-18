'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('phone-login', {
        phoneNumber,
        name,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon via-indian-red to-saffron flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-maroon">
            Welcome to Sudhakant Sarees
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login or create an account with your phone number
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maroon focus:border-maroon"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your 10-digit mobile number (e.g., 9876543210)
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name (Optional for existing users)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maroon focus:border-maroon"
              />
              <p className="mt-1 text-xs text-gray-500">
                Required for new accounts, optional for existing users
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maroon hover:bg-deep-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Please wait...' : 'Continue'}
          </button>

          <div className="text-sm text-center">
            <Link href="/" className="text-maroon hover:text-deep-maroon font-medium">
              ← Back to Home
            </Link>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="text-xs text-gray-500 text-center space-y-2">
            <p>
              <strong>Note:</strong> We use phone-based authentication for your convenience.
            </p>
            <p>
              No password required - just enter your phone number to login or create an account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
