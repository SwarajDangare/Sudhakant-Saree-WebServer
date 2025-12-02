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

  const userRole = session.user.role;

  // Check if user has permission to edit categories (SUPER_ADMIN or SHOP_MANAGER)
  if (userRole !== 'SUPER_ADMIN' && userRole !== 'SHOP_MANAGER') {
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
      <CategoryForm sections={allSections} category={category} />
    </div>
  );
}
