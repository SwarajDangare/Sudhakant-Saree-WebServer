import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { permissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT - Update permission
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
    const { name, key, description, category, active } = body;

    const [updated] = await db
      .update(permissions)
      .set({
        ...(name && { name }),
        ...(key && { key }),
        ...(description && { description }),
        ...(category && { category }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      })
      .where(eq(permissions.id, params.id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    return NextResponse.json(
      { permission: updated, message: 'Permission updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating permission:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Permission key already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 }
    );
  }
}

// DELETE - Delete permission
export async function DELETE(
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

    const [deleted] = await db
      .delete(permissions)
      .where(eq(permissions.id, params.id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Permission deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting permission:', error);
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 }
    );
  }
}
