import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';
import SectionHeading from './SectionHeading';

interface Product {
  id: string;
  name: string;
  price: string;
  discountType?: string | null;
  discountValue?: string | null;
  primaryImage?: string | null;
}

interface NewArrivalItem {
  id: string;
  productId: string;
  displayOrder: number;
  overrideImageUrl: string | null;
  overrideTitle: string | null;
  overrideDescription: string | null;
  overrideLinkUrl: string | null;
  product: Product;
}

// Support both automatic mode (Product[]) and manual mode (NewArrivalItem[])
type NewArrivalsItem = Product | NewArrivalItem;

interface NewArrivalsProps {
  products: NewArrivalsItem[];
}

// Type guard to check if item is a NewArrivalItem (manual mode)
function isNewArrivalItem(item: NewArrivalsItem): item is NewArrivalItem {
  return 'product' in item && 'overrideImageUrl' in item;
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Placeholder images for products without images
  const placeholderImages = [
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg',
  ];

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
          {products.map((item, index) => {
            // Check if this is manual mode (with override fields) or automatic mode
            const isManualMode = isNewArrivalItem(item);

            // Extract display data based on mode
            let displayTitle: string;
            let displayImage: string;
            let displayLink: string;
            let productId: string;
            let productName: string;
            let productPrice: string;

            if (isManualMode) {
              // Manual mode - use override fields with fallback to product defaults
              displayTitle = item.overrideTitle || item.product.name;
              displayImage = item.overrideImageUrl || item.product.primaryImage || placeholderImages[index % placeholderImages.length];
              displayLink = item.overrideLinkUrl || `/product/${item.productId}`;
              productId = item.productId;
              productName = item.product.name;
              productPrice = item.product.price;
            } else {
              // Automatic mode - use product data directly
              displayTitle = item.name;
              displayImage = item.primaryImage || placeholderImages[index % placeholderImages.length];
              displayLink = `/product/${item.id}`;
              productId = item.id;
              productName = item.name;
              productPrice = item.price;
            }

            return (
              <Link
                key={isManualMode ? item.id : item.id}
                href={displayLink}
                className="group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image
                      src={displayImage}
                      alt={displayTitle}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                    />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-maroon text-white px-4 py-2 text-xs font-bold tracking-wider rounded-full shadow-lg">
                      NEW
                    </div>

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
                      {displayTitle}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-maroon">
                          ₹{parseFloat(productPrice).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Add to Cart Icon */}
                      <AddToCartButton
                        productId={productId}
                        productName={productName}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
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
