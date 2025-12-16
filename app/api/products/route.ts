import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, products, productColors, colorImages, productVariants } from '@/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
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
      variants, // New structure
      hasSizes, // Boolean flag
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

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
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
      })
      .returning();

    // Create variant groups (Colors)
    for (const variantGroup of variants) {
      
      // Create color entry
      const [newColor] = await db
        .insert(productColors)
        .values({
          productId: newProduct.id,
          color: variantGroup.color,
          colorCode: variantGroup.colorCode,
          inStock: variantGroup.inStock ?? true, // General availability flag
        })
        .returning();

      // Create images for this color
      if (variantGroup.images && variantGroup.images.length > 0) {
        const imageValues = variantGroup.images.map((img: any, index: number) => ({
          productColorId: newColor.id,
          url: img.url,
          publicId: img.publicId,
          altText: img.altText || variantGroup.color,
          displayOrder: img.displayOrder ?? index,
        }));

        await db.insert(colorImages).values(imageValues);
      }

      // Create product variants (Inventory/Sizes)
      if (hasSizes && variantGroup.sizes && variantGroup.sizes.length > 0) {
         // Case 1: Product has sizes
         const variantValues = variantGroup.sizes.map((s: any) => ({
             productId: newProduct.id,
             productColorId: newColor.id,
             size: s.size,
             stockQuantity: Number(s.quantity) || 0,
             sku: s.sku || '',
             active: true
         }));
         await db.insert(productVariants).values(variantValues);
      } else {
         // Case 2: Product has no sizes (just color) or fallback
         // Treat as a single variant with null size
         await db.insert(productVariants).values({
             productId: newProduct.id,
             productColorId: newColor.id,
             size: null, 
             stockQuantity: Number(variantGroup.quantity) || 0,
             sku: variantGroup.sku || '',
             active: true
         });
      }
    }

    return NextResponse.json(
      { message: 'Product created successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all products
    const allProducts = await db.select().from(products);

    return NextResponse.json({ products: allProducts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
