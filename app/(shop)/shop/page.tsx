import { db, products, categories, sections, productColors } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import ShopClient from './ShopClient';

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

// Make page dynamic - fetch data on each request
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All Sarees - Sudhakant Sarees',
  description: 'Browse our complete collection of handcrafted sarees. Filter by material, color, occasion, and price. Traditional to contemporary designs.',
  keywords: 'sarees online, buy sarees, silk sarees, cotton sarees, wedding sarees, traditional sarees',
};

export default async function ShopPage() {
  // Fetch all active products with their categories and sections
  const allProducts = await db
    .select({
      product: products,
      category: categories,
      section: sections,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(sections, eq(categories.sectionId, sections.id))
    .where(eq(products.active, true))
    .orderBy(sql`${products.featured} DESC, ${products.createdAt} DESC`);

  // Fetch colors for each product
  const productsWithColors = await Promise.all(
    allProducts.map(async ({ product, category, section }) => {
      const colors = await db
        .select()
        .from(productColors)
        .where(eq(productColors.productId, product.id));

      return {
        ...product,
        categoryName: category?.name || 'Uncategorized',
        categorySlug: category?.slug || 'uncategorized',
        sectionName: section?.name || 'Uncategorized',
        sectionSlug: section?.slug || 'uncategorized',
        sectionId: section?.id || null,
        categoryId: category?.id || null,
        colors: colors.map(c => ({
          id: c.id,
          color: c.color,
          colorCode: c.colorCode,
          inStock: c.inStock,
        })),
      };
    })
  );

  // Fetch all active sections for filter
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  // Fetch all active categories for filter
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      sectionId: categories.sectionId,
    })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.order, categories.name);

  // Get unique filter options from products
  const uniqueMaterials = Array.from(
    new Set(
      allProducts
        .map(p => p.product.material)
        .filter((m): m is string => m !== null && m !== undefined && m.trim() !== '')
    )
  ).sort();

  const uniqueOccasions = Array.from(
    new Set(
      allProducts
        .map(p => p.product.occasion)
        .filter((o): o is string => o !== null && o !== undefined && o.trim() !== '')
    )
  ).sort();

  const uniqueWorkTypes = Array.from(
    new Set(
      allProducts
        .map(p => p.product.workType)
        .filter((w): w is string => w !== null && w !== undefined && w.trim() !== '')
    )
  ).sort();

  const uniqueBorderTypes = Array.from(
    new Set(
      allProducts
        .map(p => p.product.borderType)
        .filter((b): b is string => b !== null && b !== undefined && b.trim() !== '')
    )
  ).sort();

  // Get all unique colors
  const allColors = await db
    .selectDistinct({
      color: productColors.color,
      colorCode: productColors.colorCode,
    })
    .from(productColors)
    .orderBy(productColors.color);

  // Get price range
  const prices = allProducts.map(p => Number(p.product.price));
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));

  const filterOptions = {
    sections: allSections.map(s => ({ id: s.id, name: s.name, slug: s.slug })),
    categories: allCategories,
    materials: uniqueMaterials,
    occasions: uniqueOccasions,
    workTypes: uniqueWorkTypes,
    borderTypes: uniqueBorderTypes,
    colors: allColors,
    priceRange: { min: minPrice, max: maxPrice },
  };

  return (
    <ShopClient
      products={productsWithColors}
      filterOptions={filterOptions}
    />
  );
}
