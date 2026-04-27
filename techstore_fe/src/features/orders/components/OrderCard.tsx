import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../services/orderService';

interface OrderCardProps {
    order: Order;
    onCancelOrder?: (orderId: number) => void;
    isLoading?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    onCancelOrder,
    isLoading,
}) => {
    const { t } = useTranslation();
    const [showDetails, setShowDetails] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string): string => {
        const statusMap: Record<string, string> = {
            'PENDING': t('order.status.pending') || 'Chờ xác nhận',
            'CONFIRMED': t('order.status.confirmed') || 'Đã xác nhận',
            'SHIPPED': t('order.status.shipped') || 'Đang giao',
            'DELIVERED': t('order.status.delivered') || 'Đã giao',
            'COMPLETED': t('order.status.completed') || 'Hoàn thành',
            'CANCELLED': t('order.status.cancelled') || 'Đã hủy',
        };
        return statusMap[status] || status;
    };

    const canCancelOrder = (status: string) => {
        return status === 'PENDING';
    };

    const handleCancelClick = () => {
        if (onCancelOrder) {
            onCancelOrder(order.id);
            setShowCancelModal(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-600">{t('order.code') || 'Mã đơn hàng'}</p>
                                <p className="font-semibold text-gray-900">{order.id}</p>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm text-gray-600">{t('order.date') || 'Ngày đặt'}</p>
                                <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Order Items Summary */}
            <div className="px-6 py-4">
                <div className="space-y-3">
                    {order.orderItems.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center gap-4 text-sm">
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-12 h-12 rounded object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.productName}</p>
                                <p className="text-gray-600">
                                    {item.quantity}x {formatPrice(item.priceAtPurchase)}
                                </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                                {formatPrice(item.subtotal)}
                            </p>
                        </div>
                    ))}
                    {order.orderItems.length > 2 && (
                        <p className="text-sm text-gray-600 pt-2">
                            +{order.orderItems.length - 2} {t('order.moreItems') || 'sản phẩm khác'}
                        </p>
                    )}
                </div>
            </div>

            {/* Order Total */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">
                        {t('order.total') || 'Tổng tiền'}:
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(order.totalAmount)}
                    </p>
                </div>
            </div>

            {/* Order Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    {showDetails ? (t('order.hideDetails') || 'Ẩn chi tiết') : (t('order.viewDetails') || 'Xem chi tiết')}
                </button>
                {canCancelOrder(order.status) && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (t('order.cancelling') || 'Đang hủy...') : (t('order.cancel') || 'Hủy đơn')}
                    </button>
                )}
            </div>

            {/* Order Details */}
            {showDetails && (
                <div className="px-6 py-4 border-t border-gray-200 bg-white">
                    <div className="space-y-4">
                        {/* Customer Info */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {t('order.customerInfo') || 'Thông tin khách hàng'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">{t('order.name') || 'Tên'}</p>
                                    <p className="font-medium text-gray-900">{order.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">{t('order.phone') || 'Điện thoại'}</p>
                                    <p className="font-medium text-gray-900">{order.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">{t('order.email') || 'Email'}</p>
                                    <p className="font-medium text-gray-900">{order.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">{t('order.address') || 'Địa chỉ'}</p>
                                    <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Details */}
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                                {t('order.items') || 'Sản phẩm'}
                            </h4>
                            <div className="space-y-2">
                                {order.orderItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.productName}</p>
                                            <p className="text-gray-600">
                                                {item.quantity}x {formatPrice(item.priceAtPurchase)}
                                                {(item.color || item.rom) && (
                                                    <span className="text-gray-500 ml-2">
                                                        {item.color && `Màu: ${item.color}`}
                                                        {item.rom && ` | ROM: ${item.rom}`}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {formatPrice(item.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Info */}
                        {(order.shippingMethod || order.paymentMethod || order.notes) && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    {t('order.additionalInfo') || 'Thông tin bổ sung'}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {order.shippingMethod && (
                                        <div>
                                            <p className="text-gray-600">{t('order.shippingMethod') || 'Phương thức giao'}</p>
                                            <p className="font-medium text-gray-900">{order.shippingMethod}</p>
                                        </div>
                                    )}
                                    {order.paymentMethod && (
                                        <div>
                                            <p className="text-gray-600">{t('order.paymentMethod') || 'Phương thức thanh toán'}</p>
                                            <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                                        </div>
                                    )}
                                </div>
                                {order.notes && (
                                    <div>
                                        <p className="text-gray-600">{t('order.notes') || 'Ghi chú'}</p>
                                        <p className="font-medium text-gray-900">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t('order.confirmCancel') || 'Xác nhận hủy đơn hàng?'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {t('order.cancelWarning') || 'Bạn có chắc chắn muốn hủy đơn hàng này không?'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
                            >
                                {t('common.cancel') || 'Hủy'}
                            </button>
                            <button
                                onClick={handleCancelClick}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (t('order.cancelling') || 'Đang hủy...') : (t('order.confirmCancel') || 'Xác nhận hủy')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
