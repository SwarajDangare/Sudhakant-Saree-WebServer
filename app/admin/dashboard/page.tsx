import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, products, categories, sections, users, customers, orders, productColors, colorImages } from '@/db';
import { eq, count, sql, desc, and, lt } from 'drizzle-orm';
import StatCard from '@/components/admin/dashboard/StatCard';
import RevenueChart from '@/components/admin/dashboard/RevenueChart';
import StockLevelWidget from '@/components/admin/dashboard/StockLevelWidget';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import { subDays, format } from 'date-fns';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const userRole = session.user.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isShopManager = userRole === 'SHOP_MANAGER';

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

  // Get orders from last 30 days for chart
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentOrders = await db
    .select({
      createdAt: orders.createdAt,
      total: orders.total,
    })
    .from(orders)
    .orderBy(orders.createdAt);

  // Group orders by date for chart
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

  // Get low stock items (products with color variants having low stock)
  // For now, we'll create mock data since we don't have stock tracking in the schema yet
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

  // Get first image for each color variant
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
        stock: Math.floor(Math.random() * 10), // Mock stock data
        imageUrl: image?.url || null,
      };
    })
  );

  // Filter to only show items with stock < 10
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

  // Calculate last month comparison
  const lastMonthOrders = recentOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= subDays(new Date(), 60) && orderDate < subDays(new Date(), 30);
  });
  const thisMonthOrders = recentOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= subDays(new Date(), 30);
  });

  const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const revenueChange = lastMonthRevenue > 0
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : '0';

  const orderChange = lastMonthOrders.length > 0
    ? (((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Top Stats Cards - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={<span>💰</span>}
          trend={{
            value: `${revenueChange}%`,
            isPositive: Number(revenueChange) >= 0,
          }}
          gradient="gradient-bg-green"
        />
        <StatCard
          label="Orders"
          value={ordersCount.count}
          icon={<span>📦</span>}
          trend={{
            value: `${orderChange}%`,
            isPositive: Number(orderChange) >= 0,
          }}
          gradient="gradient-bg-blue"
        />
        <StatCard
          label="Low Stock Items"
          value={criticalStockItems.length}
          icon={<span>⚠️</span>}
          gradient="gradient-bg-orange"
        />
        <StatCard
          label="Total Customers"
          value={customersCount.count}
          icon={<span>👥</span>}
          gradient="gradient-bg-red"
        />
      </div>

      {/* Main Content Grid - 66% / 33% split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <RevenueChart data={chartData} />

          {/* Stock Level Widget */}
          <StockLevelWidget lowStockItems={criticalStockItems} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
