import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header, Footer, Breadcrumb, Toast } from '../../../shared/components';
import { useAuth } from '../../../shared/hooks/useAuth';
import { orderService, Order } from '../services/orderService';
import { OrderCard } from '../components/OrderCard';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const pageSize = 10;

  // Fetch orders when component mounts or page changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders();
    }
  }, [isAuthenticated, user?.id, currentPage, selectedStatus]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await orderService.getUserOrders(user.id, currentPage, pageSize);

      let filteredOrders = response.content;
      if (selectedStatus !== 'ALL') {
        filteredOrders = response.content.filter(
          (order) => order.status === selectedStatus
        );
      }

      setOrders(filteredOrders);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToast({
        message: t('orders.errorFetchingOrders') || 'Lỗi khi tải danh sách đơn hàng',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!user?.id) return;

    try {
      setIsCancelling(true);
      await orderService.cancelOrder(orderId);

      setToast({
        message: 'Hủy đơn hàng thành công',
        type: 'success',
      });

      // Refresh orders
      await fetchOrders();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Lỗi khi hủy đơn hàng';
      setToast({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {'Vui lòng đăng nhập'}
            </h2>
            <p className="text-gray-600">
              {'Bạn cần đăng nhập để xem danh sách đơn hàng'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Đơn hàng của tôi', path: '/orders' },
          ]} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {'Đơn hàng của tôi'}
          </h1>
          <p className="text-gray-600">
            {'Tổng cộng'}:
            {' '}
            <span className="font-semibold text-gray-900">{totalElements}</span>
            {' '}
            {'đơn hàng'}
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedStatus(option.value);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${selectedStatus === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{'Đang tải...'}</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {'Chưa có đơn hàng'}
              </h3>
              <p className="text-gray-600 mb-6">
                {'Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!'}
              </p>
              <a
                href="/"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {'Tiếp tục mua sắm'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Orders List */}
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancelOrder={handleCancelOrder}
                isLoading={isCancelling}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {'Trước'}
                </button>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`px-3 py-2 rounded-lg transition ${currentPage === index
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {'Tiếp'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
