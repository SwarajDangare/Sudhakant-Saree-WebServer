import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, customers, orders } from '@/db';
import { eq, sql, desc } from 'drizzle-orm';
import { getPermissions } from '@/lib/permissions';

// GET - Get all customers with order statistics
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = getPermissions(session.user.role);
    if (!permissions.canViewCustomers) {
      return NextResponse.json(
        { error: 'You do not have permission to view customers' },
        { status: 403 }
      );
    }

    // Get all customers with order count
    const allCustomers = await db
      .select({
        id: customers.id,
        phoneNumber: customers.phoneNumber,
        name: customers.name,
        email: customers.email,
        createdAt: customers.createdAt,
        orderCount: sql<number>`cast(count(${orders.id}) as int)`,
      })
      .from(customers)
      .leftJoin(orders, eq(customers.id, orders.customerId))
      .groupBy(customers.id)
      .orderBy(desc(customers.createdAt));

    return NextResponse.json({
      customers: allCustomers,
      total: allCustomers.length,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
