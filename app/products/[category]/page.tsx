import { mockProducts } from '@/data/mockProducts';
import { categories } from '@/data/categories';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';

interface ProductsPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: ProductsPageProps) {
  const category = categories.find(cat => cat.slug === params.category);

  if (!category) {
    return {
      title: 'Category Not Found - Sudhakant Sarees',
    };
  }

  return {
    title: `${category.name} - Sudhakant Sarees`,
    description: category.description,
  };
}

export default function ProductsPage({ params }: ProductsPageProps) {
  const category = categories.find(cat => cat.slug === params.category);

  if (!category) {
    notFound();
  }

  const categoryProducts = mockProducts.filter(
    product => product.category === params.category
  );

  return (
    <div className="min-h-screen bg-silk-white">
      {/* Category Header */}
      <section className="bg-gradient-to-br from-maroon via-indian-red to-saffron text-white pattern-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-silk-white max-w-2xl mx-auto">
              {category.description}
            </p>
            <div className="mt-6 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-golden" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="text-sm font-semibold">{categoryProducts.length} Products Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Available</h3>
              <p className="text-gray-500">Check back soon for new arrivals in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Browse Other Categories */}
      <section className="section-padding bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gradient text-center mb-8">
            Browse Other Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories
              .filter(cat => cat.slug !== params.category)
              .map((cat) => (
                <a
                  key={cat.id}
                  href={`/products/${cat.slug}`}
                  className="text-center p-4 rounded-lg border-2 border-gray-200 hover:border-saffron transition-colors group"
                >
                  <div className="text-4xl mb-2">👗</div>
                  <div className="text-sm font-semibold text-maroon group-hover:text-saffron transition-colors">
                    {cat.name}
                  </div>
                </a>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
