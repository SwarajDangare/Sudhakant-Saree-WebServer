import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, carts, cartItems, products, productImages, productColors } from '@/db';
import { eq, and, isNull } from 'drizzle-orm';

// GET - Fetch cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);
    const sessionId = request.headers.get('X-Session-Id');

    let cart;

    if (session?.user?.id) {
      // Get cart for logged-in customer
      [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.customerId, session.user.id))
        .limit(1);
    } else if (sessionId) {
      // Get cart for anonymous user
      [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);
    }

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        productColorId: cartItems.productColorId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    // Get product images and colors for each item
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const [image] = await db
          .select()
          .from(productImages)
          .where(and(
            eq(productImages.productId, item.productId),
            eq(productImages.isPrimary, true)
          ))
          .limit(1);

        let color = null;
        if (item.productColorId) {
          [color] = await db
            .select()
            .from(productColors)
            .where(eq(productColors.id, item.productColorId))
            .limit(1);
        }

        return {
          ...item,
          product: {
            ...item.product,
            images: image ? [{ url: image.url, altText: image.altText }] : [],
          },
          productColor: color,
        };
      })
    );

    return NextResponse.json({ items: enrichedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);
    const sessionId = request.headers.get('X-Session-Id');
    const body = await request.json();

    const { productId, productColorId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    let cart;

    // Find or create cart
    if (session?.user?.id) {
      [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.customerId, session.user.id))
        .limit(1);

      if (!cart) {
        [cart] = await db
          .insert(carts)
          .values({ customerId: session.user.id })
          .returning();
      }
    } else if (sessionId) {
      [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);

      if (!cart) {
        [cart] = await db
          .insert(carts)
          .values({ sessionId })
          .returning();
      }
    } else {
      return NextResponse.json(
        { error: 'Session ID required for anonymous users' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          productColorId
            ? eq(cartItems.productColorId, productColorId)
            : isNull(cartItems.productColorId)
        )
      )
      .limit(1);

    if (existingItem) {
      // Update quantity to the specified value (not increment)
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();

      return NextResponse.json(updatedItem);
    }

    // Add new item
    const [newItem] = await db
      .insert(cartItems)
      .values({
        cartId: cart.id,
        productId,
        productColorId: productColorId || null,
        quantity,
      })
      .returning();

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);
    const sessionId = request.headers.get('X-Session-Id');

    let cart;

    if (session?.user?.id) {
      [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.customerId, session.user.id))
        .limit(1);
    } else if (sessionId) {
      [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);
    }

    if (cart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
