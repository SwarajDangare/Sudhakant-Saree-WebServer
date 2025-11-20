'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  orderCount: number;
}

export default function AdminCustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login?callbackUrl=/admin/customers');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCustomers();
    }
  }, [status]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/customers');

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.phoneNumber.includes(query) ||
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.id.toLowerCase().includes(query)
    );
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-maroon mb-6 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-maroon mb-2">Customer Management</h1>
          <p className="text-gray-600">View and manage all registered customers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Search and Stats */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customers
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email, or ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <div className="bg-maroon text-white rounded-lg px-6 py-3 w-full">
                <div className="text-sm opacity-90">Total Customers</div>
                <div className="text-3xl font-bold">{customers.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {customer.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {customer.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.orderCount > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-maroon hover:text-deep-maroon transition"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        {customers.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Customers with Orders</div>
              <div className="text-2xl font-bold text-maroon">
                {customers.filter(c => c.orderCount > 0).length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total Orders Placed</div>
              <div className="text-2xl font-bold text-maroon">
                {customers.reduce((sum, c) => sum + c.orderCount, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">New This Month</div>
              <div className="text-2xl font-bold text-maroon">
                {customers.filter(c => {
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(c.createdAt) > monthAgo;
                }).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
