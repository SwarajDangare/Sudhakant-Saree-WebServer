'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>;
  }

  return (
    <div className="relative group">
      <button className="p-2 text-gray-900 hover:text-[#9d2235] transition-colors flex items-center" aria-label="Account">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden">
          {session ? (
            <>
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">{session.user.name || 'User'}</p>
              </div>
              <Link href="/orders" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors">
                My Orders
              </Link>
              <Link href="/addresses" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors">
                My Addresses
              </Link>
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors">
                Profile
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors border-t border-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-50">
                Login
              </Link>
              <Link href="/signup" className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
