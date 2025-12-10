interface TrustBadge {
  id: string;
  title: string;
  description: string;
  iconType: string; // 'shipping', 'payment', 'authentic', 'returns'
}

interface FeaturesProps {
  badges: TrustBadge[];
}

// Helper function to get icon SVG based on iconType
const getIcon = (iconType: string) => {
  const iconMap: Record<string, JSX.Element> = {
    shipping: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    payment: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    authentic: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    returns: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  };

  return iconMap[iconType] || iconMap.shipping; // Default to shipping icon if not found
};

export default function Features({ badges }: FeaturesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <section className="bg-white border-y border-gray-100 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 lg:grid-cols-${badges.length} gap-6 md:gap-8`}>
          {badges.map((badge) => (
            <div key={badge.id} className="text-center group">
              {/* Icon with animation */}
              <div className="flex justify-center mb-4 text-maroon transition-transform duration-300 group-hover:scale-110">
                {getIcon(badge.iconType)}
              </div>

              {/* Title */}
              <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-2 tracking-wide">
                {badge.title}
              </h3>

              {/* Description - Hidden on mobile */}
              <p className="hidden md:block text-sm text-gray-600 leading-relaxed">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
