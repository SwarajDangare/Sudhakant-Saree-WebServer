import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { permissions, rolePermissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { clearPermissionCache } from '@/lib/permissions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Fetch role permissions matrix
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all permissions with their role mappings
    const allPermissions = await db
      .select()
      .from(permissions)
      .orderBy(permissions.category, permissions.name);

    const allRolePermissions = await db
      .select()
      .from(rolePermissions);

    // Build the matrix
    const matrix: Record<string, Record<string, boolean>> = {
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

    return NextResponse.json(
      {
        permissions: allPermissions,
        rolePermissions: matrix,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
}

// PUT - Update role permissions matrix
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { rolePermissions: matrix } = body;

    if (!matrix) {
      return NextResponse.json(
        { error: 'Missing rolePermissions in request body' },
        { status: 400 }
      );
    }

    // Prepare batch operations
    const roles = ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] as const;
    type UserRole = typeof roles[number];
    const updates: Array<{role: UserRole, permissionId: string, enabled: boolean}> = [];

    for (const role of roles) {
      if (!matrix[role]) continue;

      for (const [permissionId, enabled] of Object.entries(matrix[role])) {
        updates.push({
          role: role as UserRole,
          permissionId: permissionId as string,
          enabled: enabled as boolean,
        });
      }
    }

    // Delete all existing role permissions
    await db.delete(rolePermissions).execute();

    // Batch insert all new permissions
    if (updates.length > 0) {
      await db.insert(rolePermissions).values(updates);
    }

    // Clear permission cache so changes take effect immediately
    clearPermissionCache();

    return NextResponse.json(
      { message: 'Role permissions updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update role permissions' },
      { status: 500 }
    );
  }
}
