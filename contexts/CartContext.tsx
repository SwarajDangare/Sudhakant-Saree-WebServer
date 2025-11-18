'use client'

/**
 * Cart Context
 * Provides global shopping cart state management with localStorage persistence
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, CartState, CartContextType } from '@/types/cart'

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'sudhakant-sarees-cart'

/**
 * Calculate cart totals from items array
 */
function calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { totalItems, totalPrice }
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
  }
  return []
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const items = loadCartFromStorage()
    const totals = calculateCartTotals(items)
    setCart({
      items,
      ...totals,
    })
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart.items)
  }, [cart.items])

  /**
   * Add item to cart or update quantity if already exists
   */
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.selectedColor.colorCode === item.selectedColor.colorCode
      )

      let newItems: CartItem[]

      if (existingItemIndex > -1) {
        // Item already exists, update quantity
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        }
      } else {
        // New item, add to cart
        newItems = [...prevCart.items, { ...item, quantity }]
      }

      const totals = calculateCartTotals(newItems)

      return {
        items: newItems,
        ...totals,
      }
    })
  }

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId: string, colorCode: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) =>
          !(item.productId === productId && item.selectedColor.colorCode === colorCode)
      )

      const totals = calculateCartTotals(newItems)

      return {
        items: newItems,
        ...totals,
      }
    })
  }

  /**
   * Update quantity of an item in cart
   */
  const updateQuantity = (productId: string, colorCode: string, quantity: number) => {
    // Don't allow quantity less than 1
    if (quantity < 1) return

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => {
        if (item.productId === productId && item.selectedColor.colorCode === colorCode) {
          return { ...item, quantity }
        }
        return item
      })

      const totals = calculateCartTotals(newItems)

      return {
        items: newItems,
        ...totals,
      }
    })
  }

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    })
  }

  /**
   * Check if a product with specific color is in cart
   */
  const isInCart = (productId: string, colorCode: string): boolean => {
    return cart.items.some(
      (item) =>
        item.productId === productId && item.selectedColor.colorCode === colorCode
    )
  }

  /**
   * Get quantity of a specific product+color in cart
   */
  const getCartItemQuantity = (productId: string, colorCode: string): number => {
    const item = cart.items.find(
      (item) =>
        item.productId === productId && item.selectedColor.colorCode === colorCode
    )
    return item?.quantity || 0
  }

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * Hook to use cart context
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
