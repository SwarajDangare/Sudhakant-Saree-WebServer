import Link from 'next/link';
import { categories } from '@/data/categories';

export default function CategorySection() {
  return (
    <section className="section-padding bg-silk-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Explore Our Collections
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Dive into our carefully curated collection of traditional Indian sarees,
            each category showcasing unique artistry and craftsmanship.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl shadow-lg card-hover bg-white"
            >
              {/* Category Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-maroon via-indian-red to-saffron relative">
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 pattern-bg opacity-30"></div>

                {/* Category Icon/Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-maroon/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold flex items-center">
                    View Collection
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Category Info */}
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-maroon mb-2 group-hover:text-saffron transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Ornamental Divider */}
        <div className="ornament-divider mt-16">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-maroon to-saffron rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
