import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface UserDetail {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'moderator' | 'customer' | 'support';
    status: 'active' | 'inactive' | 'suspended';
    joinDate: string;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export const useUserDetail = (userId: string | number) => {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch single user by ID
    const fetchUserDetail = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiClient.get(`/users/${userId}`);
            const userData = result.data?.data || result.data;

            if (userData) {
                const mappedUser: UserDetail = {
                    id: userData.id,
                    name: userData.fullName || userData.name || 'Unknown',
                    email: userData.email,
                    phone: userData.phone || 'N/A',
                    role: userData.role?.toLowerCase() || 'customer',
                    status: userData.status?.toLowerCase() || 'active',
                    joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('vi-VN') : 'N/A',
                };

                setUser(mappedUser);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch user detail';
            setError(errorMessage);
            console.error('Error fetching user detail:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchUserDetail();
        }
    }, [userId, fetchUserDetail]);

    // Update user status
    const updateUserStatus = useCallback(async (status: string) => {
        try {
            await apiClient.put(`/users/${userId}`, { status });
            if (user) {
                setUser({ ...user, status: status as any });
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update user status';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, [userId, user]);

    return {
        user,
        isLoading,
        error,
        fetchUserDetail,
        updateUserStatus,
    };
};
