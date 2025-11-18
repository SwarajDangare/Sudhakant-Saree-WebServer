import Link from 'next/link';
import { db, sections } from '@/db';
import { eq } from 'drizzle-orm';

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

export const metadata = {
  title: 'Browse Categories | Sudhakant Sarees',
  description: 'Explore our wide range of saree categories including traditional silk, cotton, and designer collections.',
};

export default async function CategoriesPage() {
  // Fetch all active sections from database
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  return (
    <div className="min-h-screen bg-silk-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-maroon via-indian-red to-saffron text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Explore Our Categories
          </h1>
          <p className="text-xl text-silk-white max-w-2xl mx-auto">
            Discover our curated collection of traditional and contemporary sarees,
            each category featuring unique styles and craftsmanship.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allSections.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No categories available</h3>
              <p className="text-gray-600">Check back soon for our latest collections!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allSections.map((section) => (
                <Link
                  key={section.id}
                  href={`/categories/${section.slug}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg card-hover bg-white"
                >
                  {/* Category Image Placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-maroon via-indian-red to-saffron relative">
                    {/* Decorative pattern overlay */}
                    <div className="absolute inset-0 pattern-bg opacity-30"></div>

                    {/* Category Icon/Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold">{section.name}</h3>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-maroon/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold flex items-center">
                        View Collections
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-maroon mb-2 group-hover:text-saffron transition-colors">
                      {section.name}
                    </h3>
                    {section.description && (
                      <p className="text-gray-600 text-sm">
                        {section.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
