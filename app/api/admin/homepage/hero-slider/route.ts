import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { heroSlides } from '@/db/schema';

export async function GET() {
  try {
    const slides = await db.select().from(heroSlides).orderBy(heroSlides.displayOrder);
    return NextResponse.json(slides);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subtitle, description, imageUrl, imagePublicId, ctaText, ctaLink, displayOrder, isActive } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const [newSlide] = await db.insert(heroSlides).values({
      id: crypto.randomUUID(),
      title,
      subtitle: subtitle || null,
      description: description || null,
      imageUrl,
      imagePublicId: imagePublicId || '',
      ctaText: ctaText || 'Shop Now',
      ctaLink: ctaLink || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    revalidatePath('/');
    return NextResponse.json(newSlide, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
