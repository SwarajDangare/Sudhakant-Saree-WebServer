export interface ColorVariant {
  color: string;
  colorCode: string;
  image: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'silk' | 'cotton' | 'banarasi' | 'kanjivaram' | 'patola';
  price: number;
  description: string;
  material: string;
  length: string;
  occasion: string;
  careInstructions: string;
  colors: ColorVariant[];
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}
