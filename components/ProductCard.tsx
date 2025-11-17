'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
      <Link href={`/product/${product.id}`}>
        {/* Product Image */}
        <div className="aspect-[3/4] bg-gradient-to-br from-maroon via-indian-red to-saffron relative group">
          {/* Pattern overlay */}
          <div className="absolute inset-0 pattern-bg opacity-20"></div>

          {/* Image placeholder with selected color */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: selectedColor.colorCode + '20' }}
          >
            <div className="text-center text-white">
              <svg className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <div className="text-sm font-semibold bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                {selectedColor.color}
              </div>
            </div>
          </div>

          {/* Stock Badge */}
          {!selectedColor.inStock && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4 bg-golden text-maroon px-3 py-1 rounded-full text-sm font-semibold capitalize">
            {product.category}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">View Details</span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-bold text-maroon mb-2 hover:text-saffron transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-maroon">₹{Number(product.price).toLocaleString('en-IN')}</span>
          </div>
          <div className="text-sm text-gray-500">
            {product.material}
          </div>
        </div>

        {/* Color Variants */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2 font-semibold">
            Available Colors ({product.colors.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color.color}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color);
                }}
                className={`group relative w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor.color === color.color
                    ? 'border-maroon scale-110 shadow-lg'
                    : 'border-gray-300 hover:border-saffron hover:scale-105'
                }`}
                title={color.color}
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: color.colorCode }}
                ></div>

                {/* Stock indicator */}
                {!color.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-gray-800 rotate-45"></div>
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {color.color}
                  {!color.inStock && ' (Out of Stock)'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/product/${product.id}`}
          className="mt-4 block w-full text-center btn-primary"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
