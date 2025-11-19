import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories, sections } from '@/db';
import { eq } from 'drizzle-orm';
import CategoryForm from '@/components/admin/CategoryForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Check if user is super admin
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/dashboard');
  }

  // Fetch the category
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, params.id));

  if (!category) {
    notFound();
  }

  // Fetch sections for the form
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/categories"
        className="inline-flex items-center text-gray-600 hover:text-maroon mb-4 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Categories
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600 mt-1">
          Update category information for &quot;{category.name}&quot;
        </p>
      </div>

      {/* Form */}
      <CategoryForm sections={allSections} category={category} />
    </div>
  );
}
