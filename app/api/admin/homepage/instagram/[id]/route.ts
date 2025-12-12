import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { instagramPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT update Instagram post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { imageUrl, imagePublicId, postUrl, caption, displayOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const [updatedPost] = await db
      .update(instagramPosts)
      .set({
        imageUrl,
        imagePublicId: imagePublicId || '',
        postUrl: postUrl || null,
        caption: caption || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(instagramPosts.id, params.id))
      .returning();

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Instagram post not found' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error('Error updating Instagram post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update Instagram post' },
      { status: 500 }
    );
  }
}

// DELETE Instagram post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(instagramPosts).where(eq(instagramPosts.id, params.id));

    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting Instagram post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete Instagram post' },
      { status: 500 }
    );
  }
}
