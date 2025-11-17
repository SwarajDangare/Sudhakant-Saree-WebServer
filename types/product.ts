export interface ColorVariant {
  color: string;
  colorCode: string;
  inStock: boolean;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | string;
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
