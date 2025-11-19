export interface ColorVariant {
  id?: string; // Optional for backward compatibility
  color: string;
  colorCode: string;
  inStock: boolean;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string; // Category slug for routing
  categoryName?: string; // Category name for display
  price: number | string;
  discountType?: 'NONE' | 'PERCENTAGE' | 'FIXED';
  discountValue?: number | string;
  description: string;
  material: string | null;
  length: string | null;
  occasion: string | null;
  careInstructions: string | null;
  colors: ColorVariant[];
  featured: boolean;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string;
}
