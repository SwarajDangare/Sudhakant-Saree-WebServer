'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, ColorVariant } from '@/types/product';
import { useCart } from '@/contexts/CartContext';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Cart context
  const { addToCart, isInCart, getCartItemQuantity } = useCart();

  // Default color if no colors available
  const defaultColor: ColorVariant = { color: 'Default', colorCode: '#E5E7EB', inStock: true, images: [] };
  const [selectedColor, setSelectedColor] = useState<ColorVariant>(product.colors[0] || defaultColor);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // NEW: Size selection
  const hasColors = product.colors && product.colors.length > 0;

  // Compute available sizes for selected color
  const availableSizes = selectedColor?.variants?.filter(v => v.active && v.size) || [];
  const hasSizes = availableSizes.length > 0;

  // Pincode check state
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  // Accordion states
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Reset image index and size when color changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedSize(null); // Reset size when color changes
  }, [selectedColor?.id]);

  // Use categoryName for display, fallback to category if not available
  const displayCategoryName = product.categoryName || product.category;

  // Quantity state
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check if current product+color is in cart and get its quantity
  const itemInCart = isInCart(product.id, selectedColor?.id);
  const cartQuantity = getCartItemQuantity(product.id, selectedColor?.id);

  // Show "Visit Cart" only if item is in cart AND quantity matches
  const showVisitCart = itemInCart && cartQuantity === quantity;

  // Sync quantity with cart when product/color changes or cart updates
  useEffect(() => {
    if (itemInCart && cartQuantity > 0) {
      setQuantity(cartQuantity);
    } else {
      setQuantity(1); // Reset to 1 if not in cart
    }
  }, [selectedColor?.id, itemInCart, cartQuantity]);

  // Image navigation handlers
  const handlePreviousImage = () => {
    if (selectedColor?.images && selectedColor.images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? selectedColor.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedColor?.images && selectedColor.images.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === selectedColor.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Get current images for selected color
  const currentImages = selectedColor?.images || [];
  const hasImages = currentImages.length > 0;
  const currentImage = hasImages ? currentImages[selectedImageIndex] : null;

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

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!selectedColor?.inStock || isAddingToCart) return;

    // Validate size selection if product has sizes
    if (hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }

    setIsAddingToCart(true);

    try {
      // Find the specific variant ID if size is selected
      let productVariantId: string | undefined;
      if (hasSizes && selectedSize) {
        const variant = selectedColor.variants?.find(v => v.size === selectedSize);
        productVariantId = variant?.id;
      } else if (selectedColor.variants && selectedColor.variants.length > 0) {
        // For products without sizes, use the single variant (size = null)
        const variant = selectedColor.variants.find(v => !v.size);
        productVariantId = variant?.id;
      }

      await addToCart({
        productId: product.id,
        productColorId: selectedColor?.id,
        productVariantId: productVariantId,
        size: selectedSize || undefined,
        quantity: quantity,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Pincode check handler
  const handlePincodeCheck = () => {
    if (pincode.length !== 6) {
      setPincodeStatus('error');
      return;
    }
    setPincodeStatus('checking');
    // Simulate API call
    setTimeout(() => {
      setPincodeStatus('success');
    }, 1000);
  };

  // Toggle accordion
  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/products/${product.category}`} className="hover:text-gray-900 transition-colors">
              {displayCategoryName}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Product Images - Left Side (60% width on large screens) */}
            <div className="lg:col-span-3 flex gap-3">
              {/* Thumbnail Gallery - Vertical Strip */}
              {hasImages && currentImages.length > 1 && (
                <div className="flex flex-col gap-2" style={{width: '70px'}}>
                  {currentImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded overflow-hidden transition-all flex-shrink-0 border-2 ${
                        selectedImageIndex === index
                          ? 'border-gray-800'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || `${product.name} - Image ${index + 1}`}
                        width={70}
                        height={70}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1">
                <div className="aspect-square bg-gray-100 relative overflow-hidden group">
                  {hasImages && currentImage ? (
                    <>
                      {/* Actual Product Image */}
                      <Image
                        src={currentImage.url}
                        alt={currentImage.altText || product.name}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />

                      {/* Navigation Arrows - Only show on hover */}
                      {currentImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePreviousImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            aria-label="Previous image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            aria-label="Next image"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    /* Placeholder when no images */
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <div className="text-center text-gray-400">
                        <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No image available</p>
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  {hasColors && selectedColor && !selectedColor.inStock && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">
                      OUT OF STOCK
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info - Right Side (40% width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h1>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-sm text-gray-500">MRP</span>
                {hasDiscount ? (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-2xl font-semibold text-gray-900">
                      ₹{Math.round(finalPrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-semibold text-orange-600">
                      {discountPercentage.toFixed(0)}% off
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-gray-900">
                    ₹{Math.round(price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>

              {/* Star Rating (Static for now) */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600">4.0 (2 reviews)</span>
              </div>

              {/* Available Offers */}
              {hasDiscount && (
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-pink-700 font-semibold text-sm mb-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    AVAILABLE OFFERS
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex gap-2">
                      <span className="text-pink-600">•</span>
                      <span>ADD 2 PRODUCTS GET 25% OFF</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-pink-600">•</span>
                      <span>ADD 3 OR MORE PRODUCTS GET 30% OFF</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {hasSizes && (
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-3">SIZE</div>
                  <div className="flex gap-2 flex-wrap">
                    {availableSizes.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedSize(variant.size)}
                        disabled={variant.stockQuantity === 0}
                        className={`px-6 py-2 border-2 text-sm font-medium transition-colors ${
                          selectedSize === variant.size
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : variant.stockQuantity === 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-300 text-gray-900 hover:border-gray-900'
                        }`}
                      >
                        {variant.size}
                        {variant.stockQuantity === 0 && ' (Out of Stock)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector with Image Thumbnails */}
              {hasColors && product.colors.length > 1 && (
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-3">COLOR</div>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => {
                      const colorImage = color.images && color.images.length > 0 ? color.images[0] : null;
                      return (
                        <button
                          key={color.color}
                          onClick={() => setSelectedColor(color)}
                          disabled={!color.inStock}
                          className={`relative w-16 h-20 rounded border-2 overflow-hidden transition-all ${
                            selectedColor?.color === color.color
                              ? 'border-gray-900'
                              : 'border-gray-200 hover:border-gray-400'
                          } ${!color.inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {colorImage ? (
                            <Image
                              src={colorImage.url}
                              alt={color.color}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: color.colorCode }}
                            />
                          )}
                          {!color.inStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-700">OUT</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="space-y-3 pt-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1 || !selectedColor?.inStock}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={quantity}
                      onChange={handleQuantityChange}
                      disabled={!selectedColor?.inStock}
                      className="w-12 text-center text-sm font-semibold text-gray-900 focus:outline-none disabled:bg-gray-50"
                    />
                    <button
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= 99 || !selectedColor?.inStock}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!showVisitCart ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedColor?.inStock || isAddingToCart}
                      className={`flex-1 py-3 px-6 rounded font-semibold text-sm uppercase tracking-wide transition-all ${
                        selectedColor?.inStock && !isAddingToCart
                          ? 'bg-[#FF7961] hover:bg-[#FF6347] text-white shadow-sm hover:shadow-md'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isAddingToCart ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {selectedColor?.inStock ? (itemInCart ? 'Update Cart' : 'Add to Cart') : 'Out of Stock'}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/cart"
                      className="flex-1 py-3 px-6 rounded font-semibold text-sm uppercase tracking-wide bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visit Cart
                    </Link>
                  )}

                  <button className="px-4 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Delivery Check */}
              <div className="border-t pt-6">
                <div className="text-sm font-semibold text-gray-900 mb-3">DELIVERY DATE CHECK:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    onClick={handlePincodeCheck}
                    className="px-6 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors"
                  >
                    Check
                  </button>
                </div>
                {pincodeStatus === 'success' && (
                  <p className="text-xs text-green-600 mt-2">✓ Delivery available in 3-5 business days</p>
                )}
                {pincodeStatus === 'error' && (
                  <p className="text-xs text-red-600 mt-2">Please enter a valid 6-digit pincode</p>
                )}
              </div>

              {/* Product Details Accordion */}
              <div className="border-t pt-6 space-y-3">
                {/* Product Details */}
                <div className="border-b">
                  <button
                    onClick={() => toggleAccordion('details')}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <span className="font-semibold text-gray-900">Product Details</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${openAccordion === 'details' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openAccordion === 'details' && (
                    <div className="pb-4 text-sm text-gray-700 space-y-2">
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>

                {/* Size & Fit */}
                <div className="border-b">
                  <button
                    onClick={() => toggleAccordion('size')}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <span className="font-semibold text-gray-900">Size & Fit</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${openAccordion === 'size' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openAccordion === 'size' && (
                    <div className="pb-4 text-sm text-gray-700 space-y-1">
                      <p><strong>Length:</strong> {product.length || 'Standard'}</p>
                      <p><strong>Occasion:</strong> {product.occasion || 'All occasions'}</p>
                    </div>
                  )}
                </div>

                {/* Material & Care */}
                <div className="border-b">
                  <button
                    onClick={() => toggleAccordion('material')}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <span className="font-semibold text-gray-900">Material & Care</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${openAccordion === 'material' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openAccordion === 'material' && (
                    <div className="pb-4 text-sm text-gray-700 space-y-1">
                      <p><strong>Material:</strong> {product.material || 'Premium fabric'}</p>
                      <p><strong>Care:</strong> {product.careInstructions || 'Dry clean only'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 pt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Authentic</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
