import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db, products, categories, sections, productColors, colorImages } from '@/db';
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

  // Fetch colors and their images
  const colors = await db
    .select()
    .from(productColors)
    .where(eq(productColors.productId, params.id));

  const colorsWithImages = await Promise.all(
    colors.map(async (color) => {
      const images = await db
        .select()
        .from(colorImages)
        .where(eq(colorImages.productColorId, color.id))
        .orderBy(asc(colorImages.displayOrder));

      return {
        id: color.id,
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
      };
    })
  );

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
    colors: colorsWithImages,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-xs text-gray-500">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {product.active ? (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Active
            </div>
          ) : (
            <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              Inactive
            </div>
          )}
          {product.featured && (
            <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
        </div>
      </div>

      {/* Product Form */}
      <CompactProductForm sections={allSections} categories={allCategories} initialData={initialData} />
    </div>
  );
}
