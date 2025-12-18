import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, products, productColors, productImages, colorImages, productVariants } from '@/db';
import { eq, asc } from 'drizzle-orm';
import { requirePermission, getPermissionErrorMessage } from '@/lib/permission-guards';

export const dynamic = 'force-dynamic';

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

    // Fetch images and variants for each color
    const colorsWithData = await Promise.all(
      colors.map(async (color) => {
        const images = await db
          .select()
          .from(colorImages)
          .where(eq(colorImages.productColorId, color.id))
          .orderBy(asc(colorImages.displayOrder));

        const variants = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.productColorId, color.id));

        return {
          ...color,
          images: images.map(img => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText,
            displayOrder: img.displayOrder,
          })),
          variants: variants // Return variants (sizes) nested under color
        };
      })
    );

    return NextResponse.json({
      product: {
        ...product,
        colors: colorsWithData,
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
      variants, // Renamed from colors to match new structure
      hasSizes,
    } = body;

    // Validate required fields
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
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

    // Replace Variants logic: Delete existing colors (cascades to images and variants)
    await db.delete(productColors).where(eq(productColors.productId, params.id));

    // Create new colors, images, and variants
    for (const variantGroup of variants) {
      // Create color
      const [newColor] = await db
        .insert(productColors)
        .values({
          productId: params.id,
          color: variantGroup.color,
          colorCode: variantGroup.colorCode,
          inStock: variantGroup.inStock ?? true,
        })
        .returning();

      // Create images for this color
      if (variantGroup.images && variantGroup.images.length > 0) {
        await db.insert(colorImages).values(
          variantGroup.images.map((img: any, index: number) => ({
            productColorId: newColor.id,
            url: img.url,
            publicId: img.publicId,
            altText: img.altText || variantGroup.color,
            displayOrder: img.displayOrder ?? index,
          }))
        );
      }
      
      // Create product variants (Inventory/Sizes)
      if (hasSizes && variantGroup.sizes && variantGroup.sizes.length > 0) {
         // Case 1: Product has sizes
         const variantValues = variantGroup.sizes.map((s: any) => ({
             productId: updatedProduct.id,
             productColorId: newColor.id,
             size: s.size,
             stockQuantity: Number(s.quantity) || 0,
             sku: s.sku || '',
             active: true
         }));
         await db.insert(productVariants).values(variantValues);
      } else {
         // Case 2: Product has no sizes (just color) or fallback
         await db.insert(productVariants).values({
             productId: updatedProduct.id,
             productColorId: newColor.id,
             size: null, 
             stockQuantity: Number(variantGroup.quantity) || 0,
             sku: variantGroup.sku || '',
             active: true
         });
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

    // Check if user has permission to delete products
    const permissionError = requirePermission(
      session,
      'canDeleteProducts',
      getPermissionErrorMessage('canDeleteProducts')
    );
    if (permissionError) {
      return permissionError;
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
