import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, users } from '@/db';
import { isSuperAdmin } from '@/lib/permissions';
import UserManagementClient from '@/components/admin/UserManagementClient';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Only super admin can access this page
  if (!isSuperAdmin(session.user.role)) {
    redirect('/admin/dashboard');
  }

  // Fetch all users
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-gray-600 mt-2">
            Manage admin users and their roles
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">User Roles:</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li><strong>Super Admin:</strong> Complete access to all features. Can manage admin users.</li>
          <li><strong>Shop Manager:</strong> Can manage products, add categories, view and update all orders.</li>
          <li><strong>Salesman:</strong> Can add/edit products and view active orders only.</li>
        </ul>
      </div>

      {/* User Management Client Component */}
      <UserManagementClient initialUsers={allUsers} />
    </div>
  );
}
