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
  heroSlides,
  newArrivalsSettings,
  sections,
  categories,
  products,
  featuredCategories,
  featuredBestsellers,
} from '@/db/schema';

export async function POST() {
  try {
    // 1. Seed Homepage Sections Control (check if already exists)
    const existingSections = await db.select().from(homepageSections);

    if (existingSections.length === 0) {
      await db.insert(homepageSections).values([
        { id: crypto.randomUUID(), sectionKey: 'hero_slider', sectionName: 'Hero Slider', displayOrder: 1, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'promo_bar', sectionName: 'Announcement Bar', displayOrder: 2, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'shop_by_category', sectionName: 'Shop by Category', displayOrder: 3, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'featured_collections', sectionName: 'Featured Collections', displayOrder: 4, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'bestseller_products', sectionName: 'Bestseller Products', displayOrder: 5, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'mid_page_banner', sectionName: 'Mid-Page Banner', displayOrder: 6, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'shop_by_occasion', sectionName: 'Shop by Occasion', displayOrder: 7, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'new_arrivals', sectionName: 'New Arrivals', displayOrder: 8, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'brand_story', sectionName: 'Brand Story', displayOrder: 9, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'instagram_feed', sectionName: 'Instagram Feed', displayOrder: 10, isActive: true, description: null },
        { id: crypto.randomUUID(), sectionKey: 'trust_badges', sectionName: 'Trust Badges', displayOrder: 11, isActive: true, description: null },
      ]);
    }

    // 2. Seed Announcements (check if already exists)
    const existingAnnouncements = await db.select().from(announcements);
    if (existingAnnouncements.length === 0) {
      await db.insert(announcements).values([
      {
        id: crypto.randomUUID(),
        text: '🎉 FLAT 10% OFF on your first order | Use code',
        highlightText: 'WELCOME10',
        linkUrl: '/offers',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        text: '🚚 FREE Shipping on orders above ₹999 across India',
        linkUrl: '/shipping',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        text: '✨ NEW Collection Launch | Premium Designer Sarees',
        highlightText: 'SHOP NOW',
        linkUrl: '/collections/designer',
        displayOrder: 3,
        isActive: true,
      },
    ]);
    }

    // 3. Seed Collections (check if already exists)
    const existingCollections = await db.select().from(collections);
    if (existingCollections.length === 0) {
      await db.insert(collections).values([
      {
        id: crypto.randomUUID(),
        name: 'Wedding Special',
        slug: 'wedding-special',
        tagline: 'Bridal Elegance',
        description: 'Exquisite sarees for your special day',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
        imagePublicId: 'demo/accessories-bag',
        linkUrl: '/collections/wedding',
        productsCount: 25,
        isFeatured: true,
        displayOrder: 1,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'Silk Collection',
        slug: 'silk-collection',
        tagline: 'Pure Elegance',
        description: 'Handpicked pure silk sarees',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
        imagePublicId: 'demo/leather-bag',
        linkUrl: '/collections/silk',
        productsCount: 40,
        isFeatured: true,
        displayOrder: 2,
        isActive: true,
      },
    ]);
    }

    // 4. Seed Occasions (check if already exists)
    const existingOccasions = await db.select().from(occasions);
    if (existingOccasions.length === 0) {
      await db.insert(occasions).values([
      {
        id: crypto.randomUUID(),
        name: 'Wedding',
        slug: 'wedding',
        icon: '💍',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
        imagePublicId: 'demo/accessories-bag',
        linkUrl: '/categories?occasion=wedding',
        gradientFrom: 'rgba(219, 39, 119, 0.8)',
        gradientTo: 'rgba(220, 38, 38, 0.8)',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'Festival',
        slug: 'festival',
        icon: '🎉',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
        imagePublicId: 'demo/leather-bag',
        linkUrl: '/categories?occasion=festival',
        gradientFrom: 'rgba(147, 51, 234, 0.8)',
        gradientTo: 'rgba(99, 102, 241, 0.8)',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'Party',
        slug: 'party',
        icon: '🥳',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
        imagePublicId: 'demo/shoes',
        linkUrl: '/categories?occasion=party',
        gradientFrom: 'rgba(37, 99, 235, 0.8)',
        gradientTo: 'rgba(6, 182, 212, 0.8)',
        displayOrder: 3,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        name: 'Casual',
        slug: 'casual',
        icon: '👗',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
        imagePublicId: 'demo/analog',
        linkUrl: '/categories?occasion=casual',
        gradientFrom: 'rgba(5, 150, 105, 0.8)',
        gradientTo: 'rgba(20, 184, 166, 0.8)',
        displayOrder: 4,
        isActive: true,
      },
    ]);
    }

    // 5. Seed Mid-Page Banner (check if already exists)
    const existingBanner = await db.select().from(midPageBanner);
    if (existingBanner.length === 0) {
      await db.insert(midPageBanner).values({
      id: crypto.randomUUID(),
      title: 'Wedding Season Sale',
      subtitle: 'EXCLUSIVE OFFER',
      description: 'Get up to 50% OFF on bridal collection',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
      imagePublicId: 'demo/leather-bag',
      linkUrl: '/sale/wedding-season',
      linkText: 'Shop Now',
      isActive: true,
    });
    }

    // 6. Seed Brand Story (check if already exists)
    const existingStory = await db.select().from(brandStory);
    let storyId: string;

    if (existingStory.length === 0) {
      storyId = crypto.randomUUID();
      await db.insert(brandStory).values({
      id: storyId,
      heading: 'Weaving Traditions, Creating Memories',
      subtitle: 'About Us',
      description: 'For over three generations, Sudhakant Sarees has been the epitome of authentic Indian craftsmanship. Each saree in our collection tells a story of dedication, artistry, and timeless elegance.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
      imagePublicId: 'demo/accessories-bag',
      buttonText: 'Our Story',
      buttonLink: '/about',
      isActive: true,
    });
    } else {
      storyId = existingStory[0].id;
    }

    // 7. Seed Brand Story Stats (check if already exists)
    const existingStats = await db.select().from(brandStoryStats);
    if (existingStats.length === 0) {
      await db.insert(brandStoryStats).values([
      {
        id: crypto.randomUUID(),
        brandStoryId: storyId,
        label: 'Years of Heritage',
        value: '50+',
        displayOrder: 1,
      },
      {
        id: crypto.randomUUID(),
        brandStoryId: storyId,
        label: 'Master Artisans',
        value: '200+',
        displayOrder: 2,
      },
      {
        id: crypto.randomUUID(),
        brandStoryId: storyId,
        label: 'Happy Customers',
        value: '10K+',
        displayOrder: 3,
      },
    ]);
    }

    // 8. Seed Instagram Posts (check if already exists)
    const existingPosts = await db.select().from(instagramPosts);
    if (existingPosts.length === 0) {
      await db.insert(instagramPosts).values([
      {
        id: crypto.randomUUID(),
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
        imagePublicId: 'demo/accessories-bag',
        postUrl: 'https://instagram.com/p/example1',
        caption: 'Beautiful silk saree',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
        imagePublicId: 'demo/leather-bag',
        postUrl: 'https://instagram.com/p/example2',
        caption: 'Wedding collection',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
        imagePublicId: 'demo/shoes',
        postUrl: 'https://instagram.com/p/example3',
        caption: 'Festive wear',
        displayOrder: 3,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
        imagePublicId: 'demo/analog',
        postUrl: 'https://instagram.com/p/example4',
        caption: 'Designer collection',
        displayOrder: 4,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
        imagePublicId: 'demo/accessories-bag',
        postUrl: 'https://instagram.com/p/example5',
        caption: 'Cotton sarees',
        displayOrder: 5,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
        imagePublicId: 'demo/leather-bag',
        postUrl: 'https://instagram.com/p/example6',
        caption: 'Bridal special',
        displayOrder: 6,
        isActive: true,
      },
    ]);
    }

    // 9. Seed Instagram Settings (check if already exists)
    const existingInstagramSettings = await db.select().from(instagramSettings);
    if (existingInstagramSettings.length === 0) {
      await db.insert(instagramSettings).values({
      id: crypto.randomUUID(),
      instagramHandle: '@sudhakantsarees',
      profileUrl: 'https://instagram.com/sudhakantsarees',
      autoSync: false,
      maxPosts: 6,
    });
    }

    // 10. Seed Trust Badges (check if already exists)
    const existingBadges = await db.select().from(trustBadges);
    if (existingBadges.length === 0) {
      await db.insert(trustBadges).values([
      {
        id: crypto.randomUUID(),
        title: 'FREE SHIPPING',
        description: 'Free shipping on orders above ₹999 across India',
        iconType: 'shipping',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        title: 'SECURE PAYMENT',
        description: '100% secure payment with COD & online options',
        iconType: 'payment',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        title: '100% AUTHENTIC',
        description: 'Original handloom sarees with quality guarantee',
        iconType: 'authentic',
        displayOrder: 3,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        title: 'EASY RETURNS',
        description: '7-day easy return & exchange policy',
        iconType: 'returns',
        displayOrder: 4,
        isActive: true,
      },
    ]);
    }

    // 11. Seed Hero Slides (check if already exists)
    const existingSlides = await db.select().from(heroSlides);
    if (existingSlides.length === 0) {
      await db.insert(heroSlides).values([
      {
        id: crypto.randomUUID(),
        title: 'Exquisite Handloom Sarees',
        subtitle: 'NEW COLLECTION',
        description: 'Discover the finest handcrafted sarees for every occasion',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
        imagePublicId: 'demo/accessories-bag',
        ctaText: 'Shop Now',
        ctaLink: '/collections',
        displayOrder: 1,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        title: 'Wedding Season Sale',
        subtitle: 'SPECIAL OFFER',
        description: 'Up to 50% OFF on premium bridal collection',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
        imagePublicId: 'demo/leather-bag',
        ctaText: 'Explore Collection',
        ctaLink: '/collections/wedding',
        displayOrder: 2,
        isActive: true,
      },
      {
        id: crypto.randomUUID(),
        title: 'Pure Silk Elegance',
        subtitle: 'EXCLUSIVE DESIGNS',
        description: 'Handpicked pure silk sarees from master artisans',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
        imagePublicId: 'demo/shoes',
        ctaText: 'View Collection',
        ctaLink: '/collections/silk',
        displayOrder: 3,
        isActive: true,
      },
    ]);
    }

    // 12. Seed New Arrivals Settings (check if already exists)
    const existingNewArrivalsSettings = await db.select().from(newArrivalsSettings);
    if (existingNewArrivalsSettings.length === 0) {
      await db.insert(newArrivalsSettings).values({
      id: crypto.randomUUID(),
      mode: 'automatic', // Show newest products automatically
      count: 8, // Show 8 newest products
    });
    }

    // 13. Seed Sections (Product Categories) - Check if already exists
    const existingSections = await db.select().from(sections);
    let sectionIds: Record<string, string> = {};

    if (existingSections.length === 0) {
      const newSections = await db.insert(sections).values([
        {
          id: crypto.randomUUID(),
          name: 'Traditional Sarees',
          slug: 'traditional',
          description: 'Timeless traditional sarees for every occasion',
          order: 1,
          active: true,
        },
        {
          id: crypto.randomUUID(),
          name: 'Designer Collection',
          slug: 'designer',
          description: 'Exclusive designer sarees handpicked by experts',
          order: 2,
          active: true,
        },
      ]).returning();

      sectionIds = {
        traditional: newSections[0].id,
        designer: newSections[1].id,
      };
    } else {
      // Use existing sections
      sectionIds = {
        traditional: existingSections[0].id,
        designer: existingSections[1]?.id || existingSections[0].id,
      };
    }

    // 14. Seed Categories - Check if already exists
    const existingCategories = await db.select().from(categories);
    let categoryIds: string[] = [];

    if (existingCategories.length === 0) {
      const newCategories = await db.insert(categories).values([
        {
          id: crypto.randomUUID(),
          sectionId: sectionIds.traditional,
          name: 'Silk Sarees',
          slug: 'silk-sarees',
          description: 'Pure silk sarees with rich textures and elegant designs',
          order: 1,
          active: true,
          featuredOnHome: true,
          homeDisplayOrder: 1,
          homeTagline: 'Pure Elegance',
          homeDescription: 'Handwoven pure silk sarees',
        },
        {
          id: crypto.randomUUID(),
          sectionId: sectionIds.traditional,
          name: 'Cotton Sarees',
          slug: 'cotton-sarees',
          description: 'Comfortable cotton sarees perfect for daily wear',
          order: 2,
          active: true,
          featuredOnHome: true,
          homeDisplayOrder: 2,
          homeTagline: 'Comfort & Style',
          homeDescription: 'Breathable cotton sarees',
        },
        {
          id: crypto.randomUUID(),
          sectionId: sectionIds.designer,
          name: 'Designer Sarees',
          slug: 'designer-sarees',
          description: 'Contemporary designer sarees with modern aesthetics',
          order: 3,
          active: true,
          featuredOnHome: true,
          homeDisplayOrder: 3,
          homeTagline: 'Modern Elegance',
          homeDescription: 'Exclusive designer collection',
        },
      ]).returning();

      categoryIds = newCategories.map(cat => cat.id);
    } else {
      categoryIds = existingCategories.slice(0, 3).map(cat => cat.id);
    }

    // 15. Seed Products - Check if already exists
    const existingProducts = await db.select().from(products);
    let productIds: string[] = [];

    if (existingProducts.length === 0 && categoryIds.length > 0) {
      const newProducts = await db.insert(products).values([
        {
          id: crypto.randomUUID(),
          categoryId: categoryIds[0],
          name: 'Royal Blue Kanjivaram Silk Saree',
          description: 'Exquisite Kanjivaram silk saree with traditional zari work and intricate border designs. Perfect for weddings and special occasions.',
          price: '8999.00',
          discountType: 'PERCENTAGE',
          discountValue: '10',
          material: 'Pure Silk',
          length: '6.3 meters with blouse piece',
          blousePieceIncluded: true,
          workType: 'Handloom with Zari Work',
          borderType: 'Traditional Zari Border',
          occasion: 'Wedding, Festival',
          careInstructions: 'Dry clean only',
          stockQuantity: 10,
          featured: true,
          active: true,
        },
        {
          id: crypto.randomUUID(),
          categoryId: categoryIds[0],
          name: 'Maroon Banarasi Silk Saree',
          description: 'Elegant Banarasi silk saree with golden zari motifs and rich texture. A timeless piece for traditional ceremonies.',
          price: '7499.00',
          material: 'Banarasi Silk',
          length: '6.3 meters with blouse piece',
          blousePieceIncluded: true,
          workType: 'Pure Zari Work',
          occasion: 'Wedding, Festival, Party',
          careInstructions: 'Dry clean recommended',
          stockQuantity: 8,
          featured: true,
          active: true,
        },
        {
          id: crypto.randomUUID(),
          categoryId: categoryIds[1],
          name: 'Floral Print Cotton Saree',
          description: 'Lightweight cotton saree with beautiful floral prints. Comfortable for daily wear and casual occasions.',
          price: '1999.00',
          discountType: 'FLAT',
          discountValue: '200',
          material: 'Pure Cotton',
          length: '6 meters with blouse piece',
          blousePieceIncluded: true,
          workType: 'Screen Print',
          occasion: 'Casual, Office Wear',
          careInstructions: 'Machine wash gentle',
          stockQuantity: 25,
          featured: true,
          active: true,
        },
        {
          id: crypto.randomUUID(),
          categoryId: categoryIds[2],
          name: 'Contemporary Designer Saree',
          description: 'Modern designer saree with unique patterns and contemporary styling. Perfect for cocktail parties and evening events.',
          price: '5999.00',
          material: 'Georgette with Embellishments',
          length: '6 meters with unstitched blouse',
          blousePieceIncluded: true,
          workType: 'Embroidery and Sequin Work',
          occasion: 'Party, Cocktail, Evening Wear',
          careInstructions: 'Dry clean only',
          stockQuantity: 5,
          featured: true,
          active: true,
        },
      ]).returning();

      productIds = newProducts.map(prod => prod.id);
    } else {
      productIds = existingProducts.slice(0, 4).map(prod => prod.id);
    }

    // 16. Link Categories to Featured Categories (check if already exists)
    const existingFeaturedCats = await db.select().from(featuredCategories);
    if (existingFeaturedCats.length === 0 && categoryIds.length > 0) {
      await db.insert(featuredCategories).values(
        categoryIds.slice(0, 3).map((catId, index) => ({
          id: crypto.randomUUID(),
          categoryId: catId,
          displayOrder: index + 1,
          isActive: true,
        }))
      );
    }

    // 17. Link Products to Featured Bestsellers (check if already exists)
    const existingFeaturedBestsellers = await db.select().from(featuredBestsellers);
    if (existingFeaturedBestsellers.length === 0 && productIds.length > 0) {
      await db.insert(featuredBestsellers).values(
        productIds.map((prodId, index) => ({
          id: crypto.randomUUID(),
          productId: prodId,
          displayOrder: index + 1,
          isActive: true,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      message: '✅ Homepage seeded successfully! All 11 sections are now populated with initial content including demo products and categories.',
    });
  } catch (error: any) {
    console.error('Error seeding homepage:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed homepage data',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
