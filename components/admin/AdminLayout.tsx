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

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Products', href: '/admin/products', icon: '🛍️' },
    { name: 'Categories', href: '/admin/categories', icon: '📁', superAdminOnly: true },
    { name: 'Users', href: '/admin/users', icon: '👥', superAdminOnly: true },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-maroon`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-silk-white">
              Sudhakant Sarees
            </h1>
            <p className="text-silk-white/60 text-sm mt-1">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-silk-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-white/10">
            <div className="mb-3">
              <p className="text-silk-white font-medium text-sm">
                {session?.user?.name}
              </p>
              <p className="text-silk-white/60 text-xs">{session?.user?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-golden text-deep-maroon font-semibold">
                {session?.user?.role?.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="w-full flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-silk-white rounded-md transition text-sm font-medium"
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
              {pathname === '/admin/dashboard' && 'Dashboard'}
              {pathname?.startsWith('/admin/products') && 'Product Management'}
              {pathname?.startsWith('/admin/categories') && 'Category Management'}
              {pathname?.startsWith('/admin/users') && 'User Management'}
            </h2>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-maroon flex items-center"
              >
                <span className="mr-1">🌐</span>
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
