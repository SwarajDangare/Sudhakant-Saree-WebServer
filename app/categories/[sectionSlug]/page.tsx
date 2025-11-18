import Link from 'next/link';
import { db, sections, categories } from '@/db';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

interface PageProps {
  params: {
    sectionSlug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.slug, params.sectionSlug));

  if (!section) {
    return {
      title: 'Category Not Found | Sudhakant Sarees',
    };
  }

  return {
    title: `${section.name} Collections | Sudhakant Sarees`,
    description: section.description || `Browse our ${section.name} collection featuring various styles and designs.`,
  };
}

export default async function SectionDetailPage({ params }: PageProps) {
  // Fetch the section
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.slug, params.sectionSlug));

  if (!section) {
    notFound();
  }

  // Fetch all active categories in this section
  const sectionCategories = await db
    .select()
    .from(categories)
    .where(and(
      eq(categories.sectionId, section.id),
      eq(categories.active, true)
    ))
    .orderBy(categories.order, categories.name);

  return (
    <div className="min-h-screen bg-silk-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-maroon">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/categories" className="text-gray-500 hover:text-maroon">Categories</Link>
            <span className="text-gray-400">/</span>
            <span className="text-maroon font-semibold">{section.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-maroon via-indian-red to-saffron text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {section.name}
            </h1>
            {section.description && (
              <p className="text-xl text-silk-white max-w-3xl mx-auto">
                {section.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-maroon mb-2">
              Our Collections
            </h2>
            <p className="text-gray-600">
              Browse through our {sectionCategories.length} unique collection{sectionCategories.length !== 1 ? 's' : ''} in {section.name}
            </p>
          </div>

          {sectionCategories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No collections available</h3>
              <p className="text-gray-600 mb-6">
                We're working on adding new collections. Check back soon!
              </p>
              <Link
                href="/categories"
                className="inline-block bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition"
              >
                Browse Other Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products/${category.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-transparent hover:border-maroon"
                >
                  {/* Collection Image Placeholder */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-maroon/80 via-indian-red/80 to-saffron/80 relative overflow-hidden">
                    {/* Decorative pattern overlay */}
                    <div className="absolute inset-0 pattern-bg opacity-20"></div>

                    {/* Collection Name Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <h3 className="text-2xl font-bold drop-shadow-lg">
                          {category.name}
                        </h3>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-maroon/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold flex items-center">
                        View Products
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Collection Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-maroon mb-2 group-hover:text-saffron transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back to Categories */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center text-maroon hover:text-saffron transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Categories
          </Link>
        </div>
      </section>
    </div>
  );
}
