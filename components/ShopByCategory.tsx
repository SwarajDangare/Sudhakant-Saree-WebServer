import Link from 'next/link';
import Image from 'next/image';

// Mock data for Phase 1 - will be replaced with database fetch in Phase 2
const categories = [
  {
    id: 1,
    name: 'Silk Sarees',
    slug: 'silk-sarees',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg', // Replace with actual image
    tagline: 'Timeless Elegance',
    description: 'Handwoven pure silk sarees',
  },
  {
    id: 2,
    name: 'Wedding Collection',
    slug: 'wedding',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg', // Replace with actual image
    tagline: 'For Your Special Day',
    description: 'Exquisite bridal sarees',
  },
  {
    id: 3,
    name: 'Cotton Sarees',
    slug: 'cotton-sarees',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg', // Replace with actual image
    tagline: 'Comfort & Style',
    description: 'Perfect for daily wear',
  },
];

export default function ShopByCategory() {
  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          {/* Decorative element */}
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-maroon mb-4">
            SHOP BY CATEGORY
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our curated collection of handpicked sarees
          </p>

          {/* Decorative element */}
          <div className="flex items-center justify-center mt-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 20, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Container with Optimized Next.js Image - Shorter on mobile */}
              <div className="aspect-[5/4] md:aspect-[3/4] relative bg-gray-100">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-8">
                  {/* Tagline - Hidden on mobile */}
                  <p className="hidden md:block text-golden text-sm font-semibold tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.tagline}
                  </p>

                  {/* Category Name - Smaller on mobile */}
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 text-center">
                    {category.name}
                  </h3>

                  {/* Description - Hidden on mobile */}
                  <p className="hidden md:block text-white/90 text-sm mb-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {category.description}
                  </p>

                  {/* CTA Button - Simplified on mobile */}
                  <div className="flex items-center gap-2 text-white text-xs md:text-sm font-semibold md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-y-2 md:group-hover:translate-y-0">
                    <span>EXPLORE</span>
                    <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  {/* Decorative underline */}
                  <div className="w-12 md:w-16 h-0.5 bg-golden mt-2 md:mt-4"></div>
                </div>

                {/* Hover shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-4 rounded-full font-semibold hover:bg-deep-maroon transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            VIEW ALL CATEGORIES
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
