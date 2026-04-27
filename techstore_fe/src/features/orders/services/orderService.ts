import { apiClient } from '../../../services/api';

export interface OrderItem {
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

export interface Order {
    id: number;
    orderCode: string;
    userId: number;
    customerName: string;
    phone: string;
    email: string;
    shippingAddress: string;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';
    shippingMethod?: string;
    paymentMethod?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItem[];
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

class OrderService {
    /**
     * Lấy danh sách đơn hàng của người dùng
     */
    async getUserOrders(
        userId: number,
        page: number = 0,
        size: number = 10
    ): Promise<{
        content: Order[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
    }> {
        try {
            const response = await apiClient.get<ApiResponse<any>>(
                `/orders/user/${userId}`,
                {
                    params: { page, size },
                }
            );

            const pageData = response.data.data;
            return {
                content: pageData.content,
                totalElements: pageData.totalElements,
                totalPages: pageData.totalPages,
                currentPage: pageData.number,
            };
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw error;
        }
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    async getOrderById(orderId: number): Promise<Order> {
        try {
            const response = await apiClient.get<ApiResponse<Order>>(
                `/orders/${orderId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    /**
     * Hủy đơn hàng
     */
    async cancelOrder(orderId: number): Promise<Order> {
        try {
            const response = await apiClient.put<ApiResponse<Order>>(
                `/orders/${orderId}/status`,
                {},
                {
                    params: { status: 'CANCELLED' },
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    async updateOrderStatus(
        orderId: number,
        status: string
    ): Promise<Order> {
        try {
            const response = await apiClient.put<ApiResponse<Order>>(
                `/orders/${orderId}/status`,
                {},
                {
                    params: { status },
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
}

export const orderService = new OrderService();
