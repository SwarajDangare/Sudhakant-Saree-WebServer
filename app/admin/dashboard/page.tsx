import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, products, categories, sections, users, customers, orders } from '@/db';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch statistics
  const [productsCount] = await db.select({ count: count() }).from(products);
  const [categoriesCount] = await db.select({ count: count() }).from(categories);
  const [sectionsCount] = await db.select({ count: count() }).from(sections);
  const [usersCount] = await db.select({ count: count() }).from(users);
  const [customersCount] = await db.select({ count: count() }).from(customers);
  const [ordersCount] = await db.select({ count: count() }).from(orders);

  const [activeProducts] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.active, true));

  const [featuredProducts] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.featured, true));

  const stats = [
    { label: 'Total Products', value: productsCount.count, icon: '🛍️', color: 'bg-blue-500' },
    { label: 'Total Customers', value: customersCount.count, icon: '👥', color: 'bg-green-500' },
    { label: 'Total Orders', value: ordersCount.count, icon: '📦', color: 'bg-purple-500' },
    { label: 'Categories', value: categoriesCount.count, icon: '📁', color: 'bg-yellow-500' },
  ];

  const userRole = session.user.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isShopManager = userRole === 'SHOP_MANAGER';
  const isSalesman = userRole === 'SALESMAN';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/products/new"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="font-semibold text-gray-900 text-lg">Add New Product</h3>
            <p className="text-gray-600 text-sm mt-1">Create a new product listing</p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
          >
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-900 text-lg">Manage Products</h3>
            <p className="text-gray-600 text-sm mt-1">View and edit existing products</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
          >
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {isSalesman ? 'View Orders' : 'Manage Orders'}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              {isSalesman ? 'View active orders and details' : 'View and manage customer orders'}
            </p>
          </Link>

          {(isSuperAdmin || isShopManager) && (
            <Link
              href="/admin/customers"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
            >
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 text-lg">View Customers</h3>
              <p className="text-gray-600 text-sm mt-1">See customer details and order history</p>
            </Link>
          )}

          {(isSuperAdmin || isShopManager) && (
            <Link
              href="/admin/categories"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
            >
              <div className="text-4xl mb-3">📁</div>
              <h3 className="font-semibold text-gray-900 text-lg">Manage Categories</h3>
              <p className="text-gray-600 text-sm mt-1">
                {isSuperAdmin ? 'Organize your product categories and sections' : 'Add categories to existing sections'}
              </p>
            </Link>
          )}

          {isSuperAdmin && (
            <Link
              href="/admin/users"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
            >
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="font-semibold text-gray-900 text-lg">Manage Admin Users</h3>
              <p className="text-gray-600 text-sm mt-1">Add or remove admin users</p>
            </Link>
          )}

          <Link
            href="/"
            target="_blank"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-transparent hover:border-maroon"
          >
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="font-semibold text-gray-900 text-lg">View Website</h3>
            <p className="text-gray-600 text-sm mt-1">See your live storefront</p>
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Sections:</span>
            <span className="ml-2 font-semibold text-gray-900">{sectionsCount.count}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Categories:</span>
            <span className="ml-2 font-semibold text-gray-900">{categoriesCount.count}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Products:</span>
            <span className="ml-2 font-semibold text-gray-900">{productsCount.count}</span>
          </div>
          {isSuperAdmin && (
            <div>
              <span className="text-gray-600">Total Admin Users:</span>
              <span className="ml-2 font-semibold text-gray-900">{usersCount.count}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
