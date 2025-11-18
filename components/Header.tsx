'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { itemCount } = useCart();

  const categories = [
    { name: 'Silk', href: '/products/silk' },
    { name: 'Cotton', href: '/products/cotton' },
    { name: 'Banarasi', href: '/products/banarasi' },
    { name: 'Kanjivaram', href: '/products/kanjivaram' },
    { name: 'Patola', href: '/products/patola' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-gradient">
              Sudhakant Sarees
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-maroon transition-colors font-medium">
              Home
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-maroon transition-colors font-medium flex items-center">
                Categories
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-saffron hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {category.name} Sarees
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/about" className="text-gray-700 hover:text-maroon transition-colors font-medium">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-maroon transition-colors font-medium">
              Contact
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative text-gray-700 hover:text-maroon transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-saffron text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Login/Account */}
            {status === 'loading' ? (
              <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : session ? (
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
            ) : (
              <Link
                href="/login"
                className="bg-maroon text-white px-4 py-2 rounded-md hover:bg-deep-maroon transition-colors font-medium"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-maroon"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">
            <Link
              href="/"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-500 px-2">Categories</div>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block py-2 pl-4 text-gray-700 hover:text-maroon transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name} Sarees
                </Link>
              ))}
            </div>
            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link
                href="/cart"
                className="flex items-center justify-between py-2 text-gray-700 hover:text-maroon transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Cart
                </span>
                {itemCount > 0 && (
                  <span className="bg-saffron text-white text-xs rounded-full px-2 py-1 font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>

              {session ? (
                <>
                  <div className="text-sm font-semibold text-gray-500 px-2 mt-2">
                    {session.user.name || session.user.phoneNumber}
                  </div>
                  <Link
                    href="/orders"
                    className="block py-2 pl-4 text-gray-700 hover:text-maroon transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/addresses"
                    className="block py-2 pl-4 text-gray-700 hover:text-maroon transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Addresses
                  </Link>
                  <Link
                    href="/profile"
                    className="block py-2 pl-4 text-gray-700 hover:text-maroon transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-left py-2 pl-4 text-gray-700 hover:text-maroon transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 text-center bg-maroon text-white rounded-md hover:bg-deep-maroon transition-colors font-medium mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Create Account
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
