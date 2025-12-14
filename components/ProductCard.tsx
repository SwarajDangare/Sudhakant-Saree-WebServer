'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  // Default color if no colors available
  const defaultColor = { color: 'Default', colorCode: '#800000', inStock: true, images: [] };
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || defaultColor);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const hasColors = product.colors && product.colors.length > 0;

  // Get the first image of the selected color, or use placeholder
  const firstImage = selectedColor?.images && selectedColor.images.length > 0
    ? selectedColor.images[0]
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedColor?.inStock) return;

    setIsAdding(true);
    try {
      await addToCart({
        productId: product.id,
        productColorId: hasColors && selectedColor ? selectedColor.color : undefined,
        quantity: 1,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(product.id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };


  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
      <Link href={`/product/${product.id}`}>
        {/* Product Image - SQUARE FORMAT */}
        <div className="aspect-square bg-gradient-to-br from-maroon via-indian-red to-saffron relative group overflow-hidden">
          {firstImage ? (
            <>
              {/* Actual product image */}
              <Image
                src={firstImage.url}
                alt={firstImage.altText || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </>
          ) : (
            <>
              {/* Pattern overlay */}
              <div className="absolute inset-0 pattern-bg opacity-20"></div>

              {/* Image placeholder with selected color */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: (selectedColor?.colorCode || '#800000') + '20' }}
              >
                <div className="text-center text-white">
                  <svg className="w-24 h-24 mx-auto mb-4 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  {hasColors && (
                    <div className="text-sm font-semibold bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                      {selectedColor?.color}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Stock Badge */}
          {hasColors && selectedColor && !selectedColor.inStock && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
              Out of Stock
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4 bg-golden text-maroon px-3 py-1 rounded-full text-sm font-semibold capitalize z-10">
            {product.category}
          </div>

          {/* Wishlist Heart Icon */}
          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-lg hover:scale-110 disabled:opacity-50"
            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist(product.id) ? (
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>

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
        {hasColors && (
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
                  className={`group relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.color === color.color
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
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedColor?.inStock}
            className={`py-2 px-4 rounded-md font-medium transition-colors ${selectedColor?.inStock
              ? 'bg-maroon text-white hover:bg-deep-maroon'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } disabled:opacity-50`}
          >
            {isAdding ? 'Adding...' : showSuccess ? 'Added!' : 'Add to Cart'}
          </button>
          <Link
            href={`/product/${product.id}`}
            className="py-2 px-4 rounded-md font-medium text-center border-2 border-maroon text-maroon hover:bg-maroon hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
