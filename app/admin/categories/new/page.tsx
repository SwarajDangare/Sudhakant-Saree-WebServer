import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, sections } from '@/db';
import { eq } from 'drizzle-orm';
import CategoryForm from '@/components/admin/CategoryForm';
import Link from 'next/link';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const userRole = session.user.role;

  // Check if user has permission to add categories (SUPER_ADMIN or SHOP_MANAGER)
  if (userRole !== 'SUPER_ADMIN' && userRole !== 'SHOP_MANAGER') {
    redirect('/admin/dashboard');
  }

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Fetch sections for the form
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  return (
    <div className="space-y-6">
      {!isSuperAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As a shop manager, you can add categories to existing sections
            but cannot create new sections. Please select a section from the dropdown below.
          </p>
        </div>
      )}

      {/* Form */}
      <CategoryForm sections={allSections} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
