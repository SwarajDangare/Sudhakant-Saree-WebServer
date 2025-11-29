'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = session?.user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isShopManager = userRole === 'SHOP_MANAGER';
  const isSalesman = userRole === 'SALESMAN';

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
    { name: 'Products', href: '/admin/products', icon: '🛍️', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
    { name: 'Orders', href: '/admin/orders', icon: '📦', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
    { name: 'Sections', href: '/admin/sections', icon: '📂', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Categories', href: '/admin/categories', icon: '📁', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Customers', href: '/admin/customers', icon: '👥', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Team', href: '/admin/users', icon: '👤', allowedRoles: ['SUPER_ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(
    (item) => userRole && item.allowedRoles.includes(userRole)
  );

  const getPageTitle = () => {
    if (pathname === '/admin/dashboard') return 'Dashboard';
    if (pathname?.startsWith('/admin/products')) return 'Products';
    if (pathname?.startsWith('/admin/orders')) return 'Orders';
    if (pathname?.startsWith('/admin/sections')) return 'Sections';
    if (pathname?.startsWith('/admin/categories')) return 'Categories';
    if (pathname?.startsWith('/admin/customers')) return 'Customers';
    if (pathname?.startsWith('/admin/users')) return 'Team & Permissions';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Modern Gradient with Soft UI */}
      <aside
        className={`fixed top-0 left-0 z-50 w-72 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 shadow-2xl`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                🪡
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Sudhakant Sarees
                </h1>
                <p className="text-blue-100 text-xs font-medium">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-nav-item ${isActive ? 'active' : ''} ${
                    isActive ? 'text-white' : 'text-blue-100 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-blue-100 text-xs truncate">{session?.user?.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-block px-2.5 py-1 text-xs rounded-lg bg-yellow-400 text-yellow-900 font-semibold">
                  {session?.user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm font-medium backdrop-blur-sm"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar - Clean & Minimal */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h2 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h2>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* View Site */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>🌐</span>
                <span>View Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content with max-width for better readability */}
        <main className="p-6 lg:p-8 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
