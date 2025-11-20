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

    // Fetch images for each color
    const colorsWithImages = await Promise.all(
      colors.map(async (color) => {
        const images = await db
          .select()
          .from(colorImages)
          .where(eq(colorImages.productColorId, color.id))
          .orderBy(colorImages.displayOrder);

        return {
          ...color,
          images: images.map(img => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText,
            displayOrder: img.displayOrder,
          })),
        };
      })
    );

    return NextResponse.json({
      product: {
        ...product,
        colors: colorsWithImages,
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
      colors,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate colors
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json(
        { error: 'At least one color variant is required' },
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
        material: material || '',
        length: length || '',
        occasion: occasion || '',
        careInstructions: careInstructions || '',
        active: active ?? true,
        featured: featured ?? false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, params.id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete existing colors and their images
    const existingColors = await db
      .select()
      .from(productColors)
      .where(eq(productColors.productId, params.id));

    for (const color of existingColors) {
      await db.delete(colorImages).where(eq(colorImages.productColorId, color.id));
    }
    await db.delete(productColors).where(eq(productColors.productId, params.id));

    // Create new colors and images
    for (const color of colors) {
      // Create color
      const [newColor] = await db
        .insert(productColors)
        .values({
          productId: params.id,
          color: color.color,
          colorCode: color.colorCode,
          inStock: color.inStock ?? true,
        })
        .returning();

      // Create images for this color
      if (color.images && color.images.length > 0) {
        await db.insert(colorImages).values(
          color.images.map((img: any, index: number) => ({
            productColorId: newColor.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || color.color,
            displayOrder: img.displayOrder ?? index,
          }))
        );
      }
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
