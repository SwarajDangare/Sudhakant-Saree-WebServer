import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, products, productColors, productImages, colorImages } from '@/db';
import { eq } from 'drizzle-orm';

// GET a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, params.id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch colors for this product
    const colors = await db
      .select()
      .from(productColors)
      .where(eq(productColors.productId, params.id));

    return NextResponse.json({
      product: {
        ...product,
        colors,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// UPDATE a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      discountType,
      discountValue,
      categoryId,
      material,
      length,
      occasion,
      careInstructions,
      active,
      featured,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set({
        name,
        description,
        price: String(price),
        discountType: discountType || 'NONE',
        discountValue: String(discountValue || 0),
        categoryId,
        material: material || null,
        length: length || null,
        occasion: occasion || null,
        careInstructions: careInstructions || null,
        active: active ?? true,
        featured: featured ?? false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, params.id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, params.id))
      .limit(1);

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete related color images first
    const colors = await db
      .select()
      .from(productColors)
      .where(eq(productColors.productId, params.id));

    for (const color of colors) {
      await db.delete(colorImages).where(eq(colorImages.productColorId, color.id));
    }

    // Delete product colors
    await db.delete(productColors).where(eq(productColors.productId, params.id));

    // Delete product images
    await db.delete(productImages).where(eq(productImages.productId, params.id));

    // Finally, delete the product
    await db.delete(products).where(eq(products.id, params.id));

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
