import { NextResponse } from 'next/server';
import { db } from '@/db';
import { heroSlides } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, subtitle, description, imageUrl, imagePublicId, ctaText, ctaLink, displayOrder, isActive } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const [updated] = await db.update(heroSlides).set({
      title,
      subtitle: subtitle || null,
      description: description || null,
      imageUrl,
      imagePublicId: imagePublicId || '',
      ctaText: ctaText || 'Shop Now',
      ctaLink: ctaLink || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
    }).where(eq(heroSlides.id, params.id)).returning();

    if (!updated) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(heroSlides).where(eq(heroSlides.id, params.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
