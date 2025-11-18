// Customer Types
export interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  customerId: string;
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressInput {
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

// Cart Types
export interface Cart {
  id: string;
  customerId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productColorId: string | null;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: string;
    images: Array<{ url: string; altText: string | null }>;
  };
  productColor?: {
    id: string;
    color: string;
    colorCode: string;
    inStock: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartInput {
  productId: string;
  productColorId?: string;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NET_BANKING';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  addressId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  items: OrderItem[];
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productColorId: string | null;
  productName: string;
  productColor: string | null;
  price: string;
  quantity: number;
  subtotal: string;
  createdAt: Date;
}

export interface CreateOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// Session Types (extending NextAuth to support both admin and customer sessions)
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      // Admin-specific properties
      role?: 'SUPER_ADMIN' | 'PRODUCT_MANAGER';
      // Customer-specific properties
      phoneNumber?: string;
    };
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    // Admin-specific properties
    role?: 'SUPER_ADMIN' | 'PRODUCT_MANAGER';
    // Customer-specific properties
    phoneNumber?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    // Admin-specific properties
    role?: 'SUPER_ADMIN' | 'PRODUCT_MANAGER';
    // Customer-specific properties
    phoneNumber?: string;
  }
}
