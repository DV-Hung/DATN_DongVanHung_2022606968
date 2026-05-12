import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface UserOrder {
    id: number;
    orderCode: string;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    items: OrderItem[];
    shippingAddress?: string;
    phoneNumber?: string;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

interface PageableResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
}

export const useUserOrders = (userId: number) => {
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
    });

    // Fetch user orders
    const fetchUserOrders = useCallback(async (page: number = 0, size: number = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ApiResponse<PageableResponse<any>>>(
                `/orders/user/${userId}?page=${page}&size=${size}`
            );

            const pageData = response.data?.data as PageableResponse<any>;

            if (pageData && Array.isArray(pageData.content)) {
                const mappedOrders: UserOrder[] = pageData.content.map((order: any) => ({
                    id: order.id,
                    orderCode: order.orderCode || `ORD-${order.id}`,
                    totalPrice: Number(order.totalAmount) || Number(order.totalPrice) || 0,
                    status: order.status?.toUpperCase() || 'PENDING',
                    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A',
                    items: Array.isArray(order.orderItems) ? order.orderItems.map((item: any) => ({
                        id: item.id,
                        productName: item.productName,
                        quantity: item.quantity,
                        price: Number(item.priceAtPurchase) || Number(item.price) || 0,
                        subtotal: Number(item.subtotal) || (Number(item.priceAtPurchase || item.price || 0) * item.quantity) || 0,
                    })) : [],
                    shippingAddress: order.shippingAddress || 'N/A',
                    phoneNumber: order.phone || order.phoneNumber || 'N/A',
                }));

                setOrders(mappedOrders);
                setPagination({
                    page: pageData.currentPage || pageData.number || 0,
                    size: pageData.size || size,
                    totalElements: pageData.totalElements || 0,
                    totalPages: pageData.totalPages || 0,
                });
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
            setError(errorMessage);
            console.error('Error fetching user orders:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        fetchUserOrders(pagination.page, pagination.size);
    }, [userId]);

    // Load next page
    const loadNextPage = useCallback(() => {
        const nextPage = pagination.page + 1;
        if (nextPage < pagination.totalPages) {
            fetchUserOrders(nextPage, pagination.size);
        }
    }, [pagination, fetchUserOrders]);

    // Load previous page
    const loadPreviousPage = useCallback(() => {
        const prevPage = pagination.page - 1;
        if (prevPage >= 0) {
            fetchUserOrders(prevPage, pagination.size);
        }
    }, [pagination, fetchUserOrders]);

    return {
        orders,
        isLoading,
        error,
        pagination,
        fetchUserOrders,
        loadNextPage,
        loadPreviousPage,
    };
};
