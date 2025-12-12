import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, categories } from '@/db';
import { requirePermission, requireAnyPermission, getPermissionErrorMessage } from '@/lib/permission-guards';

export const dynamic = 'force-dynamic';

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has permission to view/edit categories
    const permissionError = requireAnyPermission(
      session,
      ['canAddCategories', 'canEditCategories', 'canDeleteCategories'],
      'You do not have permission to access categories.'
    );
    if (permissionError) {
      return permissionError;
    }

    const allCategories = await db.select().from(categories);

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('POST /api/admin/categories - Session:', session?.user);

    // Check if user has permission to add categories
    const permissionError = requirePermission(
      session,
      'canAddCategories',
      getPermissionErrorMessage('canAddCategories')
    );
    if (permissionError) {
      return permissionError;
    }

    const body = await request.json();
    const { sectionId, name, slug, description, order, active, imageUrl, imagePublicId } = body;

    console.log('Creating category with data:', { sectionId, name, slug, description, order, active, imageUrl, imagePublicId });

    // Validate required fields
    if (!sectionId || !name || !slug) {
      console.error('Missing required fields:', { sectionId, name, slug });
      return NextResponse.json(
        { error: 'Section, name, and slug are required' },
        { status: 400 }
      );
    }

    // Validate image fields (required)
    if (!imageUrl || !imagePublicId) {
      console.error('Missing required image fields:', { imageUrl, imagePublicId });
      return NextResponse.json(
        { error: 'Image URL and Image Public ID are required' },
        { status: 400 }
      );
    }

    // Create the category
    const [newCategory] = await db
      .insert(categories)
      .values({
        sectionId,
        name,
        slug,
        description: description || null,
        imageUrl,
        imagePublicId,
        order: order || 0,
        active: active ?? true,
      })
      .returning();

    console.log('Category created successfully:', newCategory);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    // Check for unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Check for foreign key constraint (invalid sectionId)
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Invalid section ID. Please select a valid section.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category. Please try again.' },
      { status: 500 }
    );
  }
}
