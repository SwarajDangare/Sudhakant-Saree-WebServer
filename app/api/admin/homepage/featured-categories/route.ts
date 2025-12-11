import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { featuredCategories, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const featured = await db
      .select({
        id: featuredCategories.id,
        categoryId: featuredCategories.categoryId,
        displayOrder: featuredCategories.displayOrder,
        isActive: featuredCategories.isActive,
        overrideImageUrl: featuredCategories.overrideImageUrl,
        overrideImagePublicId: featuredCategories.overrideImagePublicId,
        overrideTitle: featuredCategories.overrideTitle,
        overrideDescription: featuredCategories.overrideDescription,
        overrideLinkUrl: featuredCategories.overrideLinkUrl,
        category: categories,
      })
      .from(featuredCategories)
      .leftJoin(categories, eq(featuredCategories.categoryId, categories.id))
      .orderBy(featuredCategories.displayOrder);

    const allCategories = await db.select().from(categories).where(eq(categories.active, true));

    return NextResponse.json({ featured, allCategories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      categoryId,
      displayOrder,
      overrideImageUrl,
      overrideImagePublicId,
      overrideTitle,
      overrideDescription,
      overrideLinkUrl,
    } = await request.json();

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 });
    }

    const [newFeatured] = await db.insert(featuredCategories).values({
      id: crypto.randomUUID(),
      categoryId,
      displayOrder: displayOrder || 0,
      isActive: true,
      overrideImageUrl: overrideImageUrl || null,
      overrideImagePublicId: overrideImagePublicId || null,
      overrideTitle: overrideTitle || null,
      overrideDescription: overrideDescription || null,
      overrideLinkUrl: overrideLinkUrl || null,
    }).returning();

    revalidatePath('/');
    return NextResponse.json(newFeatured, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await db.delete(featuredCategories).where(eq(featuredCategories.id, id));
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
