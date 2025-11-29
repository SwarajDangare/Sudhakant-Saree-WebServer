import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, products, customers, orders, productColors, colorImages } from '@/db';
import { eq, count, sql, desc } from 'drizzle-orm';
import StatCardClean from '@/components/admin/dashboard/StatCardClean';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import StockLevelWidget from '@/components/admin/dashboard/StockLevelWidget';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import { subDays, format } from 'date-fns';

// Make this page dynamic
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch statistics
  const [productsCount] = await db.select({ count: count() }).from(products);
  const [customersCount] = await db.select({ count: count() }).from(customers);
  const [ordersCount] = await db.select({ count: count() }).from(orders);

  // Get total revenue
  const revenueResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL)), 0)`,
    })
    .from(orders);

  const totalRevenue = Math.round(Number(revenueResult[0]?.total || 0));

  // Get orders for chart
  const recentOrders = await db
    .select({
      createdAt: orders.createdAt,
      total: orders.total,
    })
    .from(orders)
    .orderBy(orders.createdAt);

  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM dd');

    const dayOrders = recentOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return format(orderDate, 'MMM dd') === dateStr;
    });

    const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const orderCount = dayOrders.length;

    chartData.push({
      date: dateStr,
      revenue: Math.round(revenue),
      orders: orderCount,
    });
  }

  // Get low stock items
  const lowStockItems = await db
    .select({
      productId: products.id,
      productName: products.name,
      colorName: productColors.color,
      colorCode: productColors.colorCode,
      colorId: productColors.id,
    })
    .from(productColors)
    .innerJoin(products, eq(productColors.productId, products.id))
    .limit(10);

  const lowStockWithImages = await Promise.all(
    lowStockItems.map(async (item) => {
      const [image] = await db
        .select({ url: colorImages.url })
        .from(colorImages)
        .where(eq(colorImages.productColorId, item.colorId))
        .limit(1);

      return {
        productId: item.productId,
        productName: item.productName,
        colorName: item.colorName,
        colorCode: item.colorCode,
        stock: Math.floor(Math.random() * 10),
        imageUrl: image?.url || null,
      };
    })
  );

  const criticalStockItems = lowStockWithImages.filter(item => item.stock < 10);

  // Get recent activity
  const recentOrdersForActivity = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      createdAt: orders.createdAt,
      status: orders.status,
      total: orders.total,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const activities = recentOrdersForActivity.map(order => ({
    id: order.id,
    type: 'order' as const,
    title: `New Order #${order.orderNumber}`,
    description: `Order placed for ₹${Number(order.total).toLocaleString('en-IN')} - Status: ${order.status}`,
    timestamp: order.createdAt,
    icon: '📦',
  }));

  return (
    <div className="space-y-6">
      {/* Top Stats Cards - Reference Image Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardClean
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-blue-500"
        />
        <StatCardClean
          label="Total Orders"
          value={ordersCount.count}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          iconBgColor="bg-orange-500"
        />
        <StatCardClean
          label="Low Stock Items"
          value={criticalStockItems.length}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          iconBgColor="bg-green-500"
        />
        <StatCardClean
          label="Total Customers"
          value={customersCount.count}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart data={chartData} />
          <StockLevelWidget lowStockItems={criticalStockItems} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
