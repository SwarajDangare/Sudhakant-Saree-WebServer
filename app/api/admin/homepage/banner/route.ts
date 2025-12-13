import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { midPageBanner } from '@/db/schema';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET the mid-page banner
export async function GET() {
  try {
    const [banner] = await db.select().from(midPageBanner).limit(1);

    return NextResponse.json(banner || null);
  } catch (error: any) {
    console.error('Error fetching mid-page banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PUT update the mid-page banner
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      imageUrl,
      imagePublicId,
      linkUrl,
      linkText,
      gradientColor,
      isActive,
    } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Check if banner exists
    const [existingBanner] = await db.select().from(midPageBanner).limit(1);

    let updatedBanner;

    if (existingBanner) {
      // Update existing
      [updatedBanner] = await db
        .update(midPageBanner)
        .set({
          title,
          subtitle: subtitle || null,
          description: description || null,
          imageUrl,
          imagePublicId: imagePublicId || '',
          linkUrl: linkUrl || null,
          linkText: linkText || 'Shop Now',
          gradientColor: gradientColor || '#800000',
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date(),
        })
        .returning();
    } else {
      // Create new
      [updatedBanner] = await db
        .insert(midPageBanner)
        .values({
          id: crypto.randomUUID(),
          title,
          subtitle: subtitle || null,
          description: description || null,
          imageUrl,
          imagePublicId: imagePublicId || '',
          linkUrl: linkUrl || null,
          linkText: linkText || 'Shop Now',
          gradientColor: gradientColor || '#800000',
          isActive: isActive !== undefined ? isActive : true,
        })
        .returning();
    }

    revalidatePath('/');
    return NextResponse.json(updatedBanner);
  } catch (error: any) {
    console.error('Error updating mid-page banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}
