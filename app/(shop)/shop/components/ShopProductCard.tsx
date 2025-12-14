'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  material: string | null;
  discountType: 'NONE' | 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  categoryName: string;
  colors: Array<{
    id: string;
    color: string;
    colorCode: string;
    inStock: boolean;
    images?: Array<{
      url: string;
      altText: string | null;
    }>;
  }>;
}

interface ShopProductCardProps {
  product: Product;
}

export default function ShopProductCard({ product }: ShopProductCardProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hasColors = product.colors && product.colors.length > 0;

  // Get the first image of the selected color
  const firstImage = selectedColor?.images && selectedColor.images.length > 0
    ? selectedColor.images[0]
    : null;

  // Calculate discount
  const calculatePrice = () => {
    const originalPrice = Number(product.price);
    if (product.discountType === 'PERCENTAGE') {
      const discountAmount = (originalPrice * Number(product.discountValue)) / 100;
      return {
        original: originalPrice,
        discounted: originalPrice - discountAmount,
        percentage: Number(product.discountValue),
      };
    } else if (product.discountType === 'FIXED') {
      return {
        original: originalPrice,
        discounted: originalPrice - Number(product.discountValue),
        percentage: Math.round((Number(product.discountValue) / originalPrice) * 100),
      };
    }
    return {
      original: originalPrice,
      discounted: originalPrice,
      percentage: 0,
    };
  };

  const pricing = calculatePrice();
  const hasDiscount = product.discountType !== 'NONE' && pricing.percentage > 0;

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

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden group">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.altText || product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-maroon via-indian-red to-saffron">
            <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
            {pricing.percentage}% OFF
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {/* Quick View Button */}
          <Link
            href={`/product/${product.id}`}
            className={`group/btn bg-white rounded-full shadow-lg transition-all duration-300 flex items-center overflow-hidden ${
              isHovered ? 'w-auto pr-4' : 'w-10 h-10'
            }`}
            title="Quick View"
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-700 group-hover/btn:text-maroon transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            {isHovered && (
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                QUICK VIEW
              </span>
            )}
          </Link>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedColor?.inStock}
            className={`group/btn bg-white rounded-full shadow-lg transition-all duration-300 flex items-center overflow-hidden ${
              isHovered ? 'w-auto pr-4' : 'w-10 h-10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Add to Cart"
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              {showSuccess ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700 group-hover/btn:text-maroon transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </div>
            {isHovered && !isAdding && !showSuccess && (
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                ADD TO CART
              </span>
            )}
            {isHovered && isAdding && (
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                ADDING...
              </span>
            )}
            {isHovered && showSuccess && (
              <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                ADDED!
              </span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            className={`group/btn bg-white rounded-full shadow-lg transition-all duration-300 flex items-center overflow-hidden ${
              isHovered ? 'w-auto pr-4' : 'w-10 h-10'
            }`}
            title="Add to Wishlist"
          >
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-700 group-hover/btn:text-red-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            {isHovered && (
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                WISHLIST
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-maroon transition line-clamp-2 uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ₹{pricing.discounted.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ₹{pricing.original.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-semibold text-red-600">
                {pricing.percentage}% OFF
              </span>
            </>
          )}
        </div>

        {/* Color Swatches - Compact */}
        {hasColors && product.colors.length > 0 && (
          <div className="flex gap-1.5">
            {product.colors.slice(0, 5).map((color) => (
              <button
                key={color.color}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(color);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor?.color === color.color
                    ? 'border-maroon scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.colorCode }}
                title={color.color}
              />
            ))}
            {product.colors.length > 5 && (
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                +{product.colors.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
