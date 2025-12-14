import Link from 'next/link';
import Image from 'next/image';

interface MidPageBannerProps {
  banner: {
    id: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    imageUrl: string;
    linkUrl?: string | null;
    linkText?: string | null;
    gradientColor?: string | null;
  };
}

export default function MidPageBanner({ banner }: MidPageBannerProps) {
  if (!banner) return null;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-width banner container */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        {/* Background Image */}
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          className="object-cover"
          sizes="100vw"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${banner.gradientColor || '#800000'}e6 0%, ${banner.gradientColor || '#800000'}99 50%, transparent 100%)`
          }}
        ></div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              {/* Subtitle */}
              {banner.subtitle && (
                <span className="inline-block text-golden text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4 animate-fade-in">
                  {banner.subtitle}
                </span>
              )}

              {/* Main Title */}
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                {banner.title}
              </h2>

              {/* Description */}
              {banner.description && (
                <p className="text-xl md:text-2xl text-silk-white mb-8 animate-fade-in-up">
                  {banner.description}
                </p>
              )}

              {/* CTA Button */}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="inline-flex items-center gap-3 bg-white text-maroon px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-base md:text-lg hover:bg-golden hover:text-white transition-all duration-300 shadow-2xl hover:scale-105 animate-fade-in-up-delay group"
                >
                  <span>{banner.linkText || 'Shop Now'}</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}

              {/* Decorative element */}
              <div className="mt-10 flex items-center gap-4 opacity-70">
                <div className="w-16 h-0.5 bg-golden"></div>
                <svg className="w-6 h-6 text-golden" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15 8.5L22 9.3L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.3L9 8.5L12 2Z" />
                </svg>
                <div className="w-16 h-0.5 bg-golden"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-golden/30 hidden lg:block"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-golden/30 hidden lg:block"></div>
      </div>
    </section>
  );
}
