'use client';

import { useState } from 'react';
import { mockProducts } from '@/data/mockProducts';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const runtime = 'edge';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Generate static params for all products at build time
export function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  return (
    <div className="min-h-screen bg-silk-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-maroon">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/products/${product.category}`} className="text-gray-500 hover:text-maroon capitalize">
              {product.category} Sarees
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-maroon font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[3/4] bg-gradient-to-br from-maroon via-indian-red to-saffron rounded-2xl shadow-2xl golden-border relative overflow-hidden">
                <div className="absolute inset-0 pattern-bg opacity-20"></div>
                <div
                  className="absolute inset-0 flex items-center justify-center transition-colors duration-500"
                  style={{ backgroundColor: selectedColor.colorCode + '30' }}
                >
                  <div className="text-center text-white">
                    <svg className="w-32 h-32 mx-auto mb-6 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <div className="text-2xl font-bold bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
                      {selectedColor.color}
                    </div>
                  </div>
                </div>

                {/* Stock Badge */}
                {!selectedColor.inStock && (
                  <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Color Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
                {product.colors.map((color) => (
                  <button
                    key={color.color}
                    onClick={() => setSelectedColor(color)}
                    className={`aspect-square rounded-xl transition-all ${
                      selectedColor.color === color.color
                        ? 'ring-4 ring-maroon scale-105 shadow-xl'
                        : 'ring-2 ring-gray-300 hover:ring-saffron hover:scale-105'
                    }`}
                  >
                    <div
                      className="w-full h-full rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: color.colorCode }}
                    >
                      {color.color.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div>
                <div className="inline-block bg-saffron text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 capitalize">
                  {product.category} Saree
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-maroon mb-4">
                  {product.name}
                </h1>
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-bold text-gradient">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{(product.price * 1.3).toLocaleString('en-IN')}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    23% OFF
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-maroon mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-maroon mb-4">
                  Select Color ({product.colors.length} options available)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!color.inStock}
                      className={`group flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                        selectedColor.color === color.color
                          ? 'border-maroon bg-maroon/5'
                          : 'border-gray-300 hover:border-saffron'
                      } ${!color.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0 shadow-md relative"
                        style={{ backgroundColor: color.colorCode }}
                      >
                        {!color.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-800 rotate-45"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">{color.color}</div>
                        <div className="text-xs text-gray-500">
                          {color.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      {selectedColor.color === color.color && (
                        <svg className="w-5 h-5 text-maroon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="text-lg font-semibold text-maroon mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Material</div>
                    <div className="font-semibold text-maroon">{product.material}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Length</div>
                    <div className="font-semibold text-maroon">{product.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Occasion</div>
                    <div className="font-semibold text-maroon">{product.occasion}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-semibold text-maroon capitalize">{product.category}</div>
                  </div>
                </div>
              </div>

              {/* Care Instructions */}
              <div className="bg-golden/10 border-2 border-golden/30 rounded-lg p-4">
                <h4 className="font-semibold text-maroon mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Care Instructions
                </h4>
                <p className="text-gray-700 text-sm">{product.careInstructions}</p>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 space-y-3">
                <button
                  disabled={!selectedColor.inStock}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    selectedColor.inStock
                      ? 'bg-maroon text-white hover:bg-saffron shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedColor.inStock ? 'Add to Cart (Coming Soon)' : 'Out of Stock'}
                </button>
                <Link
                  href={`/products/${product.category}`}
                  className="block w-full py-4 rounded-lg font-bold text-lg border-2 border-maroon text-maroon hover:bg-maroon hover:text-white transition-all text-center"
                >
                  View More {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Sarees
                </Link>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Authentic Product</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>7 Days Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
