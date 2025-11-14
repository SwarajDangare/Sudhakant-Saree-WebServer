import { mockProducts } from '@/data/mockProducts';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const featuredProducts = mockProducts.filter(product => product.featured);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Featured Sarees
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Handpicked selections from our finest collection. Each saree is a masterpiece
            crafted with love and tradition.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a href="/products/silk" className="btn-primary inline-block">
            View All Collections
          </a>
        </div>
      </div>
    </section>
  );
}
