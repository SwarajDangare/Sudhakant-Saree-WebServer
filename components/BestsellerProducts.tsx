import Link from 'next/link';
import Image from 'next/image';
import { db, products, categories } from '@/db';
import { eq, and } from 'drizzle-orm';

export default async function BestsellerProducts() {
  // Fetch featured products with their categories
  const featuredProductsData = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.featured, true),
        eq(products.active, true)
      )
    )
    .limit(8); // Show 8 products in 4-column grid

  if (featuredProductsData.length === 0) {
    return null;
  }

  // Map to simplified product data
  const featuredProducts = featuredProductsData.map(({ product, category }) => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    originalPrice: product.price ? Number(product.price) * 1.5 : 0, // Calculate 50% discount
    discount: 50, // Fixed 50% discount for display
    category: category?.name || 'Uncategorized',
    image: '/images/product-placeholder.jpg', // Placeholder image
    rating: 0, // No ratings yet
  }));

  return (
    <section className="bg-silk-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Decorative element */}
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-maroon mb-4">
            OUR BESTSELLERS
          </h2>

          {/* Decorative element */}
          <div className="flex items-center justify-center mt-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 20, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Products Grid - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="product-card-modern group"
            >
              {/* Product Image */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-maroon/20 via-indian-red/20 to-saffron/20 overflow-hidden">
                {/* Sale Badge */}
                <div className="sale-badge">
                  SAVE ₹ {Math.round((product.originalPrice - product.price)).toLocaleString('en-IN')}
                </div>

                {/* Pattern overlay for placeholder */}
                <div className="absolute inset-0 pattern-bg opacity-10"></div>

                {/* Placeholder content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 text-maroon/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>

                {/* Quick view button on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="bg-white text-maroon px-4 py-2 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Product Name */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-maroon transition-colors uppercase">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-red-600">
                    ₹ {product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹ {Math.round(product.originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-green-600 font-semibold">
                    {product.discount}% Off
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < product.rating ? 'text-golden' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">(0.0)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/categories"
            className="inline-block bg-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
}
