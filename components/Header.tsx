import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();
import { db, sections, categories } from '@/db';
import { eq, and } from 'drizzle-orm';
import MobileMenu from './MobileMenu';

export default async function Header() {
  // Fetch sections and their categories from database
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  const sectionsWithCategories = await Promise.all(
    allSections.map(async (section) => {
      const sectionCategories = await db
        .select()
        .from(categories)
        .where(and(
          eq(categories.sectionId, section.id),
          eq(categories.active, true)
        ))
        .orderBy(categories.order, categories.name);

      return {
        ...section,
        categories: sectionCategories,
      };
    })
  );

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
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-maroon transition-colors font-medium">
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group">
              <Link href="/categories" className="text-gray-700 hover:text-maroon transition-colors font-medium flex items-center">
                Categories
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Mega Dropdown */}
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 max-h-96 overflow-y-auto">
                {sectionsWithCategories.map((section) => (
                  <div key={section.id} className="border-b border-gray-100 last:border-0">
                    <Link
                      href={`/categories/${section.slug}`}
                      className="block px-4 py-3 font-semibold text-maroon hover:bg-saffron/10 transition-colors"
                    >
                      {section.name}
                    </Link>
                    {section.categories.length > 0 && (
                      <div className="pb-2">
                        {section.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/products/${category.slug}`}
                            className="block px-8 py-2 text-sm text-gray-700 hover:bg-saffron hover:text-white transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/about" className="text-gray-700 hover:text-maroon transition-colors font-medium">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-maroon transition-colors font-medium">
              Contact
            </Link>

            {/* Basket Icon with Counter */}
            <Link href="/basket" className="relative text-gray-700 hover:text-maroon transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-saffron text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cart.totalItems > 99 ? '99+' : cart.totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile menu - client component */}
          <MobileMenu sectionsWithCategories={sectionsWithCategories} />
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
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

            {/* Basket Link for Mobile */}
            <Link
              href="/basket"
              className="block py-2 text-gray-700 hover:text-maroon transition-colors font-semibold flex items-center justify-between border-t mt-2 pt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Basket
              </span>
              {cart.totalItems > 0 && (
                <span className="bg-saffron text-white text-xs font-bold rounded-full px-2 py-1">
                  {cart.totalItems}
                </span>
              )}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
