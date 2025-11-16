import { mockProducts } from '@/data/mockProducts';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

export const runtime = 'edge';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Generate static params for all products at build time
export function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id,
  }));
}

export function generateMetadata({ params }: ProductPageProps) {
  const product = mockProducts.find(p => p.id === params.id);

  if (!product) {
    return {
      title: 'Product Not Found - Sudhakant Sarees',
    };
  }

  return {
    title: `${product.name} - Sudhakant Sarees`,
    description: product.description,
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = mockProducts.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
