import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories, sections } from '@/db';
import { eq } from 'drizzle-orm';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch sections for the form
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  // Fetch categories for the form
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      sectionId: categories.sectionId,
    })
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.name);

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">
          Create a new product listing for your store
        </p>
      </div>

      {/* Form */}
      <ProductForm sections={allSections} categories={allCategories} />
    </div>
  );
}
