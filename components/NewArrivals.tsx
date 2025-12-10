import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';
import SectionHeading from './SectionHeading';

// Mock data for Phase 1 - will be replaced with database fetch in Phase 2
const products = [
  {
    id: 1,
    name: 'Banarasi Silk Saree',
    price: 8999,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg', // Replace
    isNew: true,
    badge: 'NEW',
  },
  {
    id: 2,
    name: 'Kanjivaram Silk Saree',
    price: 12999,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg', // Replace
    isNew: true,
    badge: 'NEW',
  },
  {
    id: 3,
    name: 'Designer Georgette Saree',
    price: 4999,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg', // Replace
    isNew: true,
    badge: 'NEW',
  },
  {
    id: 4,
    name: 'Patola Silk Saree',
    price: 15999,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg', // Replace
    isNew: true,
    badge: 'NEW',
  },
];

export default function NewArrivals() {
  return (
    <section className="bg-cream py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeading
          subtitle="Just Arrived"
          title="New Arrivals"
          description="Be the first to discover our latest collection"
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
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
                    <div className="absolute top-4 left-4 bg-maroon text-white px-4 py-2 text-xs font-bold tracking-wider rounded-full shadow-lg">
                      {product.badge}
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
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-maroon transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-maroon">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Add to Cart Icon */}
                    <AddToCartButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/products/new-arrivals"
            className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-4 rounded-full font-semibold hover:bg-deep-maroon transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <span>VIEW ALL NEW ARRIVALS</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
