import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { featuredCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT update featured category overrides
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {
      overrideImageUrl,
      overrideImagePublicId,
      overrideTitle,
      overrideDescription,
      overrideLinkUrl,
    } = await request.json();

    const [updated] = await db
      .update(featuredCategories)
      .set({
        overrideImageUrl: overrideImageUrl || null,
        overrideImagePublicId: overrideImagePublicId || null,
        overrideTitle: overrideTitle || null,
        overrideDescription: overrideDescription || null,
        overrideLinkUrl: overrideLinkUrl || null,
      })
      .where(eq(featuredCategories.id, params.id))
      .returning();

    revalidatePath('/');
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
