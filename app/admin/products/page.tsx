import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, products, categories, sections, productColors, productImages } from '@/db';
import { eq, desc, like, or, and, gte, lte, sql } from 'drizzle-orm';
import ModernProductsClient from '@/components/admin/ModernProductsClient';

// Make this page dynamic
export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  section?: string;
  category?: string;
  status?: string;
  minPrice?: string;
  maxPrice?: string;
  material?: string;
  featured?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Build query conditions
  const conditions = [];

  if (searchParams.search) {
    conditions.push(
      or(
        like(products.name, `%${searchParams.search}%`),
        like(products.description, `%${searchParams.search}%`)
      )
    );
  }

  if (searchParams.category) {
    conditions.push(eq(products.categoryId, searchParams.category));
  }

  if (searchParams.status === 'active') {
    conditions.push(eq(products.active, true));
  } else if (searchParams.status === 'inactive') {
    conditions.push(eq(products.active, false));
  }

  if (searchParams.featured === 'true') {
    conditions.push(eq(products.featured, true));
  }

  if (searchParams.minPrice) {
    conditions.push(gte(products.price, searchParams.minPrice));
  }

  if (searchParams.maxPrice) {
    conditions.push(lte(products.price, searchParams.maxPrice));
  }

  if (searchParams.material) {
    conditions.push(like(products.material, `%${searchParams.material}%`));
  }

  // Fetch products with all relations
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      material: products.material,
      occasion: products.occasion,
      featured: products.featured,
      active: products.active,
      discountType: products.discountType,
      discountValue: products.discountValue,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
        sectionId: categories.sectionId,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(products.createdAt));

  // Filter by section if specified
  let filteredProducts = allProducts;
  if (searchParams.section) {
    filteredProducts = allProducts.filter(p => p.category?.sectionId === searchParams.section);
  }

  // Fetch product images and colors for each product
  const productsWithDetails = await Promise.all(
    filteredProducts.map(async (product) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(productImages.displayOrder)
        .limit(1);

      const colors = await db
        .select()
        .from(productColors)
        .where(eq(productColors.productId, product.id))
        .limit(5);

      return {
        ...product,
        primaryImage: images[0] || null,
        colorCount: colors.length,
        colors: colors,
      };
    })
  );

  // Fetch filters data
  const allSections = await db.select().from(sections).where(eq(sections.active, true)).orderBy(sections.name);
  const allCategories = await db.select().from(categories).where(eq(categories.active, true)).orderBy(categories.name);

  // Get unique materials from products
  const materialsResult = await db
    .selectDistinct({ material: products.material })
    .from(products)
    .where(sql`${products.material} IS NOT NULL`);
  const materials = materialsResult.map(m => m.material).filter(Boolean) as string[];

  // Calculate statistics
  const stats = {
    total: productsWithDetails.length,
    active: productsWithDetails.filter(p => p.active).length,
    inactive: productsWithDetails.filter(p => !p.active).length,
    featured: productsWithDetails.filter(p => p.featured).length,
    lowStock: 0, // You can implement stock tracking later
  };

  return (
    <ModernProductsClient
      products={productsWithDetails}
      sections={allSections}
      categories={allCategories}
      materials={materials}
      stats={stats}
      searchParams={searchParams}
    />
  );
}
