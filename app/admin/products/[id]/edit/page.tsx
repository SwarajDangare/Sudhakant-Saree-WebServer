import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db, products, categories, sections, productColors, colorImages } from '@/db';
import { eq, asc } from 'drizzle-orm';
import Link from 'next/link';
import ModernProductForm from '@/components/admin/ModernProductForm';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl soft-shadow p-6">
          {/* Back Button */}
          <Link
            href="/admin/products"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-4 transition group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>

          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Edit Product
              </h1>
              <p className="text-gray-600 mt-2">
                Update the details for <span className="font-semibold text-gray-900">{product.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <ModernProductForm sections={allSections} categories={allCategories} initialData={initialData} />
      </div>
    </div>
  );
}
