'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type SignupStep = 'details' | 'otp';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const phoneFromUrl = searchParams.get('phone') || '';

  const [step, setStep] = useState<SignupStep>('details');
  const [phoneNumber, setPhoneNumber] = useState(phoneFromUrl);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Address form fields
  const [addressData, setAddressData] = useState({
    name: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Update address name and phone when user enters their name
  useEffect(() => {
    setAddressData(prev => ({
      ...prev,
      name: name,
      phoneNumber: phoneNumber,
    }));
  }, [name, phoneNumber]);

  const handleSendEmailOTP = async () => {
    if (!email.trim() || !name.trim()) {
      setEmailError('Please enter your name and email first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSendingOTP(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setEmailSuccess('OTP sent! Check your email inbox.');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtp.trim() || emailOtp.length !== 6) {
      setEmailError('Please enter the 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setEmailVerified(true);
      setEmailSuccess('✅ Email verified successfully!');
      setEmailOtp('');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // If email is provided but not verified, show error
      if (email.trim() && !emailVerified) {
        throw new Error('Please verify your email address before continuing');
      }

      // Check if phone number is already registered
      const checkResponse = await fetch('/api/customers/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        throw new Error('Phone number already registered. Please login instead.');
      }

      // Validation passed, move to OTP step (account will be created after OTP verification)
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // All OTPs are correct for testing - so proceed to create account

      // Step 1: Create customer account in database
      const signupResponse = await fetch('/api/customers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          name,
          email: emailVerified && email ? email : null,
          address: showAddressForm ? addressData : null,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      // Step 2: Sign in the newly created user
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
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressFieldChange = (field: string, value: string) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon via-indian-red to-saffron flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-maroon mb-2">
            Create Account
          </h2>
          <p className="text-sm text-gray-600">
            {step === 'details' ? 'Join Sudhakant Sarees today' : 'Verify your phone number'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent transition-all"
              />
            </div>

            {/* Optional Email Section */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowEmailSection(!showEmailSection)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 hover:text-maroon transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>Add Email (Optional)</span>
                  {emailVerified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${showEmailSection ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className="text-xs text-gray-500 mt-1 ml-1">
                📧 Get order updates via email
              </p>

              {showEmailSection && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                  {emailError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {emailError}
                    </div>
                  )}
                  {emailSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
                      {emailSuccess}
                    </div>
                  )}

                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={emailVerified}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon disabled:bg-gray-100"
                    />
                  </div>

                  {!emailVerified ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={isSendingOTP || !email.trim()}
                        className="w-full bg-maroon text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-deep-maroon disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOTP ? 'Sending OTP...' : 'Send Verification Code'}
                      </button>

                      {emailSuccess && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon text-center font-mono text-lg"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyEmailOTP}
                            disabled={isVerifyingOTP || emailOtp.length !== 6}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVerifyingOTP ? 'Verifying...' : 'Verify Email'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <span className="text-sm text-green-800">✅ Email verified</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailVerified(false);
                          setEmailOtp('');
                          setEmailSuccess('');
                        }}
                        className="text-xs text-green-700 hover:text-green-900 underline"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Address Section */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-gray-700 hover:text-maroon transition-colors"
              >
                <span>Add Delivery Address (Optional)</span>
                <svg
                  className={`w-5 h-5 transition-transform ${showAddressForm ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAddressForm && (
                <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={addressData.name}
                      onChange={(e) => handleAddressFieldChange('name', e.target.value)}
                      required={showAddressForm}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={addressData.phoneNumber}
                      onChange={(e) => handleAddressFieldChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required={showAddressForm}
                      maxLength={10}
                      className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={addressData.addressLine1}
                    onChange={(e) => handleAddressFieldChange('addressLine1', e.target.value)}
                    required={showAddressForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={addressData.addressLine2}
                    onChange={(e) => handleAddressFieldChange('addressLine2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City *"
                      value={addressData.city}
                      onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                      required={showAddressForm}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={addressData.state}
                      onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                      required={showAddressForm}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={addressData.pincode}
                      onChange={(e) => handleAddressFieldChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required={showAddressForm}
                      maxLength={6}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || phoneNumber.length !== 10 || !name.trim() || (email.trim() !== '' && !emailVerified)}
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
                'Continue'
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-maroon hover:text-deep-maroon font-semibold">
                  Login
                </Link>
              </p>
              <Link href="/" className="block text-sm text-gray-500 hover:text-maroon">
                ← Back to Home
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Signing up as</p>
              <p className="text-lg font-semibold text-gray-900">{name}</p>
              <p className="text-sm text-gray-600">{phoneNumber}</p>
              {emailVerified && email && (
                <p className="text-sm text-green-600 mt-1">✅ {email}</p>
              )}
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
                  Creating Account...
                </span>
              ) : (
                'Verify & Create Account'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-sm text-gray-600 hover:text-maroon"
              >
                ← Edit details
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
