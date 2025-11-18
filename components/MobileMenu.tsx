'use client';

import Link from 'next/link';
import { useState } from 'react';

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
          </div>
        </nav>
      )}
    </>
  );
}
