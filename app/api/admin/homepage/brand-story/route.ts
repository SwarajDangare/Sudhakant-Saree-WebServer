import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { brandStory, brandStoryStats } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET the brand story with stats
export async function GET() {
  try {
    const [story] = await db.select().from(brandStory).limit(1);

    if (!story) {
      return NextResponse.json(null);
    }

    const stats = await db
      .select()
      .from(brandStoryStats)
      .where(eq(brandStoryStats.brandStoryId, story.id))
      .orderBy(brandStoryStats.displayOrder);

    return NextResponse.json({ ...story, stats });
  } catch (error: any) {
    console.error('Error fetching brand story:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch brand story' },
      { status: 500 }
    );
  }
}

// PUT update the brand story
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      heading,
      subtitle,
      description,
      imageUrl,
      imagePublicId,
      buttonText,
      buttonLink,
      isActive,
      stats,
    } = body;

    if (!heading || !description || !imageUrl) {
      return NextResponse.json(
        { error: 'Heading, description, and image are required' },
        { status: 400 }
      );
    }

    // Check if story exists
    const [existingStory] = await db.select().from(brandStory).limit(1);

    let updatedStory;

    if (existingStory) {
      // Update existing
      [updatedStory] = await db
        .update(brandStory)
        .set({
          heading,
          subtitle: subtitle || null,
          description,
          imageUrl,
          imagePublicId: imagePublicId || '',
          buttonText: buttonText || 'Our Story',
          buttonLink: buttonLink || '/about',
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date(),
        })
        .returning();

      // Delete old stats and insert new ones
      await db.delete(brandStoryStats).where(eq(brandStoryStats.brandStoryId, existingStory.id));
    } else {
      // Create new
      [updatedStory] = await db
        .insert(brandStory)
        .values({
          id: crypto.randomUUID(),
          heading,
          subtitle: subtitle || null,
          description,
          imageUrl,
          imagePublicId: imagePublicId || '',
          buttonText: buttonText || 'Our Story',
          buttonLink: buttonLink || '/about',
          isActive: isActive !== undefined ? isActive : true,
        })
        .returning();
    }

    // Insert stats
    if (stats && stats.length > 0) {
      await db.insert(brandStoryStats).values(
        stats.map((stat: any, index: number) => ({
          id: crypto.randomUUID(),
          brandStoryId: updatedStory.id,
          label: stat.label,
          value: stat.value,
          displayOrder: index,
        }))
      );
    }

    // Revalidate pages to show changes immediately
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/homepage/brand-story');

    return NextResponse.json(updatedStory);
  } catch (error: any) {
    console.error('Error updating brand story:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update brand story' },
      { status: 500 }
    );
  }
}
