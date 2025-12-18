'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';

interface WishlistProduct {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        price: string;
        colors: Array<{
            id: string;
            color: string;
            images: Array<{
                url: string;
                altText: string | null;
            }>;
        }>;
    };
}

export default function WishlistDrawer() {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { data: session } = useSession();
  
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fetch product details when drawer opens
  useEffect(() => {
    if (isWishlistOpen && wishlistItems.length > 0) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          if (session?.user?.id) {
            const response = await fetch('/api/wishlist');
            if (response.ok) {
              const data = await response.json();
              setProducts(data.items);
            }
          } else {
            const productPromises = wishlistItems.map(async (productId) => {
              const response = await fetch(`/api/products/${productId}`);
              if (response.ok) {
                const product = await response.json();
                return {
                  id: productId,
                  productId: productId,
                  product,
                };
              }
              return null;
            });
            const fetched = await Promise.all(productPromises);
            setProducts(fetched.filter((p): p is WishlistProduct => p !== null));
          }
        } catch (error) {
          console.error('Error fetching wishlist products:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isWishlistOpen, wishlistItems, session?.user?.id]);

  // Handle drawer behavior
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsWishlistOpen(false);
    };
    
    if (isWishlistOpen) {
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
  }, [isWishlistOpen, setIsWishlistOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsWishlistOpen(false);
    }
  };

  const handleAddToCart = async (product: WishlistProduct['product']) => {
    try {
      const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
      await addToCart({
        productId: product.id,
        productColorId: firstColor ? firstColor.id : undefined,
        quantity: 1,
      });
      setIsWishlistOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isWishlistOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
      
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[101] shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isWishlistOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">My Wishlist</h2>
            <button 
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
                <button 
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-8 py-3 bg-[#9d2235] text-white font-bold uppercase tracking-widest text-xs"
                >
                  Explore Sarees
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9d2235]"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {products.map((item) => {
                  const product = item.product;
                  const firstColor = product.colors?.[0];
                  const firstImage = firstColor?.images?.[0]?.url;

                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-24 h-32 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={firstImage || '/placeholder-image.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col pt-1">
                        <div className="flex justify-between items-start">
                          <Link 
                            href={`/product/${product.id}`}
                            onClick={() => setIsWishlistOpen(false)}
                            className="text-sm font-semibold text-gray-900 hover:text-[#9d2235] transition-colors leading-tight uppercase"
                          >
                            {product.name}
                          </Link>
                          <button 
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <span className="mt-1 text-sm font-bold text-gray-900">
                          Rs. {parseFloat(product.price).toLocaleString()}
                        </span>

                        <div className="mt-auto pt-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-all"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-6 border-t border-gray-100">
            <Link
              href="/wishlist"
              onClick={() => setIsWishlistOpen(false)}
              className="block w-full py-4 border-2 border-black text-black text-center text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              View Full Wishlist
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
