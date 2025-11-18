/**
 * Cart Type Definitions
 * Defines the structure for shopping cart items and operations
 */

export interface CartItem {
  productId: string
  productName: string
  category: string
  price: number
  selectedColor: {
    color: string
    colorCode: string
  }
  quantity: number
  image: string // Primary image for the selected color
}

export interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

export interface CartContextType {
  cart: CartState
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  removeFromCart: (productId: string, colorCode: string) => void
  updateQuantity: (productId: string, colorCode: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string, colorCode: string) => boolean
  getCartItemQuantity: (productId: string, colorCode: string) => number
}
