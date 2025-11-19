'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { items, itemCount, totalAmount, isLoading, updateQuantity, removeFromCart } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">
            Start shopping to add items to your cart
          </p>
          <Link
            href="/"
            className="btn-primary inline-block px-6 py-3 rounded-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-maroon mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                {item.product?.images?.[0] && (
                  <div className="w-full sm:w-32 h-32 relative flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.images[0].altText || item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.product?.name}
                  </h3>
                  {item.productColor && (
                    <p className="text-sm text-gray-600 mt-1">
                      Color:{' '}
                      <span className="inline-flex items-center">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                          style={{ backgroundColor: item.productColor.colorCode }}
                        ></span>
                        {item.productColor.color}
                      </span>
                    </p>
                  )}
                  <p className="text-lg font-semibold text-maroon mt-2">
                    ₹{parseFloat(item.product?.price || '0').toLocaleString('en-IN')}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x border-gray-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Subtotal */}
                <div className="text-right sm:text-left">
                  <p className="text-lg font-bold text-gray-800">
                    ₹{(parseFloat(item.product?.price || '0') * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({itemCount})</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-maroon">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full btn-primary py-3 rounded-md font-semibold"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center mt-4 text-maroon hover:text-deep-maroon font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
