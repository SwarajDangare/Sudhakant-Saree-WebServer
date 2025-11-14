export default function AboutPage() {
  return (
    <div className="min-h-screen bg-silk-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-maroon via-indian-red to-saffron text-white pattern-bg py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-silk-white">
            Weaving traditions, creating memories, celebrating heritage.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6">
              <h2 className="text-3xl font-bold text-gradient mb-6">Welcome to Sudhakant Sarees</h2>

              <p className="text-gray-700 leading-relaxed">
                For generations, Sudhakant Sarees has been a trusted name in bringing authentic Indian sarees
                to discerning customers. Our journey began with a simple vision: to preserve and celebrate
                the rich heritage of Indian textile craftsmanship.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Each saree in our collection is carefully selected from master weavers across India.
                From the intricate brocades of Banarasi to the vibrant silks of Kanjivaram, we bring you
                the finest examples of traditional Indian weaving.
              </p>

              <div className="bg-golden/10 border-l-4 border-golden p-6 my-8">
                <h3 className="text-xl font-bold text-maroon mb-3">Our Promise</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% authentic handcrafted sarees</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Direct from master weavers</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Quality assured and certified</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Supporting traditional artisans</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-maroon mt-8 mb-4">Why Choose Us?</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-maroon/5 to-saffron/5 p-6 rounded-xl">
                  <h4 className="font-bold text-maroon mb-2">Heritage & Tradition</h4>
                  <p className="text-gray-700 text-sm">
                    Decades of experience in curating the finest Indian textiles.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-maroon/5 to-saffron/5 p-6 rounded-xl">
                  <h4 className="font-bold text-maroon mb-2">Quality Assurance</h4>
                  <p className="text-gray-700 text-sm">
                    Every piece is carefully inspected for authenticity and quality.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-maroon/5 to-saffron/5 p-6 rounded-xl">
                  <h4 className="font-bold text-maroon mb-2">Wide Selection</h4>
                  <p className="text-gray-700 text-sm">
                    From everyday cotton to luxurious silk, we have it all.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-maroon/5 to-saffron/5 p-6 rounded-xl">
                  <h4 className="font-bold text-maroon mb-2">Customer First</h4>
                  <p className="text-gray-700 text-sm">
                    Your satisfaction is our priority, always.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
