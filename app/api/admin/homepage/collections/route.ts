import { NextResponse } from 'next/server';
import { db } from '@/db';
import { collections } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all collections
export async function GET() {
  try {
    const allCollections = await db
      .select()
      .from(collections)
      .orderBy(collections.displayOrder);

    return NextResponse.json(allCollections);
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST create new collection
export async function POST(request: Request) {
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

    const [newCollection] = await db
      .insert(collections)
      .values({
        id: crypto.randomUUID(),
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
      })
      .returning();

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create collection' },
      { status: 500 }
    );
  }
}
