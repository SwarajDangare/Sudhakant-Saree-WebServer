import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db, sections } from '@/db';
import { eq } from 'drizzle-orm';
import SectionForm from '@/components/admin/SectionForm';
import Link from 'next/link';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function EditSectionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Check if user is super admin or shop manager
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SHOP_MANAGER') {
    redirect('/admin/dashboard');
  }

  // Fetch the section
  const [section] = await db
    .select()
    .from(sections)
    .where(eq(sections.id, params.id))
    .limit(1);

  if (!section) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionForm section={section} />
    </div>
  );
}
