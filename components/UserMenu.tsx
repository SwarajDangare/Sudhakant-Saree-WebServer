'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>;
  }

  if (session) {
    return (
      <div className="relative group">
        <button className="text-gray-700 hover:text-maroon transition-colors font-medium flex items-center">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {session.user.name || 'Account'}
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-saffron hover:text-white transition-colors rounded-t-lg">
            My Orders
          </Link>
          <Link href="/addresses" className="block px-4 py-2 text-gray-700 hover:bg-saffron hover:text-white transition-colors">
            My Addresses
          </Link>
          <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-saffron hover:text-white transition-colors">
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-saffron hover:text-white transition-colors rounded-b-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-maroon text-white px-4 py-2 rounded-md hover:bg-deep-maroon transition-colors font-medium"
    >
      Login
    </Link>
  );
}
