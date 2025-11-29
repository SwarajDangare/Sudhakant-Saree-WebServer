'use client';

import { useState, useMemo } from 'react';
import { Permission } from '@/lib/permissions';
import Image from 'next/image';

interface OrderItem {
  id: string;
  productName: string;
  productColor: string | null;
  quantity: number;
  price: string;
  subtotal: string;
}

interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
}

interface Address {
  id: string;
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  paymentMethod: string;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  customer: Customer;
  address: Address;
}

interface OrdersManagementCleanProps {
  initialOrders: Order[];
  permissions: Permission;
}

export default function OrdersManagementClean({
  initialOrders,
  permissions,
}: OrdersManagementCleanProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const totalEarnings = orders.reduce((sum, order) => sum + Number(order.total), 0);

  const lastMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return orderDate >= lastMonth;
  });
  const lastMonthEarnings = lastMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);

  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    return orderDate >= thisMonth;
  });
  const thisMonthEarnings = thisMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);

  const pendingOrders = orders.filter(order => order.status === 'PENDING' || order.status === 'CONFIRMED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'CONFIRMED':
        return 'badge-success';
      case 'SHIPPED':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== 'All Statuses' && order.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesCustomer = order.customer?.name?.toLowerCase().includes(query) ||
                                 order.customer?.phoneNumber.includes(query);
        if (!matchesOrderNumber && !matchesCustomer) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!permissions.canUpdateOrderStatus) {
      alert('You do not have permission to update order status');
      return;
    }

    setUpdatingStatus(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: updatedOrder.status } : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: updatedOrder.status });
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards - Reference Image Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="soft-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Earning Last Month */}
        <div className="soft-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Earning Last Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${lastMonthEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Earning This Month */}
        <div className="soft-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Earning This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                ${thisMonthEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="soft-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                ${pendingOrders.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="soft-card overflow-hidden">
        {/* Table Header with Controls */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>All Statuses</option>
              <option>PENDING</option>
              <option>CONFIRMED</option>
              <option>PROCESSING</option>
              <option>SHIPPED</option>
              <option>DELIVERED</option>
              <option>CANCELLED</option>
            </select>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>

        {/* Clean Table - No Grid Lines */}
        <table className="clean-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              {permissions.canViewCustomerInfo && <th>Customer Name</th>}
              <th>Price</th>
              <th>Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  {/* Order ID */}
                  <td className="text-gray-500">
                    {order.orderNumber}
                  </td>

                  {/* Product - CRITICAL: Image + Name + Details */}
                  <td>
                    <div className="product-cell-flex">
                      {/* Product Thumbnail */}
                      <div className="product-thumbnail">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          🛍️
                        </div>
                      </div>

                      {/* Product Details Stack */}
                      <div className="product-details-stack">
                        <p className="product-name">
                          {order.items[0]?.productName || 'Product'}
                        </p>
                        <p className="product-meta">
                          SKU: F101 • Size: M • Color: {order.items[0]?.productColor || 'N/A'} • Qty: {order.items[0]?.quantity || 0}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Customer Name */}
                  {permissions.canViewCustomerInfo && (
                    <td className="text-gray-900 font-medium">
                      {order.customer?.name || 'Guest'}
                    </td>
                  )}

                  {/* Price */}
                  <td className="text-gray-900 font-medium">
                    ${parseFloat(order.total).toFixed(2)}
                  </td>

                  {/* Date */}
                  <td className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    })}
                  </td>

                  {/* Status Pills */}
                  <td>
                    {permissions.canUpdateOrderStatus ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`${getStatusBadge(order.status)} border-0 cursor-pointer`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : (
                      <span className={getStatusBadge(order.status)}>
                        {getStatusLabel(order.status)}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <p>Page 1 of 10</p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {[1, 2, 3, '...', 8, 9, 10].map((page, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded ${page === 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="soft-card max-w-3xl w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.productColor && `Color: ${item.productColor} • `}
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
