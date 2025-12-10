import { NextResponse } from 'next/server';
import { db } from '@/db';
import { occasions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT update occasion
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      icon,
      imageUrl,
      imagePublicId,
      linkUrl,
      gradientFrom,
      gradientTo,
      displayOrder,
      isActive,
    } = body;

    if (!name || !slug || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, slug, and image are required' },
        { status: 400 }
      );
    }

    const [updatedOccasion] = await db
      .update(occasions)
      .set({
        name,
        slug,
        icon: icon || '🎉',
        imageUrl,
        imagePublicId: imagePublicId || '',
        linkUrl: linkUrl || null,
        gradientFrom: gradientFrom || 'rgba(219, 39, 119, 0.8)',
        gradientTo: gradientTo || 'rgba(220, 38, 38, 0.8)',
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(occasions.id, params.id))
      .returning();

    if (!updatedOccasion) {
      return NextResponse.json(
        { error: 'Occasion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOccasion);
  } catch (error: any) {
    console.error('Error updating occasion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update occasion' },
      { status: 500 }
    );
  }
}

// DELETE occasion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(occasions).where(eq(occasions.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting occasion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete occasion' },
      { status: 500 }
    );
  }
}
