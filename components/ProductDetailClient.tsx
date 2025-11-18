'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ColorVariant } from '@/types/product';
import { useCart } from '@/contexts/CartContext';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Cart context
  const { addToCart, isInCart, getCartItemQuantity } = useCart();

  // Default color if no colors available
  const defaultColor: ColorVariant = { color: 'Default', colorCode: '#800000', inStock: true, images: [] };
  const [selectedColor, setSelectedColor] = useState<ColorVariant>(product.colors[0] || defaultColor);
  const hasColors = product.colors && product.colors.length > 0;

  // Quantity state
  const [quantity, setQuantity] = useState<number>(1);

  // Check if current product+color is in cart and get its quantity
  const itemInCart = isInCart(product.id, selectedColor?.colorCode || '');
  const cartQuantity = getCartItemQuantity(product.id, selectedColor?.colorCode || '');

  // Show "Visit Basket" only if item is in cart AND quantity matches
  const showVisitBasket = itemInCart && cartQuantity === quantity;

  // Sync quantity with cart when product/color changes or cart updates
  useEffect(() => {
    if (itemInCart && cartQuantity > 0) {
      setQuantity(cartQuantity);
    } else {
      setQuantity(1); // Reset to 1 if not in cart
    }
  }, [selectedColor?.colorCode, itemInCart, cartQuantity]);

  // Calculate discount
  const price = Number(product.price) || 0;
  const discountType = product.discountType || 'NONE';
  const discountValue = Number(product.discountValue) || 0;

  const calculateFinalPrice = () => {
    if (discountType === 'PERCENTAGE') {
      return price - (price * discountValue / 100);
    } else if (discountType === 'FIXED') {
      return Math.max(0, price - discountValue);
    }
    return price;
  };

  const calculateDiscountPercentage = () => {
    if (price === 0) return 0;
    if (discountType === 'PERCENTAGE') {
      return discountValue;
    } else if (discountType === 'FIXED') {
      return (discountValue / price) * 100;
    }
    return 0;
  };

  const finalPrice = calculateFinalPrice();
  const discountPercentage = calculateDiscountPercentage();
  const hasDiscount = discountType !== 'NONE' && discountValue > 0;

  // Quantity handlers
  const handleIncreaseQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      setQuantity(value);
    }
  };

  // Add to basket handler
  const handleAddToBasket = () => {
    if (!selectedColor?.inStock) return;

    addToCart(
      {
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: finalPrice,
        selectedColor: {
          color: selectedColor.color,
          colorCode: selectedColor.colorCode,
        },
        image: selectedColor.images[0] || '/placeholder-saree.jpg', // Use first image of selected color
      },
      quantity
    );
  };

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
                  style={{ backgroundColor: (selectedColor?.colorCode || '#800000') + '30' }}
                >
                  <div className="text-center text-white">
                    <svg className="w-32 h-32 mx-auto mb-6 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    {hasColors && (
                      <div className="text-2xl font-bold bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
                        {selectedColor?.color}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Badge */}
                {hasColors && selectedColor && !selectedColor.inStock && (
                  <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Color Thumbnails */}
              {hasColors && (
                <div className="grid grid-cols-4 gap-4">
                  {product.colors.map((color) => (
                    <button
                      key={color.color}
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-xl transition-all ${
                        selectedColor?.color === color.color
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
              )}
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
                <div className="flex items-baseline flex-wrap gap-2">
                  <span className="text-4xl font-bold text-gradient">
                    ₹{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {discountPercentage.toFixed(0)}% OFF
                      </span>
                    </>
                  )}
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
              {hasColors && (
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
                          selectedColor?.color === color.color
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
                        {selectedColor?.color === color.color && (
                          <svg className="w-5 h-5 text-maroon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Quantity Selector and Action Buttons */}
              <div className="border-t pt-6 space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-semibold text-maroon mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border-2 border-maroon rounded-lg overflow-hidden">
                      <button
                        onClick={handleDecreaseQuantity}
                        disabled={quantity <= 1 || !selectedColor?.inStock}
                        className="px-4 py-3 bg-maroon text-white hover:bg-saffron disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={quantity}
                        onChange={handleQuantityChange}
                        disabled={!selectedColor?.inStock}
                        className="w-20 text-center text-lg font-bold text-maroon focus:outline-none disabled:bg-gray-100"
                      />
                      <button
                        onClick={handleIncreaseQuantity}
                        disabled={quantity >= 99 || !selectedColor?.inStock}
                        className="px-4 py-3 bg-maroon text-white hover:bg-saffron disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add to Basket / Visit Basket Button */}
                {!showVisitBasket ? (
                  <button
                    onClick={handleAddToBasket}
                    disabled={!selectedColor?.inStock}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                      selectedColor?.inStock
                        ? 'bg-maroon text-white hover:bg-saffron shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>{selectedColor?.inStock ? (itemInCart ? 'Update Basket' : 'Add to Basket') : 'Out of Stock'}</span>
                  </button>
                ) : (
                  <Link
                    href="/basket"
                    className="w-full py-4 rounded-lg font-bold text-lg bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Visit Basket / Checkout</span>
                  </Link>
                )}

                {/* View More Button */}
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
