import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SectionForm from '@/components/admin/SectionForm';
import Link from 'next/link';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function NewSectionPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Check if user is super admin or shop manager
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SHOP_MANAGER') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="space-y-6">
      <SectionForm />
    </div>
  );
}
