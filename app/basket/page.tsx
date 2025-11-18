'use client'

/**
 * Shopping Basket Page
 * Displays cart items with quantity controls, pricing, and checkout option
 */

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { useState } from 'react'

export default function BasketPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Handle quantity change for a cart item
  const handleQuantityChange = (productId: string, colorCode: string, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      updateQuantity(productId, colorCode, newQuantity)
    }
  }

  // Handle remove item
  const handleRemoveItem = (productId: string, colorCode: string) => {
    removeFromCart(productId, colorCode)
  }

  // Handle clear cart
  const handleClearCart = () => {
    clearCart()
    setShowClearConfirm(false)
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-silk-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg
              className="w-32 h-32 mx-auto text-gray-400 mb-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h1 className="text-4xl font-bold text-maroon mb-4">Your Basket is Empty</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Looks like you haven't added any sarees to your basket yet.
            </p>
            <Link
              href="/"
              className="inline-block bg-maroon text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-saffron shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-silk-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-maroon">Shopping Basket</h1>
              <p className="text-gray-600 mt-1">
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your basket
              </p>
            </div>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
            >
              Clear Basket
            </button>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-maroon mb-4">Clear Basket?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your basket? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleClearCart}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Yes, Clear Basket
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedColor.colorCode}`}
                className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-full sm:w-32 h-40 rounded-lg"
                      style={{
                        backgroundColor: item.selectedColor.colorCode + '30',
                        border: `3px solid ${item.selectedColor.colorCode}`,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 mx-auto opacity-60"
                            fill="none"
                            stroke={item.selectedColor.colorCode}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-maroon">{item.productName}</h3>
                        <p className="text-sm text-gray-600 capitalize">{item.category} Saree</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId, item.selectedColor.colorCode)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Remove item"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Color */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-600">Color:</span>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: item.selectedColor.colorCode }}
                      ></div>
                      <span className="text-sm font-semibold">{item.selectedColor.color}</span>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Qty:</span>
                        <div className="flex items-center border-2 border-maroon rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.selectedColor.colorCode,
                                item.quantity - 1
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="px-3 py-2 bg-maroon text-white hover:bg-saffron disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.productId,
                                item.selectedColor.colorCode,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 text-center text-sm font-bold text-maroon focus:outline-none"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.selectedColor.colorCode,
                                item.quantity + 1
                              )
                            }
                            disabled={item.quantity >= 99}
                            className="px-3 py-2 bg-maroon text-white hover:bg-saffron disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} × {item.quantity}
                        </div>
                        <div className="text-xl font-bold text-gradient">
                          ₹
                          {(item.price * item.quantity).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-maroon mb-6">Order Summary</h2>

              {/* Items Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedColor.colorCode}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.productName.substring(0, 20)}
                      {item.productName.length > 20 ? '...' : ''} ({item.quantity})
                    </span>
                    <span className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ₹
                    {cart.totalPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-maroon">Total</span>
                <span className="text-2xl font-bold text-gradient">
                  ₹
                  {cart.totalPrice.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Checkout Button */}
              <button className="w-full bg-maroon text-white py-4 rounded-lg font-bold text-lg hover:bg-saffron shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all mb-4">
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                href="/"
                className="block w-full text-center py-3 rounded-lg font-semibold text-maroon border-2 border-maroon hover:bg-maroon hover:text-white transition-all"
              >
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Free Shipping
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  7 Days Return Policy
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  100% Authentic Products
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
