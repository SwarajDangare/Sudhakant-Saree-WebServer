import Link from 'next/link';
import { db, sections, categories } from '@/db';
import { eq, and } from 'drizzle-orm';
import MobileMenu from './MobileMenu';
import CartIcon from './CartIcon';
import UserMenu from './UserMenu';

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
    <header className="bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-[#d4af37] tracking-wide">
              SHREE
            </div>
            <div className="hidden sm:block text-xs uppercase tracking-[0.2em] text-gray-400 mt-1">
              | Sudhakant Sarees
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-[#9d2235] transition-colors">
              New Arrivals
            </Link>

            {/* Section Dropdowns */}
            {sectionsWithCategories.map((section) => (
              <div key={section.id} className="relative group h-20 flex items-center">
                <Link
                  href={`/categories/${section.slug}`}
                  className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-[#9d2235] transition-colors flex items-center"
                >
                  {section.name}
                  {section.categories.length > 0 && (
                    <svg className="w-3 h-3 ml-1 text-gray-400 group-hover:text-[#9d2235]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown for categories */}
                {section.categories.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                    <div className="py-2">
                      {section.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products/${category.slug}`}
                          className="block px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors uppercase tracking-wide"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link href="/about" className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-[#9d2235] transition-colors">
              About
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            {/* User - moved to first */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            {/* Search */}
            <button className="p-2 text-gray-900 hover:text-[#9d2235] transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 text-gray-900 hover:text-[#9d2235] transition-colors" aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Cart */}
            <CartIcon />

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden ml-2">
              <MobileMenu sectionsWithCategories={sectionsWithCategories} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
