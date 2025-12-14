'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

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
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Default to first color
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasColors = product.colors && product.colors.length > 0;
  const inWishlist = isInWishlist(product.id);

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
      setShowSuccess(true); // Can trigger a toast or small indicator if needed
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white flex flex-col h-full overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4.5] overflow-hidden bg-gray-50">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={firstImage.altText || product.name}
              fill
              className="object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </Link>

        {/* Overlay with Actions - Appears on hover */}
        {/* Using pointer-events-none on container, auto on buttons to ensure clicks work but container passes through if needed */}
        {/* Actually, just putting it on top with high z-index is fine inside the relative container */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 z-10 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            {/* View Button */}
            <Link
              href={`/product/${product.id}`}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-maroon hover:text-white transition-all hover:scale-110"
              title="View Details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Link>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className={`w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${inWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-800 hover:text-red-500'}`}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <svg className={`w-5 h-5 ${inWishlist ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !selectedColor?.inStock}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-800 hover:bg-maroon hover:text-white transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed group/cart-btn"
              title="Add to Cart"
            >
              {isAdding ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : showSuccess ? (
                <svg className="w-5 h-5 text-green-600 group-hover/cart-btn:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Product Info */}
      <div className="pt-4 pb-2 px-2 flex flex-col items-center text-center">
        <Link href={`/product/${product.id}`} className="group-hover:text-maroon transition-colors block w-full">
          <h3 className="text-xs md:text-sm font-medium tracking-wide uppercase text-gray-800 line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-center gap-3">
          {hasDiscount ? (
            <>
              <span className="text-sm md:text-base font-bold text-gray-900">
                ₹ {pricing.discounted.toLocaleString('en-IN')}
              </span>
              <span className="text-xs md:text-sm text-gray-400 line-through">
                ₹ {pricing.original.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="text-sm md:text-base font-bold text-gray-900">
              ₹ {pricing.original.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {hasDiscount && (
          <div className="mt-1 text-xs font-bold text-maroon tracking-wider">
            {pricing.percentage}% OFF
          </div>
        )}
      </div>
    </div>
  );
}
