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

  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<{ id: string | number; name: string } | null>(null);
  const [confirmConfirm, setConfirmConfirm] = useState<{ id: string | number; name: string } | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<{ id: string | number; name: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      filterStatus === 'all' ? true : order.status === filterStatus
    );
  }, [orders, filterStatus]);

  const stats = [
    { label: 'Đang Chờ', value: orders.filter(o => o.status === 'PENDING').length.toString(), change: 'Chờ xác nhận', icon: '⏳', color: 'border-l-4 border-orange-500' },
    { label: 'Đã Xác Nhận', value: orders.filter(o => o.status === 'CONFIRMED').length.toString(), change: 'Đã trừ hàng tồn', icon: '📦', color: 'border-l-4 border-yellow-500' },
    { label: 'Hoàn Thành', value: orders.filter(o => o.status === 'COMPLETED').length.toString(), change: 'Đơn hàng hoàn thành', icon: '✓', color: 'border-l-4 border-green-500' },
    { label: 'Đã Hủy', value: orders.filter(o => o.status === 'CANCELLED').length.toString(), change: 'Đơn hàng đã hủy', icon: '✗', color: 'border-l-4 border-red-500' },
  ];

  const statusColors: Record<'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED', { bg: string; text: string; badge: string }> = {
    PENDING: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100' },
    CONFIRMED: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  };

  const handleConfirmOrder = async (orderId: string | number) => {
    setIsSaving(true);
    try {
      await updateOrderStatus(orderId as string, 'CONFIRMED');
      setConfirmConfirm(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể xác nhận đơn hàng');
      setConfirmConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteOrder = async (orderId: string | number) => {
    setIsSaving(true);
    try {
      await updateOrderStatus(orderId as string, 'COMPLETED');
      setCompleteConfirm(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể hoàn thành đơn hàng');
      setCompleteConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelOrder = async (orderId: string | number) => {
    setIsSaving(true);
    try {
      await cancelOrder(orderId as string);
      setCancelConfirm(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể hủy đơn hàng');
      setCancelConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId: string | number) => {
    setIsSaving(true);
    try {
      await deleteOrder(orderId as string);
      setDeleteConfirm(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể xóa đơn hàng');
      setDeleteConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600">⚠️</span>
          <div>
            <p className="font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}


      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả đơn hàng của khách hàng.</p>
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
          <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      )}

      {/* Status Tabs and Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 px-6">
            {[
              { label: 'Tất Cả Đơn Hàng', value: 'all' },
              { label: 'Đang Chờ', value: 'PENDING' },
              { label: 'Đã Xác Nhận', value: 'CONFIRMED' },
              { label: 'Hoàn Thành', value: 'COMPLETED' },
              { label: 'Đã Hủy', value: 'CANCELLED' },
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
                    MÃ ĐơN HÀNG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NGÀY TẠO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    KHÁCH HÀNG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SỐ TIỀN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    PHƯƠNG THỨC THANH TOÁN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{Math.round(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED']?.badge
                          } ${statusColors[order.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED']?.text}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Xem Chi Tiết
                          </button>
                          {order.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => setDeleteConfirm({ id: order.id, name: order.id as string })}
                                className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => setConfirmConfirm({ id: order.id, name: order.id as string })}
                                className="px-3 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-50 rounded"
                              >
                                Xác Nhận
                              </button>
                            </>
                          ) : order.status === 'CONFIRMED' ? (
                            <>
                              <button
                                onClick={() => setCancelConfirm({ id: order.id, name: order.id as string })}
                                className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => setCompleteConfirm({ id: order.id, name: order.id as string })}
                                className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded"
                              >
                                Hoàn thành
                              </button>
                            </>
                          ) : order.status === 'COMPLETED' ? (
                            <span className="text-xs text-gray-500 font-medium">✓ Đã hoàn thành</span>
                          ) : order.status === 'CANCELLED' ? (
                            <span className="text-xs text-gray-500 font-medium">✕ Đã hủy</span>
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
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredOrders.length} trong số {orders.length} đơn hàng
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
                <h2 className="text-2xl font-bold text-gray-900">Đơn hàng #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedOrder.date).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </p>
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
                  <p className="text-sm text-gray-600 mb-1">Tên khách hàng</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED']?.badge
                    } ${statusColors[selectedOrder.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED']?.text}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                  <p className="text-gray-900">{selectedOrder.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng</p>
                  <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Payment & Total */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng số tiền</p>
                  <p className="text-lg font-semibold text-gray-900">{Math.round(selectedOrder.totalAmount).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết đơn hàng ({selectedOrder.items})</h3>
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
                            {item.color && <p>Màu: {item.color}</p>}
                            {item.rom && <p>Bộ nhớ: {item.rom}</p>}
                            <p>Số lượng: {item.quantity}</p>
                            <p className="font-semibold text-gray-900">Giá: {(item.priceAtPurchase || 0).toLocaleString('vi-VN')}đ</p>
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
                    <p className="text-gray-600 text-sm">Không có sản phẩm nào trong đơn hàng này</p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">

                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-bold text-gray-900">Tổng cộng</span>
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
                Đóng
              </button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      setDeleteConfirm({ id: selectedOrder.id, name: selectedOrder.id as string });
                    }}
                    className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    Xóa Đơn Hàng
                  </button>
                  <button
                    onClick={() => {
                      setConfirmConfirm({ id: selectedOrder.id, name: selectedOrder.id as string });
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white font-medium hover:bg-yellow-700 rounded-lg transition"
                  >
                    Xác Nhận Đơn Hàng
                  </button>
                </>
              )}
              {selectedOrder.status === 'CONFIRMED' && (
                <>
                  <button
                    onClick={() => {
                      setCancelConfirm({ id: selectedOrder.id, name: selectedOrder.id as string });
                    }}
                    className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                  >
                    Hủy Đơn Hàng
                  </button>
                  <button
                    onClick={() => {
                      setCompleteConfirm({ id: selectedOrder.id, name: selectedOrder.id as string });
                    }}
                    className="px-4 py-2 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition"
                  >
                    Hoàn Thành Đơn Hàng
                  </button>
                </>
              )}
              {selectedOrder.status === 'CANCELLED' && (
                <span className="text-sm text-gray-600 font-medium">Đơn hàng này đã bị hủy</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Xóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa đơn hàng <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteOrder(deleteConfirm.id)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                >
                  {isSaving ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Order Modal */}
      {confirmConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Xác Nhận Đơn Hàng</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xác nhận đơn hàng <strong>{confirmConfirm.name}</strong>? Hành động này sẽ trừ hàng tồn.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmConfirm(null)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleConfirmOrder(confirmConfirm.id)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition disabled:opacity-50"
                >
                  {isSaving ? 'Đang xác nhận...' : 'Xác Nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Hủy Đơn Hàng</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hủy đơn hàng <strong>{cancelConfirm.name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCancelConfirm(null)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleCancelOrder(cancelConfirm.id)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                >
                  {isSaving ? 'Đang hủy...' : 'Hủy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Order Modal */}
      {completeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Hoàn Thành Đơn Hàng</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn hoàn thành đơn hàng <strong>{completeConfirm.name}</strong>? Đơn hàng sẽ được đánh dấu là hoàn thành.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCompleteConfirm(null)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleCompleteOrder(completeConfirm.id)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50"
                >
                  {isSaving ? 'Đang hoàn thành...' : 'Hoàn Thành'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
