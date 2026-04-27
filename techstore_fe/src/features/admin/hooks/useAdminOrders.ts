import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface AdminOrder {
  id: string;
  date: string;
  customerName: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
  items: number;
  email?: string;
  phone?: string;
  shippingAddress?: string;
  orderItems?: Array<{
    id?: string;
    variantId?: string;
    productName?: string;
    quantity?: number;
    priceAtPurchase?: number;
    color?: string;
    rom?: string;
    imageUrl?: string;
  }>;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.instance.get('/orders');
      const data = result.data?.data || result.data || {};

      // Extract orders from page data
      const orderList = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);

      const mappedOrders: AdminOrder[] = orderList.map((order: any) => ({
        id: order.id || `#${order.id}`,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
        customerName: order.user?.fullName || order.customerName || 'Unknown',
        totalAmount: order.totalAmount || 0,
        paymentMethod: order.paymentMethod || 'Unknown',
        status: (order.status || 'PENDING') as any,
        items: order.orderItems?.length || order.items?.length || 0,
        email: order.email || 'Unknown',
        phone: order.phone || 'Unknown',
        shippingAddress: order.shippingAddress || 'Unknown',
        orderItems: order.orderItems?.map((item: any) => ({
          id: item.id,
          variantId: item.variantId,
          productName: item.productName,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
          color: item.color,
          rom: item.rom,
          imageUrl: item.imageUrl,
        })) || [],
      }));

      setOrders(mappedOrders);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
      setError(errorMessage);
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      await apiClient.instance.put(`/orders/${orderId}/status`, null, { params: { status } });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [orders]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      await apiClient.instance.put(`/orders/${orderId}/cancel`);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [orders]);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      await apiClient.instance.delete(`/orders/${orderId}`);
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [orders]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
  };
};
