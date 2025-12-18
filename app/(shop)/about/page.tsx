import { db, brandStory, brandStoryStats } from '@/db';
import { eq } from 'drizzle-orm';
import BrandStory from '@/components/BrandStory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getBrandStory() {
  try {
    const story = await db
      .select()
      .from(brandStory)
      .where(eq(brandStory.isActive, true))
      .limit(1);

    if (!story || story.length === 0) return null;

    const stats = await db
      .select()
      .from(brandStoryStats)
      .orderBy(brandStoryStats.displayOrder);

    return {
      story: story[0],
      stats,
    };
  } catch (error) {
    console.error('Error fetching brand story:', error);
    return null;
  }
}

export default async function AboutPage() {
  const brandStoryData = await getBrandStory();

  return (
    <div className="min-h-screen bg-silk-white pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-maroon via-indian-red to-saffron text-white pattern-bg py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-silk-white">
            Weaving traditions, creating memories, celebrating heritage.
          </p>
        </div>
      </section>

      {/* Brand Story Section - Fetched from Admin */}
      {brandStoryData && brandStoryData.story && (
        <BrandStory story={brandStoryData.story} stats={brandStoryData.stats} />
      )}

      {/* Fallback content if no brand story is configured */}
      {!brandStoryData && (
        <section className="section-padding">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">
                <h2 className="text-3xl font-bold text-gradient mb-6">Welcome to Sudhakant Sarees</h2>

                <p className="text-gray-700 leading-relaxed">
                  For generations, Sudhakant Sarees has been a trusted name in bringing authentic Indian sarees
                  to discerning customers. Our journey began with a simple vision: to preserve and celebrate
                  the rich heritage of Indian textile craftsmanship.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Each saree in our collection is carefully selected from master weavers across India.
                  From the intricate brocades of Banarasi to the vibrant silks of Kanjivaram, we bring you
                  the finest examples of traditional Indian weaving.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
