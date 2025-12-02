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

interface OrdersManagementModernProps {
  initialOrders: Order[];
  permissions: Permission;
}

const statusOptions = [
  { value: 'ALL', label: 'All Orders', color: '' },
  { value: 'PENDING', label: 'Pending', color: 'badge-warning' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'badge-info' },
  { value: 'PROCESSING', label: 'Processing', color: 'badge-purple' },
  { value: 'SHIPPED', label: 'Shipped', color: 'badge-info' },
  { value: 'DELIVERED', label: 'Delivered', color: 'badge-success' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'badge-danger' },
];

export default function OrdersManagementModern({
  initialOrders,
  permissions,
}: OrdersManagementModernProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL');

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'badge-info';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.label || status;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesOrderNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesCustomer = order.customer?.name?.toLowerCase().includes(query) ||
                                 order.customer?.phoneNumber.includes(query);
        if (!matchesOrderNumber && !matchesCustomer) return false;
      }

      // Date filter
      if (dateFilter !== 'ALL') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'WEEK') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
        } else if (dateFilter === 'MONTH') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery, dateFilter]);

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

      alert('Order status updated successfully');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSendWhatsAppUpdate = async (orderId: string, currentStatus: string) => {
    if (!permissions.canUpdateOrderStatus) {
      alert('You do not have permission to send WhatsApp updates');
      return;
    }

    setUpdatingStatus(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update order');
      }

      const updatedOrder = await response.json();

      if (updatedOrder.whatsappLink) {
        window.open(updatedOrder.whatsappLink, '_blank');
      } else {
        alert('WhatsApp link not available for this order');
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
      {/* Filter Bar */}
      <div className="soft-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="soft-input w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === status.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="soft-input"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last Week</option>
            <option value="MONTH">Last Month</option>
          </select>

          {/* Export Button */}
          <button className="soft-btn-secondary whitespace-nowrap">
            📥 Export
          </button>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredOrders.length}</span> of{' '}
          <span className="font-semibold">{orders.length}</span> orders
        </div>
      </div>

      {/* Orders Table - Clean Design */}
      <div className="soft-card overflow-hidden">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Order</th>
              {permissions.canViewCustomerInfo && <th>Customer</th>}
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No orders found</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="font-semibold text-gray-900">#{order.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>

                  {permissions.canViewCustomerInfo && (
                    <td>
                      <div className="font-medium text-gray-900">
                        {order.customer?.name || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.phoneNumber}
                      </div>
                    </td>
                  )}

                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        🛍️
                      </div>
                      <div className="text-sm text-gray-700 truncate max-w-[200px]">
                        {order.items[0]?.productName}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="font-bold text-gray-900">
                      ₹{parseFloat(order.total).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                  </td>

                  <td>
                    {permissions.canUpdateOrderStatus ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`soft-pill ${getStatusBadge(order.status)} border-0 cursor-pointer`}
                      >
                        {statusOptions.slice(1).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`soft-pill ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </button>
                      {permissions.canUpdateOrderStatus && (
                        <button
                          onClick={() => handleSendWhatsAppUpdate(order.id, order.status)}
                          disabled={updatingStatus === order.id}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                          title="Send WhatsApp update"
                        >
                          💬
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="soft-card max-w-3xl w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Status</h3>
                {permissions.canUpdateOrderStatus ? (
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus === selectedOrder.id}
                      className={`soft-pill ${getStatusBadge(selectedOrder.status)} border cursor-pointer`}
                    >
                      {statusOptions.slice(1).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSendWhatsAppUpdate(selectedOrder.id, selectedOrder.status)}
                      disabled={updatingStatus === selectedOrder.id}
                      className="soft-btn-primary bg-green-600 hover:bg-green-700"
                    >
                      💬 Send WhatsApp Update
                    </button>
                  </div>
                ) : (
                  <span className={`soft-pill ${getStatusBadge(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                )}
              </div>

              {/* Customer & Address Information */}
              {permissions.canViewCustomerInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Customer</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium">{selectedOrder.customer?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customer?.phoneNumber}</p>
                      {selectedOrder.customer?.email && (
                        <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Delivery Address</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium">{selectedOrder.address?.name}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.address?.phoneNumber}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedOrder.address?.addressLine1}
                        {selectedOrder.address?.addressLine2 && `, ${selectedOrder.address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.address?.city}, {selectedOrder.address?.state}{' '}
                        {selectedOrder.address?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                          ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₹{parseFloat(item.price).toLocaleString('en-IN')} each
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
                    <span>₹{parseFloat(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-₹{parseFloat(selectedOrder.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>₹{parseFloat(selectedOrder.total).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2">
                    <span>Payment Method:</span>
                    <span className="font-medium">{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="soft-btn-secondary"
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
