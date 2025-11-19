import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, orders } from '@/db';
import { eq } from 'drizzle-orm';
import { getPermissions } from '@/lib/permissions';

/**
 * PUT /api/admin/orders/[id]
 * Update order status (SHOP_MANAGER and SUPER_ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permissions = getPermissions(session.user.role);

    if (!permissions.canUpdateOrderStatus) {
      return NextResponse.json(
        { error: 'You do not have permission to update order status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Check if order exists
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, params.id))
      .limit(1);

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, params.id))
      .returning();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
