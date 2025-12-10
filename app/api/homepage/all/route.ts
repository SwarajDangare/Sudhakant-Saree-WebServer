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
      activeAnnouncements,
      featuredCollections,
      featuredCategories,
      bestsellerProducts,
      newArrivalProducts,
      activeMidPageBanner,
      activeOccasions,
      activeBrandStory,
      activeBrandStoryStats,
      instagramFeed,
      instagramConfig,
      activeTrustBadges,
    ] = await Promise.all([
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
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.active, true),
            eq(categories.featuredOnHome, true)
          )
        )
        .orderBy(categories.homeDisplayOrder)
        .limit(3),

      // Bestseller Products (max 4)
      db
        .select()
        .from(products)
        .where(
          and(
            eq(products.active, true),
            eq(products.isBestseller, true)
          )
        )
        .orderBy(products.bestsellerRank)
        .limit(4),

      // New Arrivals (max 4)
      db
        .select()
        .from(products)
        .where(
          and(
            eq(products.active, true),
            eq(products.isNewArrival, true),
            or(
              isNull(products.newArrivalUntil),
              gte(products.newArrivalUntil, new Date())
            )
          )
        )
        .orderBy(desc(products.createdAt))
        .limit(4),

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

    // Build response with all homepage data
    const response = {
      sections: sectionMap,
      announcements: activeAnnouncements,
      collections: featuredCollections,
      categories: featuredCategories,
      bestsellers: bestsellerProducts,
      newArrivals: newArrivalProducts,
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
