'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

export default function CartDrawer() {
  const { 
    items, 
    itemCount, 
    totalAmount, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart 
  } = useCart();
  
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  // Handle click outside drawer to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsCartOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[101] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Your Cart</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <p className="text-sm text-gray-500 mt-1">Add something to make it happy!</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="px-8 py-3 bg-[#9d2235] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#801b2a] transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-32 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product?.images[0]?.url || '/placeholder-image.jpg'}
                        alt={item.product?.name || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 flex flex-col pt-1">
                      <div className="flex justify-between items-start">
                        <Link 
                          href={`/product/${item.productId}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-gray-900 hover:text-[#9d2235] transition-colors leading-tight uppercase"
                        >
                          {item.product?.name}
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Color/Size */}
                      <div className="mt-1 text-xs text-gray-500">
                        {item.productColor?.color && <span>{item.productColor.color}</span>}
                        {item.productColor?.color && item.size && <span className="mx-1">•</span>}
                        {item.size && <span>{item.size}</span>}
                      </div>
                      
                      {/* Price & Quantity */}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center border border-gray-200 rounded">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          Rs. {(parseFloat(item.product?.price || '0') * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-6 bg-gray-50 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between text-base font-bold text-gray-900 uppercase tracking-wide">
                <span>Subtotal</span>
                <span>Rs. {totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 italic">Shipping and taxes calculated at checkout.</p>
              
              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-4 bg-black text-white text-center text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all shadow-lg"
                >
                  Checkout
                </Link>
                
                <div className="flex justify-center items-center gap-4 py-2 border border-gray-200 rounded bg-white">
                  <Image src="/visa.png" alt="Visa" width={32} height={20} className="grayscale opacity-50" />
                  <Image src="/mastercard.png" alt="Mastercard" width={32} height={20} className="grayscale opacity-50" />
                  <Image src="/upi.png" alt="UPI" width={32} height={20} className="grayscale opacity-50" />
                </div>

                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center text-xs font-bold text-[#9d2235] uppercase tracking-widest hover:underline pt-2"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
