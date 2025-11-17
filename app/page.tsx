import Hero from '@/components/Hero'
import CategorySection from '@/components/CategorySection'
import FeaturedProducts from '@/components/FeaturedProducts'

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
    </>
  )
}
