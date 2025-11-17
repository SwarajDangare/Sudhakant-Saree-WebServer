import { db, products } from '@/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Generate static params for all products at build time
export async function generateStaticParams() {
  const allProducts = await db.select({ id: products.id }).from(products);
  return allProducts.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, params.id))
    .limit(1);

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

export default async function ProductPage({ params }: ProductPageProps) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, params.id))
    .limit(1);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
