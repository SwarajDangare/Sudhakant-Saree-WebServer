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
    <div className="group bg-white overflow-hidden">
      {/* Product Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={firstImage.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-maroon via-indian-red to-saffron">
              <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2.5 py-1 text-xs font-bold uppercase tracking-wide z-10">
              SAVE {pricing.percentage}%
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedColor?.inStock}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-maroon hover:text-white disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Add to Cart"
          >
            {showSuccess ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="pt-3 pb-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm text-gray-800 mb-2 hover:text-maroon transition line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-base font-bold text-red-600">
                Rs. {pricing.discounted.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-gray-500 line-through">
                Rs. {pricing.original.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-900">
              Rs. {pricing.original.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
