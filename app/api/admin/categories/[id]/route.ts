import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, categories } from '@/db';
import { eq } from 'drizzle-orm';
import { requirePermission, requireAnyPermission, getPermissionErrorMessage } from '@/lib/permission-guards';
import { getServerPermissions } from '@/lib/server-permissions';

export const dynamic = 'force-dynamic';

// GET - Fetch a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has permission to view categories
    const permissionError = requireAnyPermission(
      session,
      ['canAddCategories', 'canEditCategories', 'canDeleteCategories'],
      'You do not have permission to access categories.'
    );
    if (permissionError) {
      return permissionError;
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, params.id));

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has permission to edit categories
    const permissionError = requirePermission(
      session,
      'canEditCategories',
      getPermissionErrorMessage('canEditCategories')
    );
    if (permissionError) {
      return permissionError;
    }

    const body = await request.json();
    const { sectionId, name, slug, description, order, active } = body;

    // Validate required fields
    if (!sectionId || !name || !slug) {
      return NextResponse.json(
        { error: 'Section, name, and slug are required' },
        { status: 400 }
      );
    }

    // Update the category
    const [updatedCategory] = await db
      .update(categories)
      .set({
        sectionId,
        name,
        slug,
        description: description || null,
        order: order || 0,
        active: active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, params.id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);

    // Check for unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete categories using new system
    const permissions = await getServerPermissions();
    if (!permissions.canDeleteCategories) {
      return NextResponse.json(
        { error: 'You do not have permission to delete categories' },
        { status: 403 }
      );
    }

    // Delete the category
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, params.id))
      .returning();

    if (!deletedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);

    // Check for foreign key constraint violation
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing products' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
