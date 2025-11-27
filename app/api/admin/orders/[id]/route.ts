import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, orders, customers } from '@/db';
import { eq } from 'drizzle-orm';
import { getPermissions } from '@/lib/permissions';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

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

    if (!session || !session.user.role) {
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

    // Send status update email (don't block response if email fails)
    try {
      // Get customer details
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, updatedOrder.customerId))
        .limit(1);

      if (customer && customer.email) {
        // Send status update email
        await sendOrderStatusUpdateEmail({
          orderNumber: updatedOrder.orderNumber,
          customerName: customer.name || 'Valued Customer',
          customerEmail: customer.email,
          status: status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
        });
      }
    } catch (emailError) {
      // Log but don't fail the status update
      console.error('Failed to send order status update email:', emailError);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
