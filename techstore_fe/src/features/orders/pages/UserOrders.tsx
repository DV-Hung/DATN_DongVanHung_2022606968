import React, { useState, useMemo } from 'react';
import { MainLayout } from '../../../layouts/MainLayout';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useUserOrders } from '../hooks/useUserOrders';

export const UserOrders: React.FC = () => {
    const { user } = useAuth();
    const { orders, isLoading, error, pagination, loadNextPage, loadPreviousPage } = useUserOrders(
        user?.id || 0
    );

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

    const stats = [
        { label: 'Total Orders', value: pagination.totalElements, icon: '📦' },
        { label: 'Pending', value: orders.filter((o) => o.status === 'PENDING').length, icon: '⏳' },
        { label: 'Completed', value: orders.filter((o) => o.status === 'COMPLETED').length, icon: '✅' },
        { label: 'Cancelled', value: orders.filter((o) => o.status === 'CANCELLED').length, icon: '❌' },
    ];

    if (!user) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <p className="text-gray-600">Please log in to view your orders</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-2">Track and manage your orders</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <span className="text-red-600">⚠️</span>
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPING">Shipping</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="inline-block animate-spin">⏳</div>
                    <p className="mt-2 text-gray-600">Loading your orders...</p>
                </div>
            )}

            {/* Orders List */}
            {!isLoading && (
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
                                                    <h3 className="font-semibold text-gray-900">Order #{order.orderCode}</h3>
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
                                            <p className="text-sm text-gray-500 mt-1">{order.items.length} items</p>
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
                                            <h4 className="font-semibold text-gray-900 mb-3">Shipping Information</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Address</p>
                                                    <p className="text-sm font-medium text-gray-900">{order.shippingAddress}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Phone</p>
                                                    <p className="text-sm font-medium text-gray-900">{order.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
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
                                                    <p className="text-gray-600">Subtotal</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(order.totalPrice * 0.9).toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                                                    <p className="text-gray-600">Shipping</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {(order.totalPrice * 0.1).toLocaleString('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="font-semibold text-gray-900">Total</p>
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
                            <p className="text-gray-600 text-lg">No orders found</p>
                            <p className="text-gray-500 text-sm mt-2">
                                {filterStatus !== 'all'
                                    ? 'No orders with this status'
                                    : 'You haven\'t placed any orders yet'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && orders.length > 0 && (
                <div className="mt-8 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} total orders)
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
        </MainLayout>
    );
};
