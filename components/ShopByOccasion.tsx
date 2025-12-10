import Link from 'next/link';
import Image from 'next/image';
import SectionHeading from './SectionHeading';

// Mock data for Phase 1 - will be replaced with database fetch in Phase 2
export default function ShopByOccasion() {
  const occasions = [
    {
      id: 1,
      name: 'Wedding',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/accessories-bag.jpg', // Replace
      link: '/categories?occasion=wedding',
      gradient: 'from-pink-600/80 to-red-600/80',
      icon: '💍',
    },
    {
      id: 2,
      name: 'Festival',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg', // Replace
      link: '/categories?occasion=festival',
      gradient: 'from-purple-600/80 to-indigo-600/80',
      icon: '🎉',
    },
    {
      id: 3,
      name: 'Party',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/shoes.jpg', // Replace
      link: '/categories?occasion=party',
      gradient: 'from-blue-600/80 to-cyan-600/80',
      icon: '🥳',
    },
    {
      id: 4,
      name: 'Casual',
      image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/analog-classic.jpg', // Replace
      link: '/categories?occasion=casual',
      gradient: 'from-green-600/80 to-teal-600/80',
      icon: '👗',
    },
  ];

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
              href={occasion.link}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Container with Next.js Image - Shorter on mobile */}
              <div className="aspect-[4/3] md:aspect-[3/4] relative bg-gray-100">
                <Image
                  src={occasion.image}
                  alt={occasion.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${occasion.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`}></div>

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
