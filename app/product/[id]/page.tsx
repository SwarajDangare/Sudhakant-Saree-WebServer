import { db, products, categories, productColors } from '@/db';
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
    category: category?.name || 'Uncategorized',
    colors: colors.map(color => ({
      color: color.color,
      colorCode: color.colorCode,
      inStock: color.inStock,
      images: [], // Empty array for now - will add image support later
    })),
  };

  return <ProductDetailClient product={productWithRelations} />;
}
