import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminOrders, type AdminOrder } from '../hooks/useAdminOrders';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    isLoading,
    error,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
  } = useAdminOrders();

  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED'>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      filterStatus === 'all' ? true : order.status === filterStatus
    );
  }, [orders, filterStatus]);

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), change: 'All orders', icon: '📋', color: 'border-l-4 border-blue-500' },
    { label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length.toString(), change: 'Awaiting confirmation', icon: '⏳', color: 'border-l-4 border-orange-500' },
    { label: 'Confirmed', value: orders.filter(o => o.status === 'CONFIRMED').length.toString(), change: 'Stock deducted', icon: '📦', color: 'border-l-4 border-yellow-500' },
    { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length.toString(), change: 'Completed orders', icon: '✓', color: 'border-l-4 border-green-500' },
  ];

  const statusColors: Record<'PENDING' | 'CONFIRMED' | 'COMPLETED', { bg: string; text: string; badge: string }> = {
    PENDING: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
    CONFIRMED: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  };

  const handleConfirmOrder = async (orderId: string | number) => {
    try {
      await updateOrderStatus(orderId as string, 'CONFIRMED');
    } catch (err) {
      alert('Failed to confirm order');
    }
  };

  const handleCompleteOrder = async (orderId: string | number) => {
    try {
      await updateOrderStatus(orderId as string, 'COMPLETED');
    } catch (err) {
      alert('Failed to complete order');
    }
  };

  const handleCancelOrder = (orderId: string | number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(orderId as string).catch(err => {
        alert('Failed to delete order: ' + err.message);
      });
    }
  };

  return (
    <AdminLayout>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600">⚠️</span>
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all customer orders.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-lg shadow-sm p-6 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Status Tabs and Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 px-6">
            {[
              { label: 'All Orders', value: 'all' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'Completed', value: 'COMPLETED' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value as any)}
                className={`px-6 py-4 font-medium text-sm transition-colors ${filterStatus === tab.value
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ORDER ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    CUSTOMER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    AMOUNT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    PAYMENT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{Math.round(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED'].badge
                          } ${statusColors[order.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED'].text}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            View Details
                          </button>
                          {order.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleConfirmOrder(order.id)}
                                className="px-3 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded"
                              >
                                Confirm
                              </button>
                            </>
                          ) : order.status === 'CONFIRMED' ? (
                            <>
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCompleteOrder(order.id)}
                                className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded"
                              >
                                Complete
                              </button>
                            </>
                          ) : order.status === 'COMPLETED' ? (
                            <span className="text-xs text-gray-500 font-medium">✓ Completed</span>
                          ) : (
                            <span className="text-xs text-gray-500">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED'].badge
                    } ${statusColors[selectedOrder.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED'].text}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-gray-900">{selectedOrder.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Payment & Total */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(selectedOrder.totalAmount).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items ({selectedOrder.items})</h3>
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        {item.imageUrl && (
                          <div className="w-20 h-20 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            {item.color && <p>Color: {item.color}</p>}
                            {item.rom && <p>Storage: {item.rom}</p>}
                            <p>Quantity: {item.quantity}</p>
                            <p className="font-semibold text-gray-900">Price: {(item.priceAtPurchase || 0).toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">No items in this order</p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">

                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">{Math.round(selectedOrder.totalAmount).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Close
              </button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    Delete Order
                  </button>
                  <button
                    onClick={() => {
                      handleConfirmOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white font-medium hover:bg-yellow-700 rounded-lg transition"
                  >
                    Confirm Order
                  </button>
                </>
              )}
              {selectedOrder.status === 'CONFIRMED' && (
                <>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    Cancel Order
                  </button>
                  <button
                    onClick={() => {
                      handleCompleteOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition"
                  >
                    Complete Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
