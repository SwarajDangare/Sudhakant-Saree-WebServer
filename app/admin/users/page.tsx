import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, users, permissions, rolePermissions } from '@/db';
import { isSuperAdmin } from '@/lib/permissions';
import TeamManagementSimple from '@/components/admin/TeamManagementSimple';
import PermissionMatrixManager, { type RolePermissionMatrix } from '@/components/admin/PermissionMatrixManager';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.role) {
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

  // Fetch all permissions with their role mappings
  const allPermissions = await db
    .select()
    .from(permissions)
    .orderBy(permissions.category, permissions.name);

  const allRolePermissions = await db
    .select()
    .from(rolePermissions);

  // Build the matrix
  const matrix: RolePermissionMatrix = {
    SUPER_ADMIN: {},
    SHOP_MANAGER: {},
    SALESMAN: {},
  };

  // Initialize all permissions to false
  allPermissions.forEach(perm => {
    matrix.SUPER_ADMIN[perm.id] = false;
    matrix.SHOP_MANAGER[perm.id] = false;
    matrix.SALESMAN[perm.id] = false;
  });

  // Set enabled permissions to true
  allRolePermissions.forEach(rp => {
    if (matrix[rp.role]) {
      matrix[rp.role][rp.permissionId] = rp.enabled;
    }
  });

  return (
    <div className="space-y-8">
      {/* User Management Section */}
      <TeamManagementSimple initialUsers={allUsers} />

      {/* Divider */}
      <div className="border-t border-gray-200 my-8"></div>

      {/* Permission Management Section */}
      <PermissionMatrixManager
        initialPermissions={allPermissions}
        initialMatrix={matrix}
      />
    </div>
  );
}
