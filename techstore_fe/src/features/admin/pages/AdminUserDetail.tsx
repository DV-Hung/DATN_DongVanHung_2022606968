import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useUserDetail } from '../hooks/useUserDetail';
import { useUserOrders } from '../../orders/hooks/useUserOrders';

export const AdminUserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userId = id ? Number(id) : 0;

    const { user, isLoading: userLoading, error: userError, updateUserStatus } = useUserDetail(userId);
    const { orders, isLoading: ordersLoading, error: ordersError, pagination, loadNextPage, loadPreviousPage } = useUserOrders(userId);
    const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'>('all');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            return filterStatus === 'all' || order.status === filterStatus;
        });
    }, [orders, filterStatus]);

    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
        SHIPPING: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
        COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
        CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    };

    const roleColors: Record<string, { bg: string; text: string }> = {
        admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
        moderator: { bg: 'bg-blue-100', text: 'text-blue-700' },
        customer: { bg: 'bg-gray-100', text: 'text-gray-700' },
        support: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };

    const userStatusColors: Record<string, { bg: string; text: string; dot: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
        suspended: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    };

    const handleDeactivateUser = async () => {
        try {
            await updateUserStatus('inactive');
            alert('User deactivated successfully');
        } catch (err) {
            alert('Failed to deactivate user');
        }
    };

    // Show loading state while fetching user
    if (userLoading) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <div className="inline-block animate-spin">⏳</div>
                    <p className="mt-2 text-gray-600">Đang tải thông tin người dùng...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">{userError || 'Người dùng không tìm thấy'}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại Người Dùng
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/users')}
                className="mb-6 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-2"
            >
                ← Quay lại Người Dùng
            </button>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-gray-600 mt-2">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDeactivateUser}
                            disabled={user.status === 'inactive'}
                            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ✕ Vô Hiệu Hóa
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">ĐIỆN THOẠI</p>
                        <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">VAI TRÒ</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]?.bg} ${roleColors[user.role]?.text}`}>
                            {user.role}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">TRẠNG THÁI</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${userStatusColors[user.status].dot}`}></div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${userStatusColors[user.status].bg} ${userStatusColors[user.status].text}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">NGÀY THAM GIA</p>
                        <p className="text-lg font-semibold text-gray-900">{user.joinDate}</p>
                    </div>
                </div>
            </div>

            {/* Orders Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Lịch Sử Đơn Hàng</h2>
            </div>

            {/* Error Alert */}
            {ordersError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <span className="text-red-600">⚠️</span>
                    <p className="text-red-700 text-sm">{ordersError}</p>
                </div>
            )}

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo Trạng Thái</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất Cả Trạng Thái</option>
                    <option value="PENDING">Đang Chờ</option>
                    <option value="CONFIRMED">Đã Xác Nhận</option>
                    <option value="COMPLETED">Hoàn Thành</option>
                    <option value="CANCELLED">Đã Hủy</option>
                </select>
            </div>

            {/* Loading State */}
            {ordersLoading && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="inline-block animate-spin">⏳</div>
                    <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
                </div>
            )}

            {/* Orders List */}
            {!ordersLoading && (
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">Đơn hàng #{order.orderCode}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{order.createdAt}</p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${statusColors[order.status].dot}`}></div>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status].bg} ${statusColors[order.status].text}`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {order.totalPrice.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">{order.items.length} sản phẩm</p>
                                        </div>
                                        <span className="ml-4 text-2xl text-gray-400">
                                            {expandedOrder === order.id ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Details (Expandable) */}
                                {expandedOrder === order.id && (
                                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                                        {/* Shipping Info */}
                                        <div className="mb-6 pb-6 border-b border-gray-200">
                                            <h4 className="font-semibold text-gray-900 mb-3">Thông tin giao hàng</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                                    <p className="text-sm font-medium text-gray-900">{order.shippingAddress}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                                    <p className="text-sm font-medium text-gray-900">{order.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-900 mb-3">Chi tiết đơn hàng</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {item.subtotal.toLocaleString('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                })}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.price.toLocaleString('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                })}{' '}
                                                                x {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Total */}
                                        <div className="flex justify-end pt-4 border-t border-gray-200">
                                            <div className="w-full md:w-64">
                                                <div className="flex justify-between mb-2">
                                                    <p className="text-gray-600">Tạm tính</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(order.totalPrice).toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                                                    <p className="text-gray-600">Phí vận chuyển</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(order.totalPrice * 0).toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="font-semibold text-gray-900">Tổng cộng</p>
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {order.totalPrice.toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <p className="text-gray-600">Không tìm thấy đơn hàng</p>
                            <p className="text-gray-500 text-sm mt-2">
                                {filterStatus !== 'all'
                                    ? 'Không có đơn hàng nào với trạng thái đã chọn'
                                    : 'Người dùng chưa có đơn hàng nào'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!ordersLoading && orders.length > 0 && (
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Trang {pagination.page + 1} của {pagination.totalPages} ({pagination.totalElements} đơn hàng)
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={loadPreviousPage}
                            disabled={pagination.page === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={loadNextPage}
                            disabled={pagination.page + 1 >= pagination.totalPages}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};
