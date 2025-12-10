import Link from 'next/link';
import Image from 'next/image';
import SectionHeading from './SectionHeading';

// Mock data for Phase 1 - will be replaced with database fetch in Phase 2
const featuredProducts = [
  {
    id: 1,
    name: 'Pure Silk Banarasi Saree',
    price: 8999,
    originalPrice: 14999,
    discount: 40,
    category: 'Silk Sarees',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg', // Replace
    rating: 4.5,
    badge: 'BESTSELLER',
  },
  {
    id: 2,
    name: 'Kanjivaram Wedding Saree',
    price: 12999,
    originalPrice: 19999,
    discount: 35,
    category: 'Wedding',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg', // Replace
    rating: 5,
    badge: 'BESTSELLER',
  },
  {
    id: 3,
    name: 'Designer Georgette Saree',
    price: 4999,
    originalPrice: 7999,
    discount: 38,
    category: 'Designer',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg', // Replace
    rating: 4,
    badge: null,
  },
  {
    id: 4,
    name: 'Patola Silk Saree',
    price: 15999,
    originalPrice: 24999,
    discount: 36,
    category: 'Silk Sarees',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg', // Replace
    rating: 4.5,
    badge: 'BESTSELLER',
  },
];

export default function BestsellerProducts() {
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeading
          subtitle="Customer Favorites"
          title="Bestsellers"
          description="Discover what our customers love most"
        />

        {/* Products Grid - 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Product Image - Shorter on mobile */}
                <div className="relative aspect-[4/5] md:aspect-[3/4] bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-maroon text-white px-4 py-2 text-xs font-bold tracking-wider rounded-full shadow-lg animate-pulse-subtle">
                      {product.badge}
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full">
                      {product.discount}% OFF
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white text-maroon px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 shadow-xl">
                        <span>Quick View</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-5">
                  {/* Category - Hidden on mobile */}
                  <span className="hidden md:inline-block text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>

                  {/* Product Name - Smaller on mobile */}
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mt-1 md:mt-2 mb-2 md:mb-3 group-hover:text-maroon transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price - Smaller on mobile */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <span className="text-lg md:text-2xl font-bold text-maroon">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs md:text-sm text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-golden' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-4 rounded-full font-semibold hover:bg-deep-maroon transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <span>VIEW ALL PRODUCTS</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
