import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, customers, orders } from '@/db';
import { eq, count, sql } from 'drizzle-orm';
import { getServerPermissions } from '@/lib/server-permissions';
import CustomersClient from '@/components/admin/CustomersClient';

// Make this page dynamic
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Get user permissions
  const permissions = await getServerPermissions();

  // Check if user has access to customers page
  if (!permissions.canAccessCustomersPage) {
    redirect('/admin/dashboard');
  }

  // Fetch customers with order count
  const allCustomers = await db
    .select({
      id: customers.id,
      phoneNumber: customers.phoneNumber,
      name: customers.name,
      email: customers.email,
      createdAt: customers.createdAt,
    })
    .from(customers)
    .orderBy(customers.createdAt);

  // Get order counts for each customer
  const customerIds = allCustomers.map(c => c.id);
  const orderCounts = customerIds.length > 0
    ? await db
        .select({
          customerId: orders.customerId,
          count: count(),
        })
        .from(orders)
        .where(sql`${orders.customerId} IN ${customerIds}`)
        .groupBy(orders.customerId)
    : [];

  // Merge order counts with customers
  const customersWithOrders = allCustomers.map(customer => ({
    ...customer,
    orderCount: orderCounts.find(oc => oc.customerId === customer.id)?.count || 0,
  }));

  return (
    <CustomersClient
      customers={customersWithOrders}
      permissions={{
        canViewDetails: permissions.canViewCustomerDetails,
        canEdit: permissions.canEditCustomers,
        canDelete: permissions.canDeleteCustomers,
      }}
    />
  );
}
