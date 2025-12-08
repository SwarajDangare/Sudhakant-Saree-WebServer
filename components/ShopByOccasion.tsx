import Link from 'next/link';

export default function ShopByOccasion() {
  const occasions = [
    {
      id: 1,
      name: 'Wedding',
      image: '/images/occasion-wedding.jpg',
      link: '/categories?occasion=wedding',
      gradient: 'from-pink-600/80 to-red-600/80',
    },
    {
      id: 2,
      name: 'Festival',
      image: '/images/occasion-festival.jpg',
      link: '/categories?occasion=festival',
      gradient: 'from-purple-600/80 to-indigo-600/80',
    },
    {
      id: 3,
      name: 'Party',
      image: '/images/occasion-party.jpg',
      link: '/categories?occasion=party',
      gradient: 'from-blue-600/80 to-cyan-600/80',
    },
    {
      id: 4,
      name: 'Casual',
      image: '/images/occasion-casual.jpg',
      link: '/categories?occasion=casual',
      gradient: 'from-green-600/80 to-teal-600/80',
    },
  ];

  return (
    <section className="bg-white py-16">
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
            SHOP BY OCCASION
          </h2>

          {/* Decorative element */}
          <div className="flex items-center justify-center mt-4">
            <svg className="w-16 h-8 text-maroon" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 10 Q 25 20, 50 10 T 100 10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
              <circle cx="50" cy="10" r="3" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.map((occasion) => (
            <Link
              key={occasion.id}
              href={occasion.link}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {/* Image Container */}
              <div className="aspect-[3/4] relative bg-gradient-to-br from-maroon/60 via-indian-red/60 to-saffron/60">
                {/* Pattern overlay */}
                <div className="absolute inset-0 pattern-bg opacity-20"></div>

                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${occasion.gradient} opacity-80 group-hover:opacity-90 transition-opacity`}></div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {occasion.name}
                    </h3>
                    <div className="w-16 h-1 bg-white mx-auto"></div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full">
                    Shop Now
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
