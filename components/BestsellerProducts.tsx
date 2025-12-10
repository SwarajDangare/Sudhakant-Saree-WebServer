import Link from 'next/link';
import Image from 'next/image';
import SectionHeading from './SectionHeading';

interface Product {
  id: string;
  name: string;
  price: string;
  discountType?: string;
  discountValue?: string;
}

interface BestsellerProductsProps {
  products: Product[];
}

export default function BestsellerProducts({ products }: BestsellerProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Placeholder images for products (will be replaced when fetching product images)
  const placeholderImages = [
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
  ];

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
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Product Image - Shorter on mobile */}
                <div className="relative aspect-[4/5] md:aspect-[3/4] bg-gray-100 overflow-hidden">
                  <Image
                    src={placeholderImages[index % placeholderImages.length]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                  />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-maroon text-white px-4 py-2 text-xs font-bold tracking-wider rounded-full shadow-lg animate-pulse-subtle">
                    BESTSELLER
                  </div>

                  {/* Discount Badge */}
                  {product.discountType === 'PERCENTAGE' && product.discountValue && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full">
                      {product.discountValue}% OFF
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
                  {/* Product Name - Smaller on mobile */}
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mt-1 md:mt-2 mb-2 md:mb-3 group-hover:text-maroon transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price - Smaller on mobile */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <span className="text-lg md:text-2xl font-bold text-maroon">
                      ₹{parseFloat(product.price).toLocaleString('en-IN')}
                    </span>
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
