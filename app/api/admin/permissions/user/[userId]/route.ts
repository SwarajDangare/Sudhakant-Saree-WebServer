import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users, permissions, rolePermissions } from '@/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Users can only fetch their own permissions unless they're super admin
    if (session.user.id !== params.userId && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user's role
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, params.userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRole = user[0].role;

    // Fetch role permissions from database
    const rolePerms = await db
      .select({
        key: permissions.key,
        enabled: rolePermissions.enabled,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(
          eq(rolePermissions.role, userRole),
          eq(permissions.active, true)
        )
      );

    return NextResponse.json(
      { permissions: rolePerms },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user permissions' },
      { status: 500 }
    );
  }
}
