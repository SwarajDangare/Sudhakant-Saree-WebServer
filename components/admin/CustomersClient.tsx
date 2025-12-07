'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  orderCount: number;
}

interface CustomersClientProps {
  customers: Customer[];
  permissions: {
    canViewDetails: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export default function CustomersClient({ customers, permissions }: CustomersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.phoneNumber.includes(query) ||
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
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
                {permissions.canViewDetails && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
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
                    {permissions.canViewDetails && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-maroon hover:text-deep-maroon transition"
                        >
                          View Details →
                        </Link>
                      </td>
                    )}
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
  );
}
