import Link from 'next/link';
import Image from 'next/image';
import SectionHeading from './SectionHeading';

interface Occasion {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  gradientFrom: string | null;
  gradientTo: string | null;
  linkUrl: string;
}

interface ShopByOccasionProps {
  occasions: Occasion[];
}

export default function ShopByOccasion({ occasions }: ShopByOccasionProps) {
  if (!occasions || occasions.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeading
          title="Shop by Occasion"
          description="Find the perfect saree for every celebration"
        />

        {/* Occasions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {occasions.map((occasion) => (
            <Link
              key={occasion.id}
              href={occasion.linkUrl}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Container with Next.js Image - Shorter on mobile */}
              <div className="aspect-[4/3] md:aspect-[3/4] relative bg-gray-100">
                <Image
                  src={occasion.imageUrl || 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000&auto=format&fit=crop'}
                  alt={occasion.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t opacity-70 group-hover:opacity-80 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to top, ${occasion.gradientFrom || '#800000'}, ${occasion.gradientTo || '#FFD700'})`
                  }}
                ></div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center p-2 md:p-0">
                  <div className="text-center transform transition-transform duration-300 group-hover:scale-110">
                    {/* Icon - Smaller on mobile */}
                    <div className="text-3xl md:text-5xl mb-2 md:mb-4">{occasion.icon}</div>

                    {/* Occasion Name - Smaller on mobile */}
                    <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 drop-shadow-2xl">
                      {occasion.name}
                    </h3>

                    {/* Decorative line - Smaller on mobile */}
                    <div className="w-12 md:w-20 h-0.5 md:h-1 bg-white mx-auto mb-2 md:mb-4"></div>

                    {/* Shop Now text - Hidden on mobile, shown on hover on desktop */}
                    <span className="hidden md:inline-flex text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center gap-2">
                      Shop Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
