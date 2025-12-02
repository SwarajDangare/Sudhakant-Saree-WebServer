import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PermissionMatrixManager from '@/components/admin/PermissionMatrixManager';

// Make this page dynamic
export const dynamic = 'force-dynamic';

export default async function PermissionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Only Super Admins can manage permissions
  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/dashboard');
  }

  // Fetch permissions and role matrix
  const response = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/role-permissions`,
    {
      cache: 'no-store',
      headers: {
        // Pass session cookie for authentication
        cookie: `next-auth.session-token=${session.user.id}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }

  const data = await response.json();

  return (
    <div className="space-y-6">
      <PermissionMatrixManager
        initialPermissions={data.permissions}
        initialMatrix={data.rolePermissions}
      />
    </div>
  );
}
