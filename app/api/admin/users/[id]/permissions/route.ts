import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { permissions, rolePermissions, userPermissions, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Fetch user's effective permissions (role + user overrides)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all permissions
    const allPermissions = await db
      .select()
      .from(permissions)
      .orderBy(permissions.category, permissions.name);

    // Get role permissions for this user's role
    const rolePerms = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.role, user.role));

    // Get user-specific permission overrides
    const userPerms = await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, params.id));

    // Build effective permissions map
    const effectivePermissions: Record<string, { enabled: boolean; source: 'role' | 'user' }> = {};

    // Start with role permissions
    rolePerms.forEach(rp => {
      effectivePermissions[rp.permissionId] = {
        enabled: rp.enabled,
        source: 'role'
      };
    });

    // Override with user-specific permissions
    userPerms.forEach(up => {
      effectivePermissions[up.permissionId] = {
        enabled: up.enabled,
        source: 'user'
      };
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      permissions: allPermissions,
      effectivePermissions,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user permissions' },
      { status: 500 }
    );
  }
}

// PUT - Update user-specific permissions
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { permissions: userPermsMap } = body;

    if (!userPermsMap) {
      return NextResponse.json(
        { error: 'Missing permissions in request body' },
        { status: 400 }
      );
    }

    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user permissions
    for (const [permissionId, enabled] of Object.entries(userPermsMap)) {
      // Check if user permission exists
      const existing = await db
        .select()
        .from(userPermissions)
        .where(
          and(
            eq(userPermissions.userId, params.id),
            eq(userPermissions.permissionId, permissionId as string)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(userPermissions)
          .set({
            enabled: enabled as boolean,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userPermissions.userId, params.id),
              eq(userPermissions.permissionId, permissionId as string)
            )
          );
      } else {
        // Insert new
        await db.insert(userPermissions).values({
          userId: params.id,
          permissionId: permissionId as string,
          enabled: enabled as boolean,
        });
      }
    }

    return NextResponse.json(
      { message: 'User permissions updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update user permissions' },
      { status: 500 }
    );
  }
}
