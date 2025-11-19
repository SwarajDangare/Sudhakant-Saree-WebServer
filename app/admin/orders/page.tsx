import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, orders, customers, addresses, orderItems } from '@/db';
import { eq, inArray, notInArray } from 'drizzle-orm';
import { getPermissions } from '@/lib/permissions';
import OrdersManagementClient from '@/components/admin/OrdersManagementClient';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const userRole = session.user.role;
  const permissions = getPermissions(userRole);

  // Determine which orders to fetch based on role
  let ordersQuery;

  if (permissions.canViewAllOrders) {
    // SUPER_ADMIN and SHOP_MANAGER can see all orders
    ordersQuery = db
      .select()
      .from(orders)
      .orderBy(orders.createdAt);
  } else if (permissions.canViewActiveOrders) {
    // SALESMAN can only see active orders (not DELIVERED or CANCELLED)
    ordersQuery = db
      .select()
      .from(orders)
      .where(notInArray(orders.status, ['DELIVERED', 'CANCELLED']))
      .orderBy(orders.createdAt);
  } else {
    // No permission to view orders
    redirect('/admin/dashboard');
  }

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

    const customerIds = [...new Set(allOrders.map(order => order.customerId))];
    const addressIds = [...new Set(allOrders.map(order => order.addressId))];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {permissions.canViewAllOrders ? 'Order Management' : 'Active Orders'}
          </h1>
          <p className="text-gray-600 mt-2">
            {permissions.canViewAllOrders
              ? 'View and manage all customer orders'
              : 'View active orders'}
          </p>
        </div>
      </div>

      {/* Info Box for Salesmen */}
      {!permissions.canViewAllOrders && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As a salesman, you can only view orders that are currently active
            (pending, confirmed, processing, or shipped). Completed and cancelled orders are hidden.
          </p>
        </div>
      )}

      {/* Orders Management Client Component */}
      <OrdersManagementClient
        initialOrders={ordersWithDetails}
        permissions={permissions}
      />
    </div>
  );
}
