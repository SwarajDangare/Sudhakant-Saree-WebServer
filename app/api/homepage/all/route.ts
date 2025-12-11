import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  homepageSections,
  announcements,
  collections,
  occasions,
  midPageBanner,
  brandStory,
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
} from '@/db/schema';
import { eq, and, desc, lte, gte, or, isNull } from 'drizzle-orm';

// Force dynamic rendering - don't cache at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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

      // Featured Categories for homepage (max 3) - using junction table
      db
        .select({
          id: featuredCategories.id,
          categoryId: featuredCategories.categoryId,
          displayOrder: featuredCategories.displayOrder,
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

      // Bestseller Products (max 4) - using junction table
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

      // New Arrivals - For manual mode (from junction table)
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

      // Mid-Page Banner (single active)
      db
        .select()
        .from(midPageBanner)
        .where(eq(midPageBanner.isActive, true))
        .limit(1),

      // Occasions (max 4)
      db
        .select()
        .from(occasions)
        .where(eq(occasions.isActive, true))
        .orderBy(occasions.displayOrder)
        .limit(4),

      // Brand Story (single active)
      db
        .select()
        .from(brandStory)
        .where(eq(brandStory.isActive, true))
        .limit(1),

      // Brand Story Stats (if brand story exists)
      db
        .select()
        .from(brandStoryStats)
        .orderBy(brandStoryStats.displayOrder),

      // Instagram Posts (max 6)
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

      // Trust Badges (max 4)
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
      // Use manually curated products
      finalNewArrivals = newArrivalProducts.map((item: any) => item.product).filter(Boolean);
    } else {
      // Use automatic mode - fetch newest products
      const automaticNewArrivals = await db
        .select()
        .from(products)
        .where(eq(products.active, true))
        .orderBy(desc(products.createdAt))
        .limit(newArrivalsCount);
      finalNewArrivals = automaticNewArrivals;
    }

    // Build response with all homepage data
    const response = {
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching homepage data:', error);

    // Return empty data structure when database tables don't exist yet
    // This allows the build to pass even before migration is applied
    return NextResponse.json({
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
    });
  }
}
