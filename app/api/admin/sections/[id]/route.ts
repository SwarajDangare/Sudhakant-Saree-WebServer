import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, sections } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Fetch a single section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, params.id))
      .limit(1);

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PUT - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, order, active } = body;

    console.log('Updating section:', params.id, body);

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Update the section
    const [updatedSection] = await db
      .update(sections)
      .set({
        name,
        slug,
        description: description || null,
        order: order || 0,
        active: active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(sections.id, params.id))
      .returning();

    if (!updatedSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    console.log('Section updated successfully:', updatedSection);

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);

    // Check for unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A section with this slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Deleting section:', params.id);

    // Delete the section
    const [deletedSection] = await db
      .delete(sections)
      .where(eq(sections.id, params.id))
      .returning();

    if (!deletedSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    console.log('Section deleted successfully:', deletedSection);

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);

    // Check for foreign key constraint (section has categories)
    if (error instanceof Error && error.message.includes('foreign key')) {
      return NextResponse.json(
        { error: 'Cannot delete section with existing categories. Please delete or reassign categories first.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
