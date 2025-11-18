import Link from 'next/link';
import { db, sections, categories } from '@/db';
import { eq } from 'drizzle-orm';

export default async function CategorySection() {
  // Fetch all active sections from database
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  // Fetch categories for each section (limited to 3 for preview)
  const sectionsWithCategories = await Promise.all(
    allSections.map(async (section) => {
      const sectionCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.sectionId, section.id))
        .where(eq(categories.active, true))
        .orderBy(categories.order, categories.name)
        .limit(3);

      return {
        ...section,
        categories: sectionCategories,
      };
    })
  );

  return (
    <section className="section-padding bg-silk-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Explore Our Collections
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Dive into our carefully curated collections of traditional and contemporary styles,
            each category showcasing unique artistry and craftsmanship.
          </p>
        </div>

        {/* Sections with Collections */}
        <div className="space-y-16">
          {sectionsWithCategories.map((section) => (
            <div key={section.id}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-maroon mb-2">
                    {section.name}
                  </h3>
                  {section.description && (
                    <p className="text-gray-600">
                      {section.description}
                    </p>
                  )}
                </div>
                <Link
                  href={`/categories/${section.slug}`}
                  className="hidden md:inline-flex items-center text-maroon hover:text-saffron transition-colors font-medium"
                >
                  View All
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Collections Grid */}
              {section.categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {section.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products/${category.slug}`}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-maroon"
                    >
                      {/* Collection Image */}
                      <div className="aspect-video bg-gradient-to-br from-maroon/70 via-indian-red/70 to-saffron/70 relative overflow-hidden">
                        {/* Decorative pattern overlay */}
                        <div className="absolute inset-0 pattern-bg opacity-20"></div>

                        {/* Collection Name */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <h4 className="text-xl font-bold text-white text-center px-4 drop-shadow-lg">
                            {category.name}
                          </h4>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-maroon/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold flex items-center">
                            View Collection
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>

                      {/* Collection Info */}
                      <div className="p-4">
                        <h4 className="font-bold text-maroon mb-1 group-hover:text-saffron transition-colors">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500">No collections available yet</p>
                </div>
              )}

              {/* View All Link (Mobile) */}
              <div className="mt-6 text-center md:hidden">
                <Link
                  href={`/categories/${section.slug}`}
                  className="inline-flex items-center text-maroon hover:text-saffron transition-colors font-medium"
                >
                  View All {section.name}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-block bg-maroon text-white px-8 py-4 rounded-lg font-semibold hover:bg-deep-maroon transition shadow-lg"
          >
            Browse All Categories
          </Link>
        </div>

        {/* Ornamental Divider */}
        <div className="ornament-divider mt-16">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-maroon to-saffron rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
