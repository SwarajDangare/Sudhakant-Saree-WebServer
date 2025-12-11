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
import { db } from '@/db'
import {
  homepageSections,
  announcements,
  collections,
  occasions,
  midPageBanner as midPageBannerTable,
  brandStory as brandStoryTable,
  brandStoryStats,
  instagramPosts,
  instagramSettings,
  trustBadges,
  categories,
  products,
  heroSlides,
  featuredCategories,
  featuredBestsellers,
  newArrivalsSettings,
  featuredNewArrivals,
} from '@/db/schema'
import { eq, and, desc, lte, gte, or, isNull } from 'drizzle-orm'

// Force dynamic rendering to avoid build-time prerendering errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getHomepageData() {
  try {
    // Fetch all active homepage sections to determine what to show
    const sections = await db
      .select()
      .from(homepageSections)
      .where(eq(homepageSections.isActive, true))
      .orderBy(homepageSections.displayOrder);

    const sectionMap = sections.reduce((acc, section) => {
      acc[section.sectionKey] = section;
      return acc;
    }, {} as Record<string, any>);

    // Fetch all homepage data in parallel
    const [
      activeHeroSlides,
      activeAnnouncements,
      featuredCollections,
      homepageFeaturedCategories,
      bestsellerProducts,
      newArrivalsConfig,
      newArrivalProducts,
      activeMidPageBanner,
      activeOccasions,
      activeBrandStory,
      activeBrandStoryStats,
      instagramFeed,
      instagramConfig,
      activeTrustBadges,
    ] = await Promise.all([
      // Hero Slides
      db
        .select()
        .from(heroSlides)
        .where(eq(heroSlides.isActive, true))
        .orderBy(heroSlides.displayOrder)
        .limit(5),

      // Announcements
      db
        .select()
        .from(announcements)
        .where(
          and(
            eq(announcements.isActive, true),
            or(
              isNull(announcements.startDate),
              lte(announcements.startDate, new Date())
            ),
            or(
              isNull(announcements.endDate),
              gte(announcements.endDate, new Date())
            )
          )
        )
        .orderBy(announcements.displayOrder)
        .limit(5),

      // Featured Collections (max 2)
      db
        .select()
        .from(collections)
        .where(
          and(
            eq(collections.isActive, true),
            eq(collections.isFeatured, true)
          )
        )
        .orderBy(collections.displayOrder)
        .limit(2),

      // Featured Categories for homepage (max 3)
      db
        .select({
          id: featuredCategories.id,
          categoryId: featuredCategories.categoryId,
          displayOrder: featuredCategories.displayOrder,
          overrideImageUrl: featuredCategories.overrideImageUrl,
          overrideTitle: featuredCategories.overrideTitle,
          overrideDescription: featuredCategories.overrideDescription,
          overrideLinkUrl: featuredCategories.overrideLinkUrl,
          category: categories,
        })
        .from(featuredCategories)
        .leftJoin(categories, eq(featuredCategories.categoryId, categories.id))
        .where(
          and(
            eq(featuredCategories.isActive, true),
            eq(categories.active, true)
          )
        )
        .orderBy(featuredCategories.displayOrder)
        .limit(3),

      // Bestseller Products (max 4)
      db
        .select({
          id: featuredBestsellers.id,
          productId: featuredBestsellers.productId,
          displayOrder: featuredBestsellers.displayOrder,
          product: products,
        })
        .from(featuredBestsellers)
        .leftJoin(products, eq(featuredBestsellers.productId, products.id))
        .where(
          and(
            eq(featuredBestsellers.isActive, true),
            eq(products.active, true)
          )
        )
        .orderBy(featuredBestsellers.displayOrder)
        .limit(4),

      // New Arrivals Settings
      db
        .select()
        .from(newArrivalsSettings)
        .limit(1),

      // New Arrivals - For manual mode
      db
        .select({
          id: featuredNewArrivals.id,
          productId: featuredNewArrivals.productId,
          displayOrder: featuredNewArrivals.displayOrder,
          product: products,
        })
        .from(featuredNewArrivals)
        .leftJoin(products, eq(featuredNewArrivals.productId, products.id))
        .where(
          and(
            eq(featuredNewArrivals.isActive, true),
            eq(products.active, true)
          )
        )
        .orderBy(featuredNewArrivals.displayOrder)
        .limit(8),

      // Mid-Page Banner
      db
        .select()
        .from(midPageBannerTable)
        .where(eq(midPageBannerTable.isActive, true))
        .limit(1),

      // Occasions
      db
        .select()
        .from(occasions)
        .where(eq(occasions.isActive, true))
        .orderBy(occasions.displayOrder)
        .limit(4),

      // Brand Story
      db
        .select()
        .from(brandStoryTable)
        .where(eq(brandStoryTable.isActive, true))
        .limit(1),

      // Brand Story Stats
      db
        .select()
        .from(brandStoryStats)
        .orderBy(brandStoryStats.displayOrder),

      // Instagram Posts
      db
        .select()
        .from(instagramPosts)
        .where(eq(instagramPosts.isActive, true))
        .orderBy(instagramPosts.displayOrder)
        .limit(6),

      // Instagram Settings
      db
        .select()
        .from(instagramSettings)
        .limit(1),

      // Trust Badges
      db
        .select()
        .from(trustBadges)
        .where(eq(trustBadges.isActive, true))
        .orderBy(trustBadges.displayOrder)
        .limit(4),
    ]);

    // Determine which new arrivals to show based on settings
    const newArrivalsMode = newArrivalsConfig[0]?.mode || 'automatic';
    const newArrivalsCount = newArrivalsConfig[0]?.count || 8;

    let finalNewArrivals;
    if (newArrivalsMode === 'manual') {
      finalNewArrivals = newArrivalProducts.map((item: any) => item.product).filter(Boolean);
    } else {
      const automaticNewArrivals = await db
        .select()
        .from(products)
        .where(eq(products.active, true))
        .orderBy(desc(products.createdAt))
        .limit(newArrivalsCount);
      finalNewArrivals = automaticNewArrivals;
    }

    return {
      sections: sectionMap,
      heroSlides: activeHeroSlides,
      announcements: activeAnnouncements,
      collections: featuredCollections,
      categories: homepageFeaturedCategories.map((item: any) => item.category).filter(Boolean),
      bestsellers: bestsellerProducts.map((item: any) => item.product).filter(Boolean),
      newArrivals: finalNewArrivals,
      midPageBanner: activeMidPageBanner[0] || null,
      occasions: activeOccasions,
      brandStory: activeBrandStory[0] || null,
      brandStoryStats: activeBrandStoryStats,
      instagramFeed: instagramFeed,
      instagramHandle: instagramConfig[0]?.instagramHandle || '@sudhakantsarees',
      trustBadges: activeTrustBadges,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return empty data structure as fallback
    return {
      sections: {} as Record<string, any>,
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
      {data.sections.hero_slider?.isActive === true && data.heroSlides.length > 0 && (
        <HeroSlider slides={data.heroSlides} />
      )}

      {/* Shop by Category - 3 category cards with images */}
      {data.sections.shop_by_category?.isActive === true && data.categories.length > 0 && (
        <ShopByCategory categories={data.categories} />
      )}

      {/* Featured Collections - 2-column curated collections */}
      {data.sections.featured_collections?.isActive === true && data.collections.length > 0 && (
        <FeaturedCollections collections={data.collections} />
      )}

      {/* Bestseller Products - 4-column grid with sale badges */}
      {data.sections.bestseller_products?.isActive === true && data.bestsellers.length > 0 && (
        <BestsellerProducts products={data.bestsellers} />
      )}

      {/* Mid-Page Banner - Full width promotional banner */}
      {data.sections.mid_page_banner?.isActive === true && data.midPageBanner && (
        <MidPageBanner banner={data.midPageBanner} />
      )}

      {/* Shop by Occasion - Wedding, Festival, Party, Casual */}
      {data.sections.shop_by_occasion?.isActive === true && data.occasions.length > 0 && (
        <ShopByOccasion occasions={data.occasions} />
      )}

      {/* New Arrivals - Latest products grid */}
      {data.sections.new_arrivals?.isActive === true && data.newArrivals.length > 0 && (
        <NewArrivals products={data.newArrivals} />
      )}

      {/* Brand Story - Heritage and values section */}
      {data.sections.brand_story?.isActive === true && data.brandStory && (
        <BrandStory story={data.brandStory} stats={data.brandStoryStats} />
      )}

      {/* Instagram Feed - Social media integration */}
      {data.sections.instagram_feed?.isActive === true && data.instagramFeed.length > 0 && (
        <InstagramFeed posts={data.instagramFeed} handle={data.instagramHandle} />
      )}

      {/* Trust Badges - Free shipping, secure payment, authentic products, easy returns */}
      {data.sections.trust_badges?.isActive === true && data.trustBadges.length > 0 && (
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
