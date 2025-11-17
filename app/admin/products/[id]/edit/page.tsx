import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db, products, categories } from '@/db';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

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

  // Fetch all categories for the form
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .orderBy(categories.name);

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
    length: product.length || '',
    occasion: product.occasion || '',
    careInstructions: product.careInstructions || '',
    active: product.active,
    featured: product.featured,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/products"
        className="inline-flex items-center text-gray-600 hover:text-maroon mb-4 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Products
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">Update the details for {product.name}</p>
      </div>

      {/* Product Form */}
      <ProductForm categories={allCategories} initialData={initialData} />
    </div>
  );
}
