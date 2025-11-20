import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { isSuperAdmin } from '@/lib/permissions';

/**
 * GET /api/admin/users/[id]
 * Get a specific user (SUPER_ADMIN only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [user] = await db
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
      .where(eq(users.id, params.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a user (SUPER_ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, role, active } = body;

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent changing super admin's role or deactivating them
    if (existingUser.role === 'SUPER_ADMIN' && existingUser.email === 'swarajdangare2016@gmail.com') {
      if (role && role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Cannot change the super admin\'s role' },
          { status: 400 }
        );
      }
      if (active === false) {
        return NextResponse.json(
          { error: 'Cannot deactivate the super admin' },
          { status: 400 }
        );
      }
    }

    // Check if trying to create another super admin
    if (role === 'SUPER_ADMIN' && existingUser.role !== 'SUPER_ADMIN') {
      const existingSuperAdmins = await db
        .select()
        .from(users)
        .where(eq(users.role, 'SUPER_ADMIN'))
        .limit(1);

      if (existingSuperAdmins.length > 0) {
        return NextResponse.json(
          { error: 'A super admin already exists. Only one super admin is allowed.' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const [emailExists] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (typeof active === 'boolean') updateData.active = active;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, params.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (SUPER_ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSuperAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting the super admin
    if (existingUser.role === 'SUPER_ADMIN' && existingUser.email === 'swarajdangare2016@gmail.com') {
      return NextResponse.json(
        { error: 'Cannot delete the super admin' },
        { status: 400 }
      );
    }

    // Delete user
    await db.delete(users).where(eq(users.id, params.id));

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
