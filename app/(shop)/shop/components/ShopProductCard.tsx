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
    <div className="group relative bg-white flex flex-col h-full">
      {/* Product Image Container */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4.5] overflow-hidden bg-gray-50">
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

        {/* Discount Badge - ByShree Layout (Top Left, Red) */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-[var(--discount-red)] text-white px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-wider z-10 shadow-sm">
            SAVE {pricing.percentage}%
          </div>
        )}

        {/* Quick Add Button - Bottom Right White Square with + */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedColor?.inStock}
          className="absolute bottom-2 right-2 w-10 h-10 bg-white shadow-sm flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-colors z-20 group-hover:opacity-100 opacity-100 md:opacity-0 translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add to Cart"
        >
          {isAdding ? (
            <svg className="w-5 h-5 animate-spin text-[var(--discount-red)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : showSuccess ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </Link>

      {/* Product Details */}
      <div className="pt-4 px-1 flex flex-col items-center text-center">
        <Link href={`/product/${product.id}`} className="w-full">
          <h3 className="text-[13px] md:text-sm text-gray-700 truncate w-full hover:text-[var(--maroon)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-medium text-[var(--discount-red)]">
                Rs. {pricing.discounted.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-gray-400 line-through decoration-gray-400">
                Rs. {pricing.original.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-gray-900">
              Rs. {pricing.original.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
