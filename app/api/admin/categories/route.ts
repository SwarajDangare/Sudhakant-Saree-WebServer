import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, categories } from '@/db';

export const dynamic = 'force-dynamic';

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Create the category
    const [newCategory] = await db
      .insert(categories)
      .values({
        sectionId,
        name,
        slug,
        description: description || null,
        order: order || 0,
        active: active ?? true,
      })
      .returning();

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

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
