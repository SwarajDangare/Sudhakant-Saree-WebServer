'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

type LoginStep = 'phone' | 'otp';
type SignupStep = 'details' | 'otp';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login state
  const [loginStep, setLoginStep] = useState<LoginStep>('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  
  // Signup state
  const [signupStep, setSignupStep] = useState<SignupStep>('details');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOtp, setSignupOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Address state
  const [addressData, setAddressData] = useState({
    name: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneOtpError, setPhoneOtpError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  
  // OTP sending states
  const [isSendingPhoneOTP, setIsSendingPhoneOTP] = useState(false);
  const [isSendingEmailOTP, setIsSendingEmailOTP] = useState(false);
  const [isVerifyingEmailOTP, setIsVerifyingEmailOTP] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  
  // Countdown timers
  const [phoneResendCountdown, setPhoneResendCountdown] = useState(0);
  const [emailResendCountdown, setEmailResendCountdown] = useState(0);

  // Update address data when name/phone changes
  useEffect(() => {
    if (mode === 'signup') {
      setAddressData(prev => ({
        ...prev,
        name: signupName,
        phoneNumber: signupPhone,
      }));
    }
  }, [signupName, signupPhone, mode]);

  // Countdown timers
  useEffect(() => {
    if (phoneResendCountdown > 0) {
      const timer = setTimeout(() => setPhoneResendCountdown(phoneResendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneResendCountdown]);

  useEffect(() => {
    if (emailResendCountdown > 0) {
      const timer = setTimeout(() => setEmailResendCountdown(emailResendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailResendCountdown]);

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetAllState();
    }
  }, [isOpen, initialMode]);

  const resetAllState = () => {
    setLoginStep('phone');
    setSignupStep('details');
    setLoginPhone('');
    setLoginOtp('');
    setSignupPhone('');
    setSignupName('');
    setSignupEmail('');
    setSignupOtp('');
    setEmailOtp('');
    setShowEmailSection(false);
    setEmailVerified(false);
    setShowAddressForm(false);
    setError('');
    setPhoneOtpError('');
    setEmailError('');
    setEmailSuccess('');
    setPhoneOtpSent(false);
    setPhoneResendCountdown(0);
    setEmailResendCountdown(0);
    setAddressData({
      name: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  if (!isOpen) return null;

  const handleSendPhoneOTP = async (phoneNumber: string) => {
    setIsSendingPhoneOTP(true);
    setPhoneOtpError('');

    try {
      const response = await fetch('/api/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.remainingSeconds) {
          setPhoneResendCountdown(data.remainingSeconds);
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setPhoneResendCountdown(120);
      setPhoneOtpSent(true);
    } catch (err) {
      setPhoneOtpError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSendingPhoneOTP(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!signupEmail.trim() || !signupName.trim()) {
      setEmailError('Please enter your name and email first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSendingEmailOTP(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, name: signupName }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.remainingSeconds) {
          setEmailResendCountdown(data.remainingSeconds);
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      setEmailResendCountdown(120);
      setEmailSuccess('OTP sent! Check your email inbox.');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsSendingEmailOTP(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtp.trim() || emailOtp.length !== 6) {
      setEmailError('Please enter the 6-digit OTP');
      return;
    }

    setIsVerifyingEmailOTP(true);
    setEmailError('');
    setEmailSuccess('');

    try {
      const response = await fetch('/api/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, otp: emailOtp }),
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
      setIsVerifyingEmailOTP(false);
    }
  };

  // LOGIN HANDLERS
  const handleLoginPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/customers/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: loginPhone }),
      });

      const data = await response.json();

      if (data.exists) {
        setLoginStep('otp');
        await handleSendPhoneOTP(loginPhone);
      } else {
        // Switch to signup mode with pre-filled phone
        setMode('signup');
        setSignupPhone(loginPhone);
        setError('Phone number not found. Please sign up.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneOtpError('');
    setIsLoading(true);

    try {
      const verifyResponse = await fetch('/api/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: loginPhone, otp: loginOtp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Invalid OTP');
      }

      const result = await signIn('phone-login', {
        phoneNumber: loginPhone,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        onClose();
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // SIGNUP HANDLERS
  const handleSignupDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (signupEmail.trim() && !emailVerified) {
        throw new Error('Please verify your email address before continuing');
      }

      const checkResponse = await fetch('/api/customers/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: signupPhone }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        throw new Error('Phone number already registered. Please login instead.');
      }

      setSignupStep('otp');
      await handleSendPhoneOTP(signupPhone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneOtpError('');
    setIsLoading(true);

    try {
      const verifyResponse = await fetch('/api/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: signupPhone, otp: signupOtp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Invalid OTP');
      }

      const signupResponse = await fetch('/api/customers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: signupPhone,
          name: signupName,
          email: emailVerified && signupEmail ? signupEmail : null,
          address: showAddressForm ? addressData : null,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      const result = await signIn('phone-login', {
        phoneNumber: signupPhone,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        onClose();
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slideUp my-8 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="p-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-maroon text-center">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600 text-center mt-1">
              {mode === 'login' 
                ? (loginStep === 'phone' ? 'Enter your phone number' : 'Enter the OTP sent to your phone')
                : (signupStep === 'details' ? 'Join Sudhakant Sarees today' : 'Verify your phone number')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => { setMode('login'); resetAllState(); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-maroon border-b-2 border-maroon'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); resetAllState(); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'text-maroon border-b-2 border-maroon'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Forms */}
          <div className="p-6">
            {mode === 'login' ? (
              loginStep === 'phone' ? (
                <form onSubmit={handleLoginPhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition"
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter your 10-digit mobile number</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || loginPhone.length !== 10}
                    className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Checking...' : 'Continue'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginOtpSubmit} className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">{loginPhone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLoginStep('phone'); setLoginOtp(''); setPhoneOtpError(''); setPhoneOtpSent(false); }}
                      className="text-maroon hover:text-deep-maroon font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>

                  {phoneOtpError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {phoneOtpError}
                    </div>
                  )}

                  {phoneOtpSent && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                      📱 OTP sent to {loginPhone}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-semibold"
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoFocus
                    />
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSendPhoneOTP(loginPhone)}
                        disabled={isSendingPhoneOTP || phoneResendCountdown > 0}
                        className="text-sm text-maroon hover:text-deep-maroon font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingPhoneOTP
                          ? 'Sending OTP...'
                          : phoneResendCountdown > 0
                          ? `Resend OTP in ${Math.floor(phoneResendCountdown / 60)}:${String(phoneResendCountdown % 60).padStart(2, '0')}`
                          : phoneOtpSent
                          ? 'Resend OTP'
                          : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || loginOtp.length !== 6}
                    className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </form>
              )
            ) : (
              signupStep === 'details' ? (
                <form onSubmit={handleSignupDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition"
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Optional Email Section */}
                  <div className="border-t border-gray-200 pt-3">
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
                    <p className="text-xs text-gray-500 mt-1">📧 Get order updates via email</p>

                    {showEmailSection && (
                      <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg">
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

                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          disabled={emailVerified}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-maroon disabled:bg-gray-100"
                        />

                        {!emailVerified ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSendEmailOTP}
                              disabled={isSendingEmailOTP || !signupEmail.trim() || emailResendCountdown > 0}
                              className="w-full bg-maroon text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-deep-maroon disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSendingEmailOTP
                                ? 'Sending OTP...'
                                : emailResendCountdown > 0
                                ? `Resend in ${Math.floor(emailResendCountdown / 60)}:${String(emailResendCountdown % 60).padStart(2, '0')}`
                                : emailSuccess
                                ? 'Resend Code'
                                : 'Send Verification Code'}
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
                                  disabled={isVerifyingEmailOTP || emailOtp.length !== 6}
                                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isVerifyingEmailOTP ? 'Verifying...' : 'Verify Email'}
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
                  <div className="border-t border-gray-200 pt-3">
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
                      <div className="mt-3 space-y-3 bg-gray-50 p-3 rounded-lg">
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
                        <div className="grid grid-cols-3 gap-2">
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
                    disabled={isLoading || signupPhone.length !== 10 || !signupName.trim() || (signupEmail.trim() !== '' && !emailVerified)}
                    className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Checking...' : 'Continue'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupOtpSubmit} className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Signing up as</p>
                    <p className="text-lg font-semibold text-gray-900">{signupName}</p>
                    <p className="text-sm text-gray-600">{signupPhone}</p>
                    {emailVerified && signupEmail && (
                      <p className="text-sm text-green-600 mt-1">✅ {signupEmail}</p>
                    )}
                  </div>

                  {phoneOtpError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {phoneOtpError}
                    </div>
                  )}

                  {phoneOtpSent && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                      📱 OTP sent to {signupPhone}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-semibold"
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoFocus
                    />
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSendPhoneOTP(signupPhone)}
                        disabled={isSendingPhoneOTP || phoneResendCountdown > 0}
                        className="text-sm text-maroon hover:text-deep-maroon font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingPhoneOTP
                          ? 'Sending OTP...'
                          : phoneResendCountdown > 0
                          ? `Resend OTP in ${Math.floor(phoneResendCountdown / 60)}:${String(phoneResendCountdown % 60).padStart(2, '0')}`
                          : phoneOtpSent
                          ? 'Resend OTP'
                          : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || signupOtp.length !== 6}
                    className="w-full bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Verify & Create Account'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setSignupStep('details'); setSignupOtp(''); setPhoneOtpError(''); setPhoneOtpSent(false); }}
                      className="text-sm text-gray-600 hover:text-maroon"
                    >
                      ← Edit details
                    </button>
                  </div>
                </form>
              )
            )}
          </div>

          <div className="px-6 pb-6 pt-2 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
