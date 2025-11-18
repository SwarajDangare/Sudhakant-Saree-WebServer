import { db, products, categories, productColors } from '@/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';

interface ProductPageProps {
  params: {
    id: string;
  };
}

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

// Make page dynamic - don't statically generate at build time
export const dynamic = 'force-dynamic';

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
  // Fetch product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, params.id))
    .limit(1);

  if (!product) {
    notFound();
  }

  // Fetch category
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, product.categoryId))
    .limit(1);

  // Fetch colors
  const colors = await db
    .select()
    .from(productColors)
    .where(eq(productColors.productId, product.id));

  // Build product object with relations
  const productWithRelations = {
    ...product,
    category: category?.slug || 'uncategorized',
    categoryName: category?.name || 'Uncategorized',
    colors: colors.map(color => ({
      color: color.color,
      colorCode: color.colorCode,
      inStock: color.inStock,
      images: [], // Empty array for now - will add image support later
    })),
  };

  return <ProductDetailClient product={productWithRelations} />;
}
