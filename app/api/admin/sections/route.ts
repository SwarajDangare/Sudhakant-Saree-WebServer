import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, sections } from '@/db';
import { requirePermission, requireAnyPermission, getPermissionErrorMessage } from '@/lib/permission-guards';

export const dynamic = 'force-dynamic';

// GET - Fetch all sections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has permission to view/edit sections
    const permissionError = requireAnyPermission(
      session,
      ['canAddSections', 'canEditSections', 'canDeleteSections'],
      'You do not have permission to access sections.'
    );
    if (permissionError) {
      return permissionError;
    }

    const allSections = await db.select().from(sections);

    return NextResponse.json(allSections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST - Create a new section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('POST /api/admin/sections - Session:', session?.user);

    // Check if user has permission to add sections
    const permissionError = requirePermission(
      session,
      'canAddSections',
      getPermissionErrorMessage('canAddSections')
    );
    if (permissionError) {
      return permissionError;
    }

    const body = await request.json();
    const { name, slug, description, order, active } = body;

    console.log('Creating section with data:', { name, slug, description, order, active });

    // Validate required fields
    if (!name || !slug) {
      console.error('Missing required fields:', { name, slug });
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Create the section
    const [newSection] = await db
      .insert(sections)
      .values({
        name,
        slug,
        description: description || null,
        order: order || 0,
        active: active ?? true,
      })
      .returning();

    console.log('Section created successfully:', newSection);

    return NextResponse.json(newSection, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);

    // Check for unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A section with this slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create section. Please try again.' },
      { status: 500 }
    );
  }
}
