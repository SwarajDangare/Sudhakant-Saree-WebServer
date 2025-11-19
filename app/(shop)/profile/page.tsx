'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Call API to update customer profile
      const response = await fetch('/api/customers/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedCustomer = await response.json();

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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                placeholder="Add your email address"
                className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                  !isEditing ? 'bg-gray-50' : ''
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll use this to send order updates
              </p>
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
                      setEmail(session.user.email || '');
                      setError('');
                      setSuccess('');
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
                  onClick={() => {
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
              <span className="text-gray-600">Phone Number</span>
              <span className="font-medium">{session.user.phoneNumber}</span>
            </div>
            {session.user.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{session.user.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
