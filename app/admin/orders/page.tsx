import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, orders, customers, addresses, orderItems } from '@/db';
import { eq, inArray, notInArray } from 'drizzle-orm';
import { getServerPermissions } from '@/lib/server-permissions';
import OrdersManagementClean from '@/components/admin/OrdersManagementClean';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.role) {
    redirect('/admin/login');
  }

  // Get user permissions
  const permissions = await getServerPermissions();

  // Check if user has access to orders page
  if (!permissions.canAccessOrdersPage) {
    redirect('/admin/dashboard');
  }

  // Fetch all orders (access is already verified)
  const ordersQuery = db
    .select()
    .from(orders)
    .orderBy(orders.createdAt);

  const allOrders = await ordersQuery;

  // Fetch related data
  const orderIds = allOrders.map(order => order.id);

  let orderItemsList: any[] = [];
  let customersList: any[] = [];
  let addressesList: any[] = [];

  if (orderIds.length > 0) {
    orderItemsList = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const customerIds = Array.from(new Set(allOrders.map(order => order.customerId)));
    const addressIds = Array.from(new Set(allOrders.map(order => order.addressId)));

    customersList = await db
      .select()
      .from(customers)
      .where(inArray(customers.id, customerIds));

    addressesList = await db
      .select()
      .from(addresses)
      .where(inArray(addresses.id, addressIds));
  }

  // Structure the data
  const ordersWithDetails = allOrders.map(order => {
    const orderItemsForOrder = orderItemsList.filter(item => item.orderId === order.id);
    const customer = customersList.find(c => c.id === order.customerId);
    const address = addressesList.find(a => a.id === order.addressId);

    return {
      ...order,
      items: orderItemsForOrder,
      customer,
      address,
    };
  });

  return (
    <OrdersManagementClean
      initialOrders={ordersWithDetails}
      permissions={{
        canViewDetails: permissions.canViewOrderDetails,
        canUpdateStatus: permissions.canUpdateOrderStatus,
        canDelete: permissions.canDeleteOrders,
      }}
    />
  );
}
