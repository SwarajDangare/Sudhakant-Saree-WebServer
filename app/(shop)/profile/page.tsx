'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState(''); // Track original email
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email verification states
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0); // Countdown for resend button

  // Account deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      const userEmail = session.user.email || '';
      setEmail(userEmail);
      setOriginalEmail(userEmail);
      // If email exists and hasn't changed, consider it verified
      if (userEmail) {
        setEmailVerified(true);
      }
    }
  }, [session]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Check if email has changed
  const emailHasChanged = email !== originalEmail;

  // Handle sending OTP to email
  const handleSendEmailOTP = async () => {
    if (!email) {
      setEmailError('Please enter an email address');
      return;
    }

    // Validate email format
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
        body: JSON.stringify({
          email: email,
          name: name || session?.user?.name || 'Customer',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting with countdown
        if (response.status === 429 && data.remainingSeconds) {
          setResendCountdown(data.remainingSeconds);
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Start countdown for 2 minutes (120 seconds)
      setResendCountdown(120);
      setOtpSent(true);
      setEmailSuccess('OTP sent! Check your email inbox.');
      setEmailOtp('');
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyEmailOTP = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setEmailError('Please enter the 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);
    setEmailError('');

    try {
      const response = await fetch('/api/email/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otp: emailOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setEmailVerified(true);
      setEmailSuccess('✅ Email verified successfully!');
      setEmailOtp('');
      setOtpSent(false);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only save if in editing mode
    if (!isEditing) {
      return;
    }

    // If email has changed and is not empty, require verification
    if (emailHasChanged && email && !emailVerified) {
      setError('Please verify your email address before saving');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Only send verified email or null
      const emailToSave = emailVerified && email ? email : null;

      // Call API to update customer profile
      const response = await fetch('/api/customers/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email: emailToSave }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedCustomer = await response.json();

      // Update local state immediately with new data
      setName(updatedCustomer.name || '');
      const newEmail = updatedCustomer.email || '';
      setEmail(newEmail);
      setOriginalEmail(newEmail);

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedCustomer.name,
          email: updatedCustomer.email,
        },
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setOtpSent(false);
      setEmailOtp('');
      setEmailError('');
      setEmailSuccess('');

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/customers/profile', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete account');
      }

      // Account deleted successfully - sign out and redirect to home
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-maroon mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
              <button
                onClick={() => setSuccess('')}
                className="text-green-700 hover:text-green-900 transition"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={session.user.phoneNumber}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Phone number cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                required
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                  !isEditing ? 'bg-gray-50' : ''
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Reset verification when email changes
                      if (e.target.value !== originalEmail) {
                        setEmailVerified(false);
                        setOtpSent(false);
                        setEmailOtp('');
                        setEmailError('');
                        setEmailSuccess('');
                      } else if (e.target.value === originalEmail && originalEmail) {
                        // If changed back to original, mark as verified
                        setEmailVerified(true);
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="your.email@example.com"
                    className={`flex-1 border border-gray-300 rounded-md px-3 py-2 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                  {isEditing && emailHasChanged && email && !emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOTP}
                      disabled={isSendingOTP || resendCountdown > 0}
                      className="px-4 py-2 bg-maroon text-white rounded-md hover:bg-deep-maroon disabled:opacity-50 whitespace-nowrap"
                    >
                      {isSendingOTP
                        ? 'Sending...'
                        : resendCountdown > 0
                        ? `${Math.floor(resendCountdown / 60)}:${String(resendCountdown % 60).padStart(2, '0')}`
                        : otpSent
                        ? 'Resend Code'
                        : 'Send Code'}
                    </button>
                  )}
                  {isEditing && emailVerified && email && (
                    <span className="flex items-center gap-1 text-green-600 font-medium px-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>

                {/* OTP Input Section */}
                {isEditing && otpSent && !emailVerified && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
                    <p className="text-sm text-blue-800">
                      📧 Verification code sent to <strong>{email}</strong>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setEmailOtp(value);
                        }}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1 border border-blue-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOTP}
                        disabled={isVerifyingOTP || emailOtp.length !== 6}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isVerifyingOTP ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Messages */}
                {emailError && (
                  <p className="text-sm text-red-600 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {emailError}
                  </p>
                )}
                {emailSuccess && (
                  <p className="text-sm text-green-600 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {emailSuccess}
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Add your email to receive automated order confirmations and shipping updates!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    disabled={isSaving || !name.trim()}
                    className="btn-primary px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(session.user.name || '');
                      const userEmail = session.user.email || '';
                      setEmail(userEmail);
                      setOriginalEmail(userEmail);
                      setError('');
                      setSuccess('');
                      // Reset email verification states
                      setEmailVerified(!!userEmail);
                      setOtpSent(false);
                      setEmailOtp('');
                      setEmailError('');
                      setEmailSuccess('');
                    }}
                    disabled={isSaving}
                    className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="btn-primary px-6 py-2 rounded-md"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone Number</span>
              <span className="font-medium">{session.user.phoneNumber}</span>
            </div>
            {email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteConfirmText('');
              setDeleteError('');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ What will be deleted:</p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                    <li>Your profile information</li>
                    <li>All order history and order details</li>
                    <li>All saved addresses</li>
                    <li>Shopping cart items</li>
                    <li>Access to your account</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Please type <strong className="font-mono text-red-600">DELETE</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="Type DELETE here"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-sm text-red-600 mb-4 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {deleteError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
