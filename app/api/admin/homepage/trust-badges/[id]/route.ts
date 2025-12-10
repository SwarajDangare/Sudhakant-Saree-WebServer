import { NextResponse } from 'next/server';
import { db } from '@/db';
import { trustBadges } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT update trust badge
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, iconType, displayOrder, isActive } = body;

    if (!title || !description || !iconType) {
      return NextResponse.json(
        { error: 'Title, description, and icon type are required' },
        { status: 400 }
      );
    }

    const [updatedBadge] = await db
      .update(trustBadges)
      .set({
        title,
        description,
        iconType,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(trustBadges.id, params.id))
      .returning();

    if (!updatedBadge) {
      return NextResponse.json(
        { error: 'Trust badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBadge);
  } catch (error: any) {
    console.error('Error updating trust badge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update trust badge' },
      { status: 500 }
    );
  }
}

// DELETE trust badge
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(trustBadges).where(eq(trustBadges.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting trust badge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete trust badge' },
      { status: 500 }
    );
  }
}
