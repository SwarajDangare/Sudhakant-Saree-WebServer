import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories, sections } from '@/db';
import { eq } from 'drizzle-orm';
import ModernProductForm from '@/components/admin/ModernProductForm';
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
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-2">
                Create a new product listing for your saree collection
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <ModernProductForm sections={allSections} categories={allCategories} />
      </div>
    </div>
  );
}
