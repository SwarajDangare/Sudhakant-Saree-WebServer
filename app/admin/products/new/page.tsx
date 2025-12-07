import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories, sections } from '@/db';
import { eq } from 'drizzle-orm';
import CompactProductForm from '@/components/admin/CompactProductForm';
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
    <div className="max-w-7xl mx-auto">
      <CompactProductForm sections={allSections} categories={allCategories} />
    </div>
  );
}
