'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  permission: string | null;
  external?: boolean;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { permissions, isLoading: permissionsLoading } = usePermissions();

  const userRole = session?.user?.role;
  const isLoading = status === 'loading' || permissionsLoading;

  // Hide sidebar on login page
  const isLoginPage = pathname === '/admin/login';

  // Get page title and description based on current route
  const getPageInfo = () => {
    const path = pathname || '';

    if (path === '/admin/dashboard') return { title: 'Dashboard', description: 'Overview of your store performance' };
    if (path === '/admin/products') return { title: 'Products', description: 'Manage your saree catalog' };
    if (path.startsWith('/admin/products/new')) return { title: 'Add New Product', description: 'Create a new product for your store' };
    if (path.match(/\/admin\/products\/[^/]+\/edit/)) return { title: 'Edit Product', description: 'Update product details' };
    if (path === '/admin/orders') return { title: 'Orders', description: 'Manage customer orders' };
    if (path === '/admin/categories') return { title: 'Categories', description: 'Manage your product categories and sections' };
    if (path.startsWith('/admin/categories/new')) return { title: 'Add Category', description: 'Create a new category' };
    if (path.match(/\/admin\/categories\/[^/]+\/edit/)) return { title: 'Edit Category', description: 'Update category details' };
    if (path === '/admin/sections') return { title: 'Sections', description: 'Manage product sections' };
    if (path.startsWith('/admin/sections/new')) return { title: 'Add Section', description: 'Create a new section' };
    if (path.match(/\/admin\/sections\/[^/]+\/edit/)) return { title: 'Edit Section', description: 'Update section details' };
    if (path === '/admin/customers') return { title: 'Customers', description: 'Manage your customers' };
    if (path.match(/\/admin\/customers\/[^/]+/)) return { title: 'Customer Details', description: 'View customer information and orders' };
    if (path === '/admin/users') return { title: 'Team & Permission Management', description: 'Manage admin users and configure role permissions' };
    if (path === '/admin/settings') return { title: 'Settings', description: 'Configure your store settings' };

    return { title: 'Dashboard', description: 'Overview of your store performance' };
  };

  const pageInfo = getPageInfo();

  const navigation = [
    {
      section: 'DISCOVER',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', permission: 'canAccessDashboard' },
        { name: 'Stores', href: '/', icon: '🏪', permission: 'canAccessDashboard', external: true },
      ]
    },
    {
      section: 'INVENTORY',
      items: [
        { name: 'Products', href: '/admin/products', icon: '📦', permission: 'canAccessProductsPage' },
        { name: 'Orders', href: '/admin/orders', icon: '📋', permission: 'canAccessOrdersPage' },
        { name: 'Category', href: '/admin/categories', icon: '📁', permission: 'canAccessCategoriesPage' },
        { name: 'Sections', href: '/admin/sections', icon: '🚚', permission: 'canAccessSectionsPage' },
        { name: 'Customers', href: '/admin/customers', icon: '📊', permission: 'canAccessCustomersPage' },
        { name: 'Billing', href: '#', icon: '💳', permission: null },
        { name: 'Delivery', href: '#', icon: '🚛', permission: null },
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { name: 'Settings', href: '/admin/settings', icon: '⚙️', permission: null },
        { name: 'Team & Permissions', href: '/admin/users', icon: '👥', permission: 'canAccessTeamPage' },
      ]
    }
  ];

  // If on login page, just return children without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - ThreadCraft Style with Purple Gradient */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
        }}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🪡</span>
            </div>
            <h1 className="text-white font-bold text-lg">
              Sudhakant Sarees
            </h1>
          </div>

          {/* Navigation - Sections */}
          <nav className="flex-1 px-4 overflow-y-auto">
            {navigation.map((section, idx) => {
              // Show all items during loading, filter by permissions when available
              const filteredItems = isLoading || !permissions
                ? section.items
                : section.items.filter((item) => {
                    // If no permission requirement (null), check if super admin
                    if (item.permission === null) {
                      return userRole === 'SUPER_ADMIN';
                    }
                    // Check if user has the required permission
                    return permissions[item.permission as keyof typeof permissions] === true;
                  });

              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="mb-6">
                  <h3 className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {filteredItems.map((item: NavigationItem) => {
                      const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '#');
                      const isExternal = item.external === true;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-white text-indigo-600'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.name}</span>
                          {isExternal && (
                            <span className="ml-auto text-xs">↗</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User Section at Bottom */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title - Dynamic */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{pageInfo.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{pageInfo.description}</p>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search item, order, etc"
                  className="pl-8 pr-3 py-1.5 w-48 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar with Dropdown */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-semibold text-gray-900">{session?.user?.name || 'Admin'}</span>
                  <span className="text-[10px] text-gray-500">
                    {session?.user?.role?.replace('_', ' ') || 'Super Admin'}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-5 bg-gray-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}
