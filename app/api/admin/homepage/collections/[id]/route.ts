import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { collections } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT update collection
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      tagline,
      description,
      imageUrl,
      imagePublicId,
      linkUrl,
      productsCount,
      isFeatured,
      displayOrder,
      isActive,
    } = body;

    if (!name || !slug || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, slug, and image are required' },
        { status: 400 }
      );
    }

    const [updatedCollection] = await db
      .update(collections)
      .set({
        name,
        slug,
        tagline: tagline || null,
        description: description || null,
        imageUrl,
        imagePublicId: imagePublicId || '',
        linkUrl: linkUrl || null,
        productsCount: productsCount || 0,
        isFeatured: isFeatured !== undefined ? isFeatured : true,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(collections.id, params.id))
      .returning();

    if (!updatedCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    return NextResponse.json(updatedCollection);
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE collection
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(collections).where(eq(collections.id, params.id));

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
