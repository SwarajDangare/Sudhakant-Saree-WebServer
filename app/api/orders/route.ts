import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, orders, orderItems, carts, cartItems, products, productColors, addresses } from '@/db';
import { eq, desc } from 'drizzle-orm';

// GET - Fetch all orders for customer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, session.user.id))
      .orderBy(desc(orders.createdAt));

    // Get order items and addresses for each order
    const enrichedOrders = await Promise.all(
      customerOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        const [address] = await db
          .select()
          .from(addresses)
          .where(eq(addresses.id, order.addressId))
          .limit(1);

        return {
          ...order,
          items,
          address,
        };
      })
    );

    return NextResponse.json(enrichedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { addressId, paymentMethod, notes } = body;

    if (!addressId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Address and payment method are required' },
        { status: 400 }
      );
    }

    // Verify address belongs to customer
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, addressId))
      .limit(1);

    if (!address || address.customerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Get customer's cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.customerId, session.user.id))
      .limit(1);

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Get cart items with product details
    const items = await db
      .select({
        cartItem: cartItems,
        product: products,
        color: productColors,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(productColors, eq(cartItems.productColorId, productColors.id))
      .where(eq(cartItems.cartId, cart.id));

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = items.map((item) => {
      const price = parseFloat(item.product.price);
      const itemSubtotal = price * item.cartItem.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.product.id,
        productColorId: item.color?.id || null,
        productName: item.product.name,
        productColor: item.color?.color || null,
        price: item.product.price,
        quantity: item.cartItem.quantity,
        subtotal: itemSubtotal.toFixed(2),
      };
    });

    const total = subtotal; // Can add discount logic here

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId: session.user.id,
        addressId,
        paymentMethod,
        subtotal: subtotal.toFixed(2),
        discount: '0',
        total: total.toFixed(2),
        notes: notes || null,
      })
      .returning();

    // Create order items
    await db.insert(orderItems).values(
      orderItemsData.map((item) => ({
        orderId: newOrder.id,
        ...item,
      }))
    );

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    // Fetch complete order with items and address
    const completeOrder = {
      ...newOrder,
      items: orderItemsData,
      address,
    };

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
