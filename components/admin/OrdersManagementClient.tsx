'use client';

import { useState } from 'react';
import { Permission } from '@/lib/permissions';

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

interface OrdersManagementClientProps {
  initialOrders: Order[];
  permissions: Permission;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'PROCESSING', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function OrdersManagementClient({
  initialOrders,
  permissions,
}: OrdersManagementClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.label || status;
  };

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

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: updatedOrder.status } : order
      ));

      // Update selected order if it's the one being updated
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

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: updatedOrder.status } : order
      ));

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: updatedOrder.status });
      }

      // Open WhatsApp link if available
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
    <div>
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                {permissions.canViewCustomerInfo && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </div>
                  </td>
                  {permissions.canViewCustomerInfo && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.phoneNumber}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{parseFloat(order.total).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {permissions.canUpdateOrderStatus ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-maroon ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-maroon hover:text-deep-maroon"
                      >
                        View Details
                      </button>
                      {permissions.canUpdateOrderStatus && (
                        <button
                          onClick={() => handleSendWhatsAppUpdate(order.id, order.status)}
                          disabled={updatingStatus === order.id}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-md transition text-xs font-medium"
                          title="Send WhatsApp update"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found.
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                {permissions.canUpdateOrderStatus ? (
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus === selectedOrder.id}
                      className={`text-sm font-medium px-3 py-2 rounded-md border focus:ring-2 focus:ring-maroon ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSendWhatsAppUpdate(selectedOrder.id, selectedOrder.status)}
                      disabled={updatingStatus === selectedOrder.id}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition font-medium text-sm"
                      title="Send WhatsApp update to customer"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Send WhatsApp Update
                    </button>
                  </div>
                ) : (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                )}
              </div>

              {/* Customer Information (only if permission) */}
              {permissions.canViewCustomerInfo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm">
                      <strong>Name:</strong> {selectedOrder.customer?.name || 'N/A'}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Phone:</strong> {selectedOrder.customer?.phoneNumber}
                    </p>
                    {selectedOrder.customer?.email && (
                      <p className="text-sm mt-1">
                        <strong>Email:</strong> {selectedOrder.customer.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Delivery Address
                </h3>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm font-medium">{selectedOrder.address?.name}</p>
                  <p className="text-sm mt-1">{selectedOrder.address?.phoneNumber}</p>
                  <p className="text-sm mt-1">{selectedOrder.address?.addressLine1}</p>
                  {selectedOrder.address?.addressLine2 && (
                    <p className="text-sm">{selectedOrder.address.addressLine2}</p>
                  )}
                  <p className="text-sm">
                    {selectedOrder.address?.city}, {selectedOrder.address?.state}{' '}
                    {selectedOrder.address?.pincode}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Color
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm">{item.productName}</td>
                          <td className="px-4 py-2 text-sm">
                            {item.productColor || 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            ₹{parseFloat(item.price).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium">
                            ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h3>
                <div className="bg-gray-50 rounded-md p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>
                        -₹{parseFloat(selectedOrder.discount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
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
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Order Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Order Date:</span>{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(selectedOrder.updatedAt).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition font-medium"
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
