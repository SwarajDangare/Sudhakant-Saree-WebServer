import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { newArrivalsSettings, featuredNewArrivals, products } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Get settings
    const [settings] = await db.select().from(newArrivalsSettings).limit(1);

    // Get featured new arrivals (if mode is manual)
    const featured = await db
      .select({
        id: featuredNewArrivals.id,
        productId: featuredNewArrivals.productId,
        displayOrder: featuredNewArrivals.displayOrder,
        product: products,
      })
      .from(featuredNewArrivals)
      .leftJoin(products, eq(featuredNewArrivals.productId, products.id))
      .orderBy(featuredNewArrivals.displayOrder);

    // Search products if requested
    if (search) {
      const searchResults = await db
        .select()
        .from(products)
        .where(or(like(products.name, `%${search}%`), like(products.description, `%${search}%`)))
        .limit(20);

      return NextResponse.json({ settings, featured, searchResults });
    }

    return NextResponse.json({ settings, featured });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { mode, count } = await request.json();

    const [existing] = await db.select().from(newArrivalsSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(newArrivalsSettings)
        .set({ mode: mode || 'automatic', count: count || 8, updatedAt: new Date() })
        .returning();
      revalidatePath('/');
      return NextResponse.json(updated);
    } else {
      const [created] = await db.insert(newArrivalsSettings).values({
        id: crypto.randomUUID(),
        mode: mode || 'automatic',
        count: count || 8,
      }).returning();
      revalidatePath('/');
      return NextResponse.json(created);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { productId, displayOrder } = await request.json();

    const [newFeatured] = await db.insert(featuredNewArrivals).values({
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
    await db.delete(featuredNewArrivals).where(eq(featuredNewArrivals.id, id));
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
