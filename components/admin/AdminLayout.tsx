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
    {
      section: 'DISCOVER',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
        { name: 'Stores', href: '#', icon: '🏪', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
      ]
    },
    {
      section: 'INVENTORY',
      items: [
        { name: 'Products', href: '/admin/products', icon: '📦', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
        { name: 'Category', href: '/admin/categories', icon: '📁', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
        { name: 'Suppliers', href: '/admin/sections', icon: '🚚', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
        { name: 'Billing', href: '#', icon: '💳', allowedRoles: ['SUPER_ADMIN'] },
        { name: 'Orders', href: '/admin/orders', icon: '📋', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
        { name: 'Delivery', href: '#', icon: '🚛', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
        { name: 'Report', href: '/admin/customers', icon: '📊', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER'] },
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { name: 'Settings', href: '#', icon: '⚙️', allowedRoles: ['SUPER_ADMIN'] },
        { name: 'Help', href: '#', icon: '❓', allowedRoles: ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN'] },
        { name: 'Team', href: '/admin/users', icon: '👥', allowedRoles: ['SUPER_ADMIN'] },
      ]
    }
  ];

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
              const filteredItems = section.items.filter(
                (item) => userRole && item.allowedRoles.includes(userRole)
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="mb-6">
                  <h3 className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {filteredItems.map((item) => {
                      const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '#');
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-white text-indigo-600'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.name}</span>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search item, order, etc"
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Avatar with Dropdown */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{session?.user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-500">
                    {session?.user?.role?.replace('_', ' ') || 'Super Admin'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8 bg-gray-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}
