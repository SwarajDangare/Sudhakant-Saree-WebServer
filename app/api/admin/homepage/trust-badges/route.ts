import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { trustBadges } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all trust badges
export async function GET() {
  try {
    const badges = await db
      .select()
      .from(trustBadges)
      .orderBy(trustBadges.displayOrder);

    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching trust badges:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trust badges' },
      { status: 500 }
    );
  }
}

// POST create new trust badge
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, iconType, displayOrder, isActive } = body;

    if (!title || !description || !iconType) {
      return NextResponse.json(
        { error: 'Title, description, and icon type are required' },
        { status: 400 }
      );
    }

    const [newBadge] = await db
      .insert(trustBadges)
      .values({
        id: crypto.randomUUID(),
        title,
        description,
        iconType,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    revalidatePath('/');
    return NextResponse.json(newBadge, { status: 201 });
  } catch (error: any) {
    console.error('Error creating trust badge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create trust badge' },
      { status: 500 }
    );
  }
}
