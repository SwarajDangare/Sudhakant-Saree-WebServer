import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, users } from '@/db';
import { isSuperAdmin } from '@/lib/permissions';
import TeamPermissionsMatrix from '@/components/admin/TeamPermissionsMatrix';

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

  return <TeamPermissionsMatrix initialUsers={allUsers} />;
}
