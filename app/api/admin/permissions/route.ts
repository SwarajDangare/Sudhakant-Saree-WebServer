import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { permissions } from '@/db/schema';
import { desc } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Fetch all permissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can access permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allPermissions = await db
      .select()
      .from(permissions)
      .orderBy(permissions.category, desc(permissions.createdAt));

    return NextResponse.json({ permissions: allPermissions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

// POST - Create new permission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPER_ADMIN can create permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, key, description, category, active } = body;

    // Validate required fields
    if (!name || !key || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, key, description, category' },
        { status: 400 }
      );
    }

    // Create permission
    const [newPermission] = await db
      .insert(permissions)
      .values({
        name,
        key,
        description,
        category,
        active: active !== undefined ? active : true,
      })
      .returning();

    return NextResponse.json(
      { permission: newPermission, message: 'Permission created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating permission:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Permission key already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}
