import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-maroon via-indian-red to-saffron text-white pattern-bg overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-golden/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-saffron/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="bg-golden text-maroon px-4 py-2 rounded-full text-sm font-semibold">
                Authentic Indian Craftsmanship
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Elegance Woven in
              <span className="block text-golden">Every Thread</span>
            </h1>

            <p className="text-xl text-silk-white leading-relaxed">
              Discover our exquisite collection of handcrafted sarees, where tradition meets timeless beauty.
              Each piece tells a story of heritage and artistry.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products/banarasi" className="btn-primary bg-golden text-maroon hover:bg-silk-white">
                Explore Collection
              </Link>
              <Link href="/about" className="btn-secondary border-white text-white hover:bg-white hover:text-maroon">
                Our Story
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/30">
              <div>
                <div className="text-3xl font-bold text-golden">500+</div>
                <div className="text-sm text-silk-white">Saree Designs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-golden">50+</div>
                <div className="text-sm text-silk-white">Artisan Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-golden">5000+</div>
                <div className="text-sm text-silk-white">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* Image/Pattern Section */}
          <div className="relative">
            <div className="relative z-10">
              {/* Placeholder for hero image - using decorative elements */}
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-golden/20 to-transparent backdrop-blur-sm border-2 border-golden/50 p-8 shadow-2xl">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-silk-white/10 to-golden/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <svg className="w-32 h-32 mx-auto text-golden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <div className="text-2xl font-bold text-golden">
                      Sudhakant Sarees
                    </div>
                    <div className="text-silk-white">
                      Traditional Elegance
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-golden rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-4 border-saffron rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFF8DC"/>
        </svg>
      </div>
    </section>
  );
}
