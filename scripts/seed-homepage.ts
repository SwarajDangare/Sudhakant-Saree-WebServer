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
} from '@/db/schema';

async function seedHomepageSections() {
  console.log('🔧 Seeding homepage sections control...');

  await db.insert(homepageSections).values([
    { sectionKey: 'hero_slider', sectionName: 'Hero Slider', displayOrder: 1, isActive: true, description: 'Full-width banner carousel with video support' },
    { sectionKey: 'promo_bar', sectionName: 'Announcement Bar', displayOrder: 2, isActive: true, description: 'Rotating promotional announcements' },
    { sectionKey: 'shop_by_category', sectionName: 'Shop by Category', displayOrder: 3, isActive: true, description: 'Featured category cards' },
    { sectionKey: 'featured_collections', sectionName: 'Featured Collections', displayOrder: 4, isActive: true, description: 'Curated product collections' },
    { sectionKey: 'bestseller_products', sectionName: 'Bestseller Products', displayOrder: 5, isActive: true, description: 'Top-selling products' },
    { sectionKey: 'mid_page_banner', sectionName: 'Mid-Page Banner', displayOrder: 6, isActive: true, description: 'Full-width promotional banner' },
    { sectionKey: 'shop_by_occasion', sectionName: 'Shop by Occasion', displayOrder: 7, isActive: true, description: 'Occasion-based shopping cards' },
    { sectionKey: 'new_arrivals', sectionName: 'New Arrivals', displayOrder: 8, isActive: true, description: 'Latest product additions' },
    { sectionKey: 'brand_story', sectionName: 'Brand Story', displayOrder: 9, isActive: true, description: 'Brand heritage and values' },
    { sectionKey: 'instagram_feed', sectionName: 'Instagram Feed', displayOrder: 10, isActive: true, description: 'Social media posts' },
    { sectionKey: 'trust_badges', sectionName: 'Trust Badges', displayOrder: 11, isActive: true, description: 'Feature badges (shipping, payment, etc.)' },
  ]);

  console.log('✅ Homepage sections seeded');
}

async function seedAnnouncements() {
  console.log('🔧 Seeding announcements...');

  await db.insert(announcements).values([
    {
      text: '🎉 FLAT 10% OFF on your first order | Use code',
      highlightText: 'WELCOME10',
      linkUrl: '/offers',
      linkText: 'Shop Now',
      isActive: true,
      displayOrder: 1,
    },
    {
      text: '🚚 FREE Shipping on orders above',
      highlightText: '₹999',
      linkUrl: '/shipping-policy',
      linkText: 'Learn More',
      isActive: true,
      displayOrder: 2,
    },
    {
      text: '💰 COD Available | Easy Returns | 100% Authentic',
      highlightText: null,
      linkUrl: '/policies',
      linkText: 'View Policies',
      isActive: true,
      displayOrder: 3,
    },
  ]);

  console.log('✅ Announcements seeded');
}

async function seedCollections() {
  console.log('🔧 Seeding collections...');

  // Using demo Cloudinary images - replace with actual images after upload
  await db.insert(collections).values([
    {
      name: 'Wedding Special',
      slug: 'wedding-special',
      tagline: 'Bridal Elegance',
      description: 'Exquisite sarees for your special day',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
      imagePublicId: 'homepage/wedding-collection',
      linkUrl: '/collections/wedding-special',
      isFeatured: true,
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Festive Favorites',
      slug: 'festive',
      tagline: 'Celebrate in Style',
      description: 'Perfect for all your celebrations',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
      imagePublicId: 'homepage/festive-collection',
      linkUrl: '/collections/festive',
      isFeatured: true,
      isActive: true,
      displayOrder: 2,
    },
  ]);

  console.log('✅ Collections seeded');
}

async function seedOccasions() {
  console.log('🔧 Seeding occasions...');

  await db.insert(occasions).values([
    {
      name: 'Wedding',
      slug: 'wedding',
      icon: '💍',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
      imagePublicId: 'homepage/wedding-occasion',
      gradientFrom: 'from-pink-600/80',
      gradientTo: 'to-red-600/80',
      linkUrl: '/categories?occasion=wedding',
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Festival',
      slug: 'festival',
      icon: '🎉',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
      imagePublicId: 'homepage/festival-occasion',
      gradientFrom: 'from-purple-600/80',
      gradientTo: 'to-indigo-600/80',
      linkUrl: '/categories?occasion=festival',
      isActive: true,
      displayOrder: 2,
    },
    {
      name: 'Party',
      slug: 'party',
      icon: '🥳',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
      imagePublicId: 'homepage/party-occasion',
      gradientFrom: 'from-blue-600/80',
      gradientTo: 'to-cyan-600/80',
      linkUrl: '/categories?occasion=party',
      isActive: true,
      displayOrder: 3,
    },
    {
      name: 'Casual',
      slug: 'casual',
      icon: '👗',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
      imagePublicId: 'homepage/casual-occasion',
      gradientFrom: 'from-green-600/80',
      gradientTo: 'to-teal-600/80',
      linkUrl: '/categories?occasion=casual',
      isActive: true,
      displayOrder: 4,
    },
  ]);

  console.log('✅ Occasions seeded');
}

async function seedMidPageBanner() {
  console.log('🔧 Seeding mid-page banner...');

  await db.insert(midPageBanner).values({
    title: 'Wedding Season Sale',
    subtitle: 'EXCLUSIVE OFFER',
    description: 'Get up to 50% OFF on bridal collection',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
    imagePublicId: 'homepage/mid-page-banner',
    linkUrl: '/sale/wedding-season',
    linkText: 'Shop Now',
    isActive: true,
  });

  console.log('✅ Mid-page banner seeded');
}

async function seedBrandStory() {
  console.log('🔧 Seeding brand story...');

  const [story] = await db.insert(brandStory).values({
    heading: 'Weaving Traditions, Creating Memories',
    subtitle: 'About Us',
    description: 'For over three generations, Sudhakant Sarees has been the epitome of authentic Indian craftsmanship. Each saree in our collection tells a story of dedication, artistry, and timeless elegance. We work directly with master weavers across India to bring you the finest handloom and silk sarees, ensuring that every piece is a work of art that honors our rich cultural heritage.',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
    imagePublicId: 'homepage/brand-story',
    buttonText: 'Our Story',
    buttonLink: '/about',
    isActive: true,
  }).returning();

  await db.insert(brandStoryStats).values([
    { brandStoryId: story.id, label: 'Years of Heritage', value: '50+', displayOrder: 1 },
    { brandStoryId: story.id, label: 'Master Artisans', value: '200+', displayOrder: 2 },
    { brandStoryId: story.id, label: 'Happy Customers', value: '10K+', displayOrder: 3 },
  ]);

  console.log('✅ Brand story seeded');
}

async function seedInstagram() {
  console.log('🔧 Seeding Instagram posts...');

  await db.insert(instagramSettings).values({
    instagramHandle: '@sudhakantsarees',
    profileUrl: 'https://instagram.com/sudhakantsarees',
    maxPosts: 6,
  });

  await db.insert(instagramPosts).values([
    {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
      imagePublicId: 'homepage/instagram-1',
      postUrl: 'https://instagram.com/p/example1',
      caption: 'Beautiful silk saree',
      isActive: true,
      displayOrder: 1,
    },
    {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
      imagePublicId: 'homepage/instagram-2',
      postUrl: 'https://instagram.com/p/example2',
      caption: 'Wedding collection',
      isActive: true,
      displayOrder: 2,
    },
    {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
      imagePublicId: 'homepage/instagram-3',
      postUrl: 'https://instagram.com/p/example3',
      caption: 'Festive wear',
      isActive: true,
      displayOrder: 3,
    },
    {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
      imagePublicId: 'homepage/instagram-4',
      postUrl: 'https://instagram.com/p/example4',
      caption: 'Designer collection',
      isActive: true,
      displayOrder: 4,
    },
    {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
      imagePublicId: 'homepage/instagram-5',
      postUrl: 'https://instagram.com/p/example5',
      caption: 'Cotton sarees',
      isActive: true,
      displayOrder: 5,
    },
    {
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
      imagePublicId: 'homepage/instagram-6',
      postUrl: 'https://instagram.com/p/example6',
      caption: 'Bridal special',
      isActive: true,
      displayOrder: 6,
    },
  ]);

  console.log('✅ Instagram posts seeded');
}

async function seedTrustBadges() {
  console.log('🔧 Seeding trust badges...');

  await db.insert(trustBadges).values([
    {
      title: 'FREE SHIPPING',
      description: 'Free shipping on orders above ₹999 across India',
      iconType: 'shipping',
      isActive: true,
      displayOrder: 1,
    },
    {
      title: 'SECURE PAYMENT',
      description: '100% secure payment with COD & online options',
      iconType: 'payment',
      isActive: true,
      displayOrder: 2,
    },
    {
      title: '100% AUTHENTIC',
      description: 'Original handloom sarees with quality guarantee',
      iconType: 'authentic',
      isActive: true,
      displayOrder: 3,
    },
    {
      title: 'EASY RETURNS',
      description: '7-day easy return & exchange policy',
      iconType: 'returns',
      isActive: true,
      displayOrder: 4,
    },
  ]);

  console.log('✅ Trust badges seeded');
}

async function main() {
  try {
    console.log('\n🌱 Starting homepage database seeding...\n');

    await seedHomepageSections();
    await seedAnnouncements();
    await seedCollections();
    await seedOccasions();
    await seedMidPageBanner();
    await seedBrandStory();
    await seedInstagram();
    await seedTrustBadges();

    console.log('\n✅ All homepage data seeded successfully!\n');
    console.log('📝 Note: Replace demo Cloudinary images with actual images');
    console.log('🚀 You can now run the homepage with database data\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
