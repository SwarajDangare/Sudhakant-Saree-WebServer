'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  active: boolean;
}

interface Section {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  active: boolean;
  categories: Category[];
}

interface MobileMenuProps {
  sectionsWithCategories: Section[];
}

export default function MobileMenu({ sectionsWithCategories }: MobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { itemCount } = useCart();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-gray-700 hover:text-maroon"
        aria-label="Toggle mobile menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {/* Categories Section */}
            <div className="space-y-1">
              <Link
                href="/categories"
                className="block py-2 text-sm font-semibold text-maroon"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Categories
              </Link>

              {sectionsWithCategories.map((section) => (
                <div key={section.id} className="ml-2 border-l-2 border-gray-200 pl-2">
                  <Link
                    href={`/categories/${section.slug}`}
                    className="block py-2 text-gray-700 hover:text-maroon transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {section.name}
                  </Link>

                  {section.categories.length > 0 && (
                    <div className="ml-3 space-y-1">
                      {section.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products/${category.slug}`}
                          className="block py-1.5 text-sm text-gray-600 hover:text-maroon transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>

            <Link
              href="/contact"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {/* Cart Link for Mobile */}
            <Link
              href="/cart"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors font-semibold flex items-center justify-between border-t mt-2 pt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
              </span>
              {itemCount > 0 && (
                <span className="bg-saffron text-white text-xs font-bold rounded-full px-2 py-1">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu for Mobile */}
            <div className="border-t border-gray-200 pt-2 mt-2">
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
          </div>
        </nav>
      )}
    </>
  );
}
