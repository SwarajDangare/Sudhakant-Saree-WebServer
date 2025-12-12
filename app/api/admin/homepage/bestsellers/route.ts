import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { featuredBestsellers, products } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get featured bestsellers
    const featured = await db
      .select({
        id: featuredBestsellers.id,
        productId: featuredBestsellers.productId,
        displayOrder: featuredBestsellers.displayOrder,
        isActive: featuredBestsellers.isActive,
        overrideImageUrl: featuredBestsellers.overrideImageUrl,
        overrideImagePublicId: featuredBestsellers.overrideImagePublicId,
        overrideTitle: featuredBestsellers.overrideTitle,
        overrideDescription: featuredBestsellers.overrideDescription,
        overrideLinkUrl: featuredBestsellers.overrideLinkUrl,
        product: products,
      })
      .from(featuredBestsellers)
      .leftJoin(products, eq(featuredBestsellers.productId, products.id))
      .orderBy(featuredBestsellers.displayOrder);

    // Search products if search param provided
    if (search) {
      const searchResults = await db
        .select()
        .from(products)
        .where(
          or(
            like(products.name, `%${search}%`),
            like(products.description, `%${search}%`)
          )
        )
        .limit(20);

      return NextResponse.json({ featured, searchResults });
    }

    return NextResponse.json({ featured });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { productId, displayOrder } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const [newFeatured] = await db.insert(featuredBestsellers).values({
      id: crypto.randomUUID(),
      productId,
      displayOrder: displayOrder || 0,
      isActive: true,
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
    await db.delete(featuredBestsellers).where(eq(featuredBestsellers.id, id));
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
