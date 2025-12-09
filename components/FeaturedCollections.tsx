import Link from 'next/link';
import Image from 'next/image';

// Mock data for Phase 1 - will be replaced with database fetch in Phase 2
const collections = [
  {
    id: 1,
    name: 'Wedding Special',
    tagline: 'Bridal Elegance',
    description: 'Exquisite sarees for your special day',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg', // Replace with actual image
    link: '/collections/wedding-special',
    productsCount: 48,
  },
  {
    id: 2,
    name: 'Festive Favorites',
    tagline: 'Celebrate in Style',
    description: 'Perfect for all your celebrations',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg', // Replace with actual image
    link: '/collections/festive',
    productsCount: 36,
  },
];

export default function FeaturedCollections() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-golden text-sm font-semibold tracking-widest uppercase">
            Curated for You
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-maroon mt-3 mb-4">
            Featured Collections
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Handpicked selections to make every occasion memorable
          </p>
        </div>

        {/* Collections Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={collection.link}
              className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="aspect-[16/10] relative bg-gray-100">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  priority={index === 0}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/90 via-maroon/50 to-transparent group-hover:from-maroon/95 transition-colors duration-500"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                  {/* Tagline */}
                  <span className="text-golden text-xs md:text-sm font-semibold tracking-widest uppercase mb-2">
                    {collection.tagline}
                  </span>

                  {/* Collection Name */}
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                    {collection.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 text-sm md:text-base mb-4 max-w-md">
                    {collection.description}
                  </p>

                  {/* Products Count and CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">
                      {collection.productsCount} Products
                    </span>

                    <div className="flex items-center gap-2 text-white font-semibold text-sm md:text-base group/btn">
                      <span>EXPLORE COLLECTION</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Decorative line */}
                  <div className="w-24 h-1 bg-golden mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

                {/* Corner accent */}
                <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-golden/50 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-12">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-maroon font-semibold text-lg hover:text-deep-maroon transition-colors group"
          >
            <span>View All Collections</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
