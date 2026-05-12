import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Header, Footer, Toast, Breadcrumb } from '../../../shared/components';
import { apiClient } from '../../../services/api';

interface OrderItem {
    id: number;
    variantId: number;
    productId: number;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    color?: string;
    rom?: string;
    imageUrl?: string;
    subtotal: number;
}

interface Order {
    id: string;
    orderCode: string;
    customerName: string;
    phone: string;
    email: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
}

export const OrderTrackingPage: React.FC = () => {
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            setToastMessage({
                message: 'Vui lòng nhập số điện thoại',
                type: 'error'
            });
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            // Call API without authentication (public endpoint)
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
            const response = await axios.get(`${API_BASE_URL}/orders/search`, {
                params: {
                    phone: phoneNumber.trim(),
                    page: 0,
                    size: 100
                }
            });

            if (response.data?.data) {
                const orderData = response.data.data;
                const allOrders = Array.isArray(orderData.content) ? orderData.content : [orderData];

                if (allOrders.length === 0) {
                    setToastMessage({
                        message: 'Không tìm thấy đơn hàng nào',
                        type: 'error'
                    });
                    setOrders([]);
                } else {
                    setOrders(allOrders);
                    setToastMessage({
                        message: `Tìm thấy ${allOrders.length} đơn hàng`,
                        type: 'success'
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setToastMessage({
                message: 'Lỗi khi tìm kiếm đơn hàng',
                type: 'error'
            });
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'chờ xử lý':
                return 'bg-yellow-100 text-yellow-800';
            case 'shipped':
            case 'đã gửi':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
            case 'đã giao':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
            case 'đã hủy':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Toast Notification */}
            {toastMessage && (
                <Toast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    onClose={() => setToastMessage(null)}
                />
            )}

            {/* Header */}
            <Header onSearchChange={() => { }} />

            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: t('navigation.home'), path: '/' },
                    { label: t('navigation.orderTracking') || 'Tra cứu đơn hàng' },
                ]}
            />

            {/* Main Content */}
            <div className="flex-1">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            {t('navigation.orderTracking') || 'Tra cứu đơn hàng'}
                        </h1>
                        <p className="text-gray-600">
                            {'Nhập số điện thoại để tra cứu thông tin đơn hàng của bạn'}
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    {'Số điện thoại'}
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={'0123456789'}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results Section */}
                    {hasSearched && (
                        <>
                            {isLoading && (
                                <div className="flex justify-center items-center py-16">
                                    <div className="text-center">
                                        <div className="inline-block">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                        <p className="mt-4 text-gray-600">{'Đang tìm kiếm...'}</p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && orders.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                                    <svg
                                        className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {'Không tìm thấy đơn hàng'}
                                    </h3>
                                    <p className="text-gray-600 mt-2">
                                        {'Vui lòng kiểm tra lại số điện thoại và thử lại'}
                                    </p>
                                </div>
                            )}

                            {!isLoading && orders.length > 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {`Tìm thấy ${orders.length} đơn hàng`}
                                    </h2>

                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                            {/* Order Header */}
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">{'Mã đơn hàng'}</p>
                                                        <p className="text-xl font-bold text-gray-900">{order.orderCode || order.id}</p>
                                                    </div>
                                                    <div className="md:text-right">
                                                        <p className="text-sm text-gray-600">{'Ngày đặt'}</p>
                                                        <p className="text-lg font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Details */}
                                            <div className="p-6 border-b border-gray-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                            {'Thông tin khách hàng'}
                                                        </h4>
                                                        <div className="space-y-1 text-gray-700">
                                                            <p><span className="font-medium">{'Tên khách hàng:'}</span> {order.customerName}</p>
                                                            <p><span className="font-medium">{'Số điện thoại:'}</span> {order.phone}</p>
                                                            <p><span className="font-medium">{'Email:'}</span> {order.email}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                            {'Trạng thái đơn hàng'}
                                                        </h4>
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                            <p className="text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="p-6">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                                                    {'Chi tiết sản phẩm'}
                                                </h4>
                                                <div className="space-y-4">
                                                    {order.orderItems && order.orderItems.length > 0 ? (
                                                        order.orderItems.map((item, idx) => (
                                                            <div key={idx} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                                                                {/* Product Image */}
                                                                {item.imageUrl && (
                                                                    <div className="flex-shrink-0 w-20 h-20">
                                                                        <img
                                                                            src={item.imageUrl}
                                                                            alt={item.productName}
                                                                            className="w-full h-full object-cover rounded-lg"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {/* Product Details */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-gray-900 mb-1">{item.productName}</p>
                                                                    <div className="text-sm text-gray-600 space-y-1">
                                                                        <p>{'Số lượng'}: <span className="font-medium">{item.quantity}</span></p>
                                                                        {item.color && (
                                                                            <p>{'Màu sắc'}: <span className="font-medium">{item.color}</span></p>
                                                                        )}
                                                                        {item.rom && (
                                                                            <p>{'Bộ nhớ'}: <span className="font-medium">{item.rom}</span></p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Price */}
                                                                <div className="text-right flex-shrink-0">
                                                                    <p className="text-sm text-gray-600 mb-1">{'Giá'}</p>
                                                                    <p className="font-semibold text-gray-900 mb-2">{formatPrice(item.priceAtPurchase)}</p>

                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500">{'Không có sản phẩm'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Help Text */}
                    {!hasSearched && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                            <svg
                                className="w-8 h-8 text-blue-600 mx-auto mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-blue-800">
                                {'Nhập số điện thoại liên quan đến đơn hàng để xem chi tiết'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};
