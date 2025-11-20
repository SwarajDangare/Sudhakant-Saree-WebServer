import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, products, productColors, colorImages } from '@/db';

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

    // Create colors and images
    for (const color of colors) {
      // Create color
      const [newColor] = await db
        .insert(productColors)
        .values({
          productId: newProduct.id,
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
