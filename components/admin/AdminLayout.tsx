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

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
    { name: 'Products', href: '/admin/products', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
    { name: 'Orders', href: '/admin/orders', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
    { name: 'Books', href: '/admin/sections', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Payments', href: '/admin/categories', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Analytics', href: '/admin/customers', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Users', href: '/admin/users', icon: '○', allowedRoles: ['SUPER_ADMIN'] },
    { name: 'Customer Support', href: '#', icon: '○', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
    { name: 'Settings', href: '#', icon: '○', allowedRoles: ['SUPER_ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(
    (item) => userRole && item.allowedRoles.includes(userRole)
  );

  const getPageTitle = () => {
    if (pathname === '/admin/dashboard') return 'Dashboard';
    if (pathname?.startsWith('/admin/products')) return 'Products';
    if (pathname?.startsWith('/admin/orders')) return 'Orders & Revenue';
    if (pathname?.startsWith('/admin/sections')) return 'Sections';
    if (pathname?.startsWith('/admin/categories')) return 'Categories';
    if (pathname?.startsWith('/admin/customers')) return 'Customers';
    if (pathname?.startsWith('/admin/users')) return 'Team & Permissions';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Clean Light Style (Reference Image) */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white border-r border-gray-100`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-6">
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
              SHENEFELTS
            </h1>
          </div>

          {/* Navigation - Clean Style */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '#');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.name}</span>
                  {item.href !== '#' && (
                    <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section at Bottom */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">User</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="text-gray-400 hover:text-gray-600"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar - Clean & Minimal */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-3">
              <button className="hidden lg:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <span>○</span>
                <span>Order</span>
              </button>
              <span className="text-gray-300">/</span>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">{session?.user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500">User</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
