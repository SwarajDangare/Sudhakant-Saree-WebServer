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

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

// Make page dynamic - fetch data on each request
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      {/* Hero Slider - Full width banner carousel with video support */}
      <HeroSlider />

      {/* Shop by Category - 3 category cards with images */}
      <ShopByCategory />

      {/* Featured Collections - 2-column curated collections */}
      <FeaturedCollections />

      {/* Bestseller Products - 4-column grid with sale badges */}
      <BestsellerProducts />

      {/* Mid-Page Banner - Full width promotional banner */}
      <MidPageBanner />

      {/* Shop by Occasion - Wedding, Festival, Party, Casual */}
      <ShopByOccasion />

      {/* New Arrivals - Latest products grid */}
      <NewArrivals />

      {/* Brand Story - Heritage and values section */}
      <BrandStory />

      {/* Instagram Feed - Social media integration */}
      <InstagramFeed />

      {/* Trust Badges - Free shipping, secure payment, authentic products, easy returns */}
      <Features />

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
