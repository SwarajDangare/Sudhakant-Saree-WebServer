import HeroSlider from '@/components/HeroSlider'
import ShopByCategory from '@/components/ShopByCategory'
import FeaturedCollections from '@/components/FeaturedCollections'
import BestsellerProducts from '@/components/BestsellerProducts'
import MidPageBanner from '@/components/MidPageBanner'
import ShopByOccasion from '@/components/ShopByOccasion'
import NewArrivals from '@/components/NewArrivals'
import BrandStory from '@/components/BrandStory'
import InstagramFeed from '@/components/InstagramFeed'
import Features from '@/components/Features'
import Link from 'next/link'

// Force dynamic rendering to avoid build-time prerendering errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomepageData() {
  try {
    // Construct base URL - prioritize Vercel URL for deployments
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

    console.log('[Homepage] Fetching from:', baseUrl);

    const response = await fetch(`${baseUrl}/api/homepage/all`, {
      cache: 'no-store', // Always get fresh data
      next: { revalidate: 0 },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Homepage] API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch homepage data: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Homepage] Data received:', {
      heroSlides: data.heroSlides?.length || 0,
      categories: data.categories?.length || 0,
      bestsellers: data.bestsellers?.length || 0,
      newArrivals: data.newArrivals?.length || 0,
    });

    return data;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return empty data structure as fallback
    return {
      sections: {},
      heroSlides: [],
      announcements: [],
      collections: [],
      categories: [],
      bestsellers: [],
      newArrivals: [],
      midPageBanner: null,
      occasions: [],
      brandStory: null,
      brandStoryStats: [],
      instagramFeed: [],
      instagramHandle: '@sudhakantsarees',
      trustBadges: [],
    };
  }
}

export default async function Home() {
  const data = await getHomepageData();

  return (
    <>
      {/* Hero Slider - Full width banner carousel with video support */}
      {data.sections.hero_slider?.isActive !== false && data.heroSlides.length > 0 && (
        <HeroSlider slides={data.heroSlides} />
      )}

      {/* Shop by Category - 3 category cards with images */}
      {data.sections.shop_by_category?.isActive !== false && data.categories.length > 0 && (
        <ShopByCategory categories={data.categories} />
      )}

      {/* Featured Collections - 2-column curated collections */}
      {data.sections.featured_collections?.isActive !== false && data.collections.length > 0 && (
        <FeaturedCollections collections={data.collections} />
      )}

      {/* Bestseller Products - 4-column grid with sale badges */}
      {data.sections.bestseller_products?.isActive !== false && data.bestsellers.length > 0 && (
        <BestsellerProducts products={data.bestsellers} />
      )}

      {/* Mid-Page Banner - Full width promotional banner */}
      {data.sections.mid_page_banner?.isActive !== false && data.midPageBanner && (
        <MidPageBanner banner={data.midPageBanner} />
      )}

      {/* Shop by Occasion - Wedding, Festival, Party, Casual */}
      {data.sections.shop_by_occasion?.isActive !== false && data.occasions.length > 0 && (
        <ShopByOccasion occasions={data.occasions} />
      )}

      {/* New Arrivals - Latest products grid */}
      {data.sections.new_arrivals?.isActive !== false && data.newArrivals.length > 0 && (
        <NewArrivals products={data.newArrivals} />
      )}

      {/* Brand Story - Heritage and values section */}
      {data.sections.brand_story?.isActive !== false && data.brandStory && (
        <BrandStory story={data.brandStory} stats={data.brandStoryStats} />
      )}

      {/* Instagram Feed - Social media integration */}
      {data.sections.instagram_feed?.isActive !== false && data.instagramFeed.length > 0 && (
        <InstagramFeed posts={data.instagramFeed} handle={data.instagramHandle} />
      )}

      {/* Trust Badges - Free shipping, secure payment, authentic products, easy returns */}
      {data.sections.trust_badges?.isActive !== false && data.trustBadges.length > 0 && (
        <Features badges={data.trustBadges} />
      )}

      {/* Temporary Admin Login Button - Remove before production */}
      <Link
        href="/admin/login"
        className="fixed bottom-6 right-6 bg-maroon text-white px-6 py-3 rounded-full shadow-lg hover:bg-deep-maroon transition-all hover:scale-105 font-semibold z-50 flex items-center gap-2"
        title="Admin Login (Development Only)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        Admin
      </Link>
    </>
  )
}
