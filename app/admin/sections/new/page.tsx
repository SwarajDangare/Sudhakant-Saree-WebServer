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

  // Check if user is super admin
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/sections"
        className="inline-flex items-center text-gray-600 hover:text-maroon mb-4 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Sections
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Section</h1>
        <p className="text-gray-600 mt-1">
          Create a new top-level product section
        </p>
      </div>

      {/* Form */}
      <SectionForm />
    </div>
  );
}
