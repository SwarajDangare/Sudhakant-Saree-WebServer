import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, customers, addresses, orders, orderItems, products, productColors } from '@/db';
import { eq, desc } from 'drizzle-orm';

// GET - Get specific customer with full order history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['SUPER_ADMIN', 'PRODUCT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerId = params.id;

    // Get customer details
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get customer addresses
    const customerAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.customerId, customerId))
      .orderBy(desc(addresses.isDefault));

    // Get customer orders with items
    const customerOrders = await db
      .select({
        order: orders,
        address: addresses,
      })
      .from(orders)
      .leftJoin(addresses, eq(orders.addressId, addresses.id))
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      customerOrders.map(async ({ order, address }) => {
        const items = await db
          .select({
            item: orderItems,
            product: products,
            productColor: productColors,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .leftJoin(productColors, eq(orderItems.productColorId, productColors.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          address,
          items: items.map(({ item, product, productColor }) => ({
            ...item,
            product: product || null,
            productColor: productColor || null,
          })),
        };
      })
    );

    return NextResponse.json({
      customer: {
        id: customer.id,
        phoneNumber: customer.phoneNumber,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      addresses: customerAddresses,
      orders: ordersWithItems,
      totalOrders: ordersWithItems.length,
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}
