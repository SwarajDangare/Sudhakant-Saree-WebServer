import Link from 'next/link';
import Image from 'next/image';

// Mock data for Phase 1 - will be replaced with database fetch in Phase 2
const brandStory = {
  id: 1,
  heading: 'Weaving Traditions, Creating Memories',
  description: 'For over three generations, Sudhakant Sarees has been the epitome of authentic Indian craftsmanship. Each saree in our collection tells a story of dedication, artistry, and timeless elegance. We work directly with master weavers across India to bring you the finest handloom and silk sarees, ensuring that every piece is a work of art that honors our rich cultural heritage.',
  image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/leather-bag-gray.jpg', // Replace with actual image
  buttonText: 'Our Story',
  buttonLink: '/about',
  active: true,
  stats: [
    { label: 'Years of Heritage', value: '50+' },
    { label: 'Master Artisans', value: '200+' },
    { label: 'Happy Customers', value: '10K+' },
  ],
};

export default function BrandStory() {
  if (!brandStory.active) return null;

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={brandStory.image}
                alt={brandStory.heading}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />

              {/* Decorative frame */}
              <div className="absolute inset-0 border-8 border-white/10 rounded-3xl"></div>
            </div>

            {/* Decorative accent */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-golden/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-maroon/10 rounded-full blur-3xl -z-10"></div>

            {/* Stats Card */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-11/12 bg-white rounded-2xl shadow-2xl p-6 hidden md:block">
              <div className="grid grid-cols-3 gap-4">
                {brandStory.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-maroon mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            {/* Section Label */}
            <span className="inline-block text-golden text-sm font-semibold tracking-widest uppercase mb-4">
              About Us
            </span>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-maroon mb-6 leading-tight">
              {brandStory.heading}
            </h2>

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed">
                {brandStory.description}
              </p>
            </div>

            {/* Stats for Mobile */}
            <div className="grid grid-cols-3 gap-4 mb-8 md:hidden">
              {brandStory.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-maroon mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                'Handpicked by Expert Curators',
                'Authentic Handloom & Silk Sarees',
                'Direct from Master Weavers',
                'Quality Assured & Certified',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-golden/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href={brandStory.buttonLink}
              className="inline-flex items-center gap-3 bg-maroon text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-deep-maroon transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <span>{brandStory.buttonText}</span>
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Decorative line */}
            <div className="flex items-center gap-4 mt-10 opacity-50">
              <div className="w-16 h-0.5 bg-golden"></div>
              <svg className="w-6 h-6 text-golden" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15 8.5L22 9.3L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.3L9 8.5L12 2Z" />
              </svg>
              <div className="flex-1 h-0.5 bg-golden"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
