'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CartItem, AddToCartInput } from '@/types/customer';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (input: AddToCartInput) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string, colorCode: string) => boolean;
  getCartItemQuantity: (productId: string, colorCode: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get or create session ID for anonymous users
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null;

    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Fetch cart from API
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionId = session?.user?.id ? null : getSessionId();
      const response = await fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-Id': sessionId }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, getSessionId]);

  // Load cart on mount and when session changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add item to cart
  const addToCart = useCallback(async (input: AddToCartInput) => {
    try {
      const sessionId = session?.user?.id ? null : getSessionId();
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-Id': sessionId }),
        },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        await refreshCart();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, [session, getSessionId, refreshCart]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }, [refreshCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [refreshCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      const sessionId = session?.user?.id ? null : getSessionId();
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-Id': sessionId }),
        },
      });

      if (response.ok) {
        setItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }, [session, getSessionId]);

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || '0');
    return sum + (price * item.quantity);
  }, 0);

  // Helper: Check if product with specific color is in cart
  const isInCart = useCallback((productId: string, colorCode: string): boolean => {
    return items.some(
      (item) =>
        item.productId === productId &&
        (item.productColor?.colorCode === colorCode || (!item.productColor && !colorCode))
    );
  }, [items]);

  // Helper: Get quantity of specific product+color in cart
  const getCartItemQuantity = useCallback((productId: string, colorCode: string): number => {
    const item = items.find(
      (item) =>
        item.productId === productId &&
        (item.productColor?.colorCode === colorCode || (!item.productColor && !colorCode))
    );
    return item?.quantity || 0;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        isInCart,
        getCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
