import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db, products, categories, sections, productColors, colorImages, productVariants } from '@/db';
import { eq, asc } from 'drizzle-orm';
import Link from 'next/link';
import CompactProductForm from '@/components/admin/CompactProductForm';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, params.id))
    .limit(1);

  if (!product) {
    notFound();
  }

  // Fetch all sections for the form
  const allSections = await db
    .select({
      id: sections.id,
      name: sections.name,
    })
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  // Fetch all categories for the form
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      sectionId: categories.sectionId,
    })
    .from(categories)
    .orderBy(categories.name);

  // Fetch colors and their images and variants
  const colors = await db
    .select()
    .from(productColors)
    .where(eq(productColors.productId, params.id));

  const variantsData = await Promise.all(
    colors.map(async (color) => {
      const images = await db
        .select()
        .from(colorImages)
        .where(eq(colorImages.productColorId, color.id))
        .orderBy(asc(colorImages.displayOrder));

      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productColorId, color.id));

      // Check if this color has size-based variants
      const hasSizeVariants = variants.some(v => v.size !== null);

      if (hasSizeVariants) {
        // Product with sizes - group by size
        return {
          color: color.color,
          colorCode: color.colorCode,
          inStock: color.inStock,
          images: images.map(img => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || color.color,
            displayOrder: img.displayOrder,
          })),
          sizes: variants
            .filter(v => v.size !== null)
            .map(v => ({
              size: v.size!,
              quantity: v.stockQuantity,
              sku: v.sku || '',
            })),
        };
      } else {
        // Product without sizes - single quantity
        const singleVariant = variants[0];
        return {
          color: color.color,
          colorCode: color.colorCode,
          inStock: color.inStock,
          images: images.map(img => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || color.color,
            displayOrder: img.displayOrder,
          })),
          quantity: singleVariant?.stockQuantity || 0,
          sku: singleVariant?.sku || '',
          sizes: [],
        };
      }
    })
  );

  // Detect if product has sizes by checking if any variant has sizes
  const hasSizes = variantsData.some(v => v.sizes && v.sizes.length > 0);

  // Format product data for the form
  const initialData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    discountType: product.discountType as 'NONE' | 'PERCENTAGE' | 'FIXED',
    discountValue: String(product.discountValue || 0),
    categoryId: product.categoryId,
    material: product.material || '',
    fabricComposition: product.fabricComposition || '',
    weight: product.weight || '',
    length: product.length || '',
    blousePieceIncluded: product.blousePieceIncluded || false,
    workType: product.workType || '',
    borderType: product.borderType || '',
    palluDetails: product.palluDetails || '',
    occasion: product.occasion || '',
    careInstructions: product.careInstructions || '',
    washCare: product.washCare || '',
    sku: product.sku || '',
    stockQuantity: product.stockQuantity ? String(product.stockQuantity) : '',
    tags: product.tags || '',
    metaDescription: product.metaDescription || '',
    active: product.active,
    featured: product.featured,
    variants: variantsData,
    hasSizes: hasSizes,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <CompactProductForm sections={allSections} categories={allCategories} initialData={initialData} />
    </div>
  );
}
