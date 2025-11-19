'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type LoginStep = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if phone number exists
      const response = await fetch('/api/customers/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.exists) {
        // Phone number exists, show OTP field
        setStep('otp');
      } else {
        // Phone number doesn't exist, redirect to signup
        router.push(`/signup?phone=${encodeURIComponent(phoneNumber)}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // All OTPs are correct for testing
      const result = await signIn('phone-login', {
        phoneNumber,
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

  const handleEditPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon via-indian-red to-saffron flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-maroon mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent transition-all text-lg"
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter your 10-digit mobile number
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || phoneNumber.length !== 10}
              className="w-full py-3 px-4 bg-maroon text-white rounded-lg font-semibold text-lg hover:bg-deep-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </span>
              ) : (
                'Login'
              )}
            </button>

            <div className="text-center">
              <Link href="/" className="text-sm text-maroon hover:text-deep-maroon font-medium">
                ← Back to Home
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">{phoneNumber}</p>
              </div>
              <button
                type="button"
                onClick={handleEditPhone}
                className="text-maroon hover:text-deep-maroon font-medium text-sm"
              >
                Edit
              </button>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold"
                autoFocus
              />
              <p className="mt-2 text-xs text-center text-gray-500">
                For testing: Any 6-digit code will work
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 px-4 bg-maroon text-white rounded-lg font-semibold text-lg hover:bg-deep-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify & Login'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleEditPhone}
                className="text-sm text-gray-600 hover:text-maroon"
              >
                ← Use different number
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
