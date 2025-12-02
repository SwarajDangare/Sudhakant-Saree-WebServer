import Hero from '@/components/Hero'
import CategorySection from '@/components/CategorySection'
import FeaturedProducts from '@/components/FeaturedProducts'
import Link from 'next/link'

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

// Make page dynamic - fetch data on each request
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Hero />
      <CategorySection />
      <FeaturedProducts />

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
