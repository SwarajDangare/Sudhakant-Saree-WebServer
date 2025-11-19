'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CustomerDetails {
  customer: {
    id: string;
    phoneNumber: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    updatedAt: string;
  };
  addresses: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    subtotal: string;
    discount: string;
    total: string;
    notes: string | null;
    createdAt: string;
    address: any;
    items: Array<{
      id: string;
      productName: string;
      productColor: string | null;
      price: string;
      quantity: number;
      subtotal: string;
      product: any;
    }>;
  }>;
  totalOrders: number;
}

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login?callbackUrl=/admin/customers/' + params.id);
    }
  }, [status, router, params.id]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCustomerDetails();
    }
  }, [status, params.id]);

  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/customers/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const data = await response.json();
      setCustomerData(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error || !customerData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error || 'Customer not found'}</p>
            <Link href="/admin/customers" className="mt-4 inline-block text-maroon hover:underline">
              ← Back to Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { customer, addresses, orders, totalOrders } = customerData;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/customers" className="text-maroon hover:underline mb-2 inline-block">
            ← Back to Customers
          </Link>
          <h1 className="text-3xl font-bold text-maroon mb-2">Customer Details</h1>
        </div>

        {/* Customer Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="text-lg font-semibold">{customer.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone Number</div>
                  <div className="text-lg font-mono">{customer.phoneNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="text-lg">{customer.email || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Customer ID</div>
                  <div className="text-sm font-mono text-gray-700">{customer.id}</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="bg-maroon text-white rounded-lg p-4">
                  <div className="text-sm opacity-90">Total Orders</div>
                  <div className="text-3xl font-bold">{totalOrders}</div>
                </div>
                <div className="bg-green-600 text-white rounded-lg p-4">
                  <div className="text-sm opacity-90">Total Revenue</div>
                  <div className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Member Since</div>
                  <div className="text-lg font-semibold">
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        {addresses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Saved Addresses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`border rounded-lg p-4 ${
                    address.isDefault ? 'border-maroon bg-maroon bg-opacity-5' : 'border-gray-200'
                  }`}
                >
                  {address.isDefault && (
                    <span className="inline-block bg-maroon text-white text-xs px-2 py-1 rounded mb-2">
                      Default
                    </span>
                  )}
                  <div className="font-semibold">{address.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {address.addressLine1}
                    {address.addressLine2 && <>, {address.addressLine2}</>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 font-mono">{address.phoneNumber}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Items:</div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded p-3">
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            {item.productColor && (
                              <div className="text-sm text-gray-600">Color: {item.productColor}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              ₹{parseFloat(item.price).toFixed(2)} × {item.quantity}
                            </div>
                            <div className="font-semibold">₹{parseFloat(item.subtotal).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>₹{parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    {parseFloat(order.discount) > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-green-600">
                        <span>Discount:</span>
                        <span>-₹{parseFloat(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Total:</span>
                      <span className="text-maroon">₹{parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="text-sm font-semibold text-gray-700">Notes:</div>
                      <div className="text-sm text-gray-600">{order.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
