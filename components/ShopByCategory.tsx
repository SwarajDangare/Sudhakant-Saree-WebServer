import Link from 'next/link';
import Image from 'next/image';
import { db, sections, categories } from '@/db';
import { eq, and } from 'drizzle-orm';

export default async function ShopByCategory() {
  // Fetch sections with their categories
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name)
    .limit(6); // Show top 6 categories

  const sectionsWithCategories = await Promise.all(
    allSections.map(async (section) => {
      const sectionCategories = await db
        .select()
        .from(categories)
        .where(and(
          eq(categories.sectionId, section.id),
          eq(categories.active, true)
        ))
        .orderBy(categories.order, categories.name)
        .limit(1); // Get first category for each section

      return {
        ...section,
        category: sectionCategories[0],
      };
    })
  );

  // Filter out sections without categories
  const validSections = sectionsWithCategories.filter(s => s.category);

  if (validSections.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Decorative element */}
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-maroon mb-4">
            SHOP BY CATEGORY
          </h2>

          {/* Decorative element */}
          <div className="flex items-center justify-center mt-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 20, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {validSections.slice(0, 3).map((section) => (
            <Link
              key={section.id}
              href={`/categories/${section.slug}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="aspect-[4/5] relative bg-gradient-to-br from-maroon/80 via-indian-red/80 to-saffron/80">
                {/* Pattern overlay */}
                <div className="absolute inset-0 pattern-bg opacity-20"></div>

                {/* Content overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/90 via-maroon/40 to-transparent flex items-end justify-center p-6">
                  {/* Category Name with Decorative Element */}
                  <div className="text-center">
                    {/* Decorative icon */}
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-0.5 bg-golden"></div>
                      <svg className="w-8 h-8 mx-2 text-golden" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15 8.5L22 9.3L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.3L9 8.5L12 2Z" />
                      </svg>
                      <div className="w-12 h-0.5 bg-golden"></div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {section.name}
                    </h3>

                    {/* Decorative underline */}
                    <div className="w-24 h-1 bg-golden mx-auto"></div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-maroon/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
