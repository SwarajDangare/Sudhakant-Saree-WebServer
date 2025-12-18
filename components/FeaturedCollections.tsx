import Link from 'next/link';
import Image from 'next/image';
import SectionHeading from './SectionHeading';

interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  imageUrl: string;
  linkUrl: string;
}

interface FeaturedCollectionsProps {
  collections: Collection[];
}

export default function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  if (!collections || collections.length === 0) {
    return null;
  }
  return (
    <section className="bg-white py-20">
      <div className="w-full px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <SectionHeading
          subtitle="Curated for You"
          title="Featured Collections"
          description="Handpicked selections to make every occasion memorable"
        />

        {/* Collections Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <Link
              key={collection.id}
              href={collection.linkUrl}
              className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="aspect-[16/10] relative bg-gray-100">
                <Image
                  src={collection.imageUrl}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  priority={index === 0}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/90 via-maroon/50 to-transparent group-hover:from-maroon/95 transition-colors duration-500"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                  {/* Tagline */}
                  <span className="text-golden text-xs md:text-sm font-semibold tracking-widest uppercase mb-2">
                    {collection.tagline}
                  </span>

                  {/* Collection Name */}
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                    {collection.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/90 text-sm md:text-base mb-4 max-w-md">
                    {collection.description}
                  </p>

                  {/* CTA Button */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm md:text-base group/btn">
                      <span>EXPLORE COLLECTION</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>

                  {/* Decorative line */}
                  <div className="w-24 h-1 bg-golden mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

                {/* Corner accent */}
                <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-golden/50 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-12">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-maroon font-semibold text-lg hover:text-deep-maroon transition-colors group"
          >
            <span>View All Collections</span>
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
