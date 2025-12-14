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
    <header className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-golden drop-shadow-lg">
              Sudhakant Sarees
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-golden transition-colors font-medium drop-shadow-md">
              Home
            </Link>

            <Link href="/shop" className="text-white hover:text-golden transition-colors font-medium drop-shadow-md">
              Shop All
            </Link>

            {/* Section Dropdowns */}
            {sectionsWithCategories.map((section) => (
              <div key={section.id} className="relative group">
                <Link
                  href={`/categories/${section.slug}`}
                  className="text-white hover:text-golden transition-colors font-medium flex items-center drop-shadow-md uppercase text-sm"
                >
                  {section.name}
                  {section.categories.length > 0 && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown for categories in this section */}
                {section.categories.length > 0 && (
                  <div className="absolute left-0 mt-2 w-56 bg-white/95 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 max-h-96 overflow-y-auto">
                    <div className="py-2">
                      {section.categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products/${category.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-golden hover:text-white transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link href="/about" className="text-white hover:text-golden transition-colors font-medium drop-shadow-md">
              About Us
            </Link>
            <Link href="/contact" className="text-white hover:text-golden transition-colors font-medium drop-shadow-md">
              Contact
            </Link>

            {/* Search Icon */}
            <button className="text-white hover:text-golden transition-colors drop-shadow-md" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist Icon */}
            <Link href="/wishlist" className="text-white hover:text-golden transition-colors drop-shadow-md" aria-label="Wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Cart Icon - Client Component */}
            <CartIcon />

            {/* User Menu - Client Component */}
            <UserMenu />
          </nav>

          {/* Mobile menu - client component */}
          <MobileMenu sectionsWithCategories={sectionsWithCategories} />
        </div>
      </div>
    </header>
  );
}
