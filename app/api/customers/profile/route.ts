import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, customers, orders, addresses, carts } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Get customer profile
export async function GET() {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, session.user.id))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: customer.id,
      phoneNumber: customer.phoneNumber,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update customer profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Update customer
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        name: name.trim(),
        email: email?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, session.user.id))
      .returning();

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedCustomer.id,
      phoneNumber: updatedCustomer.phoneNumber,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer account
export async function DELETE() {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if customer exists
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, session.user.id))
      .limit(1);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has any orders
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, session.user.id))
      .limit(1);

    if (customerOrders.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete account with order history',
          message: 'Your account has existing orders and cannot be deleted. For privacy, you can remove your email and personal information from your profile instead.',
          hasOrders: true,
        },
        { status: 400 }
      );
    }

    // Delete customer (addresses and carts will cascade delete automatically)
    await db
      .delete(customers)
      .where(eq(customers.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
