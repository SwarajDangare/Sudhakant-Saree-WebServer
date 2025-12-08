import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, orders, customers, orderItems, addresses } from '@/db';
import { eq } from 'drizzle-orm';
import { getPermissions } from '@/lib/permissions';
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from '@/lib/email';
import { generateOrderUpdateWhatsAppLink } from '@/lib/whatsapp';
import { getServerPermissions } from '@/lib/server-permissions';

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

    // Send email based on status (don't block response if email fails)
    let whatsappLink = '';

    try {
      // Get customer details
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, updatedOrder.customerId))
        .limit(1);

      if (customer) {
        // Get order items for WhatsApp message
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, updatedOrder.id));

        // Generate WhatsApp link for order update
        whatsappLink = generateOrderUpdateWhatsAppLink(
          customer.phoneNumber,
          {
            orderNumber: updatedOrder.orderNumber,
            customerName: customer.name || 'Valued Customer',
            status: status,
            total: updatedOrder.total.toString(),
            items: items.map((item) => ({
              productName: item.productName,
              quantity: item.quantity,
              price: item.price.toString(),
            })),
          }
        );

          // Send email if customer has email
          if (customer.email) {
            // For CONFIRMED status, send detailed order confirmation email
            if (status === 'CONFIRMED') {
          // Get delivery address
          const [address] = await db
            .select()
            .from(addresses)
            .where(eq(addresses.id, updatedOrder.addressId))
            .limit(1);

            if (address) {
              // Send comprehensive order confirmation email
              await sendOrderConfirmationEmail({
                orderNumber: updatedOrder.orderNumber,
                customerName: customer.name || address.name || 'Valued Customer',
                customerEmail: customer.email,
                items: items.map((item) => ({
                  productName: item.productName,
                  productColor: item.productColor,
                  quantity: item.quantity,
                  price: item.price,
                  subtotal: item.subtotal,
                })),
                subtotal: updatedOrder.subtotal,
                total: updatedOrder.total,
                address: {
                  name: address.name,
                  phoneNumber: address.phoneNumber,
                  addressLine1: address.addressLine1,
                  addressLine2: address.addressLine2,
                  city: address.city,
                  state: address.state,
                  pincode: address.pincode,
                },
                paymentMethod: updatedOrder.paymentMethod,
                orderDate: updatedOrder.createdAt.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              });
            }
          } else {
            // For other status updates, send status update email
            await sendOrderStatusUpdateEmail({
              orderNumber: updatedOrder.orderNumber,
              customerName: customer.name || 'Valued Customer',
              customerEmail: customer.email,
              status: status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
            });
          }
        }
      }
    } catch (emailError) {
      // Log but don't fail the status update
      console.error('Failed to send order email:', emailError);
    }

    // Return updated order with WhatsApp link
    return NextResponse.json({
      ...updatedOrder,
      whatsappLink,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Delete an order (SUPER_ADMIN and SHOP_MANAGER with permission)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete orders
    const permissions = await getServerPermissions();
    if (!permissions.canDeleteOrders) {
      return NextResponse.json(
        { error: 'You do not have permission to delete orders' },
        { status: 403 }
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

    // Delete order items first (foreign key constraint)
    await db.delete(orderItems).where(eq(orderItems.orderId, params.id));

    // Delete the order
    await db.delete(orders).where(eq(orders.id, params.id));

    return NextResponse.json({
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
