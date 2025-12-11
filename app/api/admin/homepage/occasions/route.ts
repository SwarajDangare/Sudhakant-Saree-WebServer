import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { occasions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all occasions
export async function GET() {
  try {
    const allOccasions = await db
      .select()
      .from(occasions)
      .orderBy(occasions.displayOrder);

    return NextResponse.json(allOccasions);
  } catch (error: any) {
    console.error('Error fetching occasions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch occasions' },
      { status: 500 }
    );
  }
}

// POST create new occasion
export async function POST(request: Request) {
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

    const [newOccasion] = await db
      .insert(occasions)
      .values({
        id: crypto.randomUUID(),
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
      })
      .returning();

    revalidatePath('/');
    return NextResponse.json(newOccasion, { status: 201 });
  } catch (error: any) {
    console.error('Error creating occasion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create occasion' },
      { status: 500 }
    );
  }
}
