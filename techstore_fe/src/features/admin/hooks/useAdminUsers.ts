import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'moderator' | 'customer' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  orders: number;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.get('/users/all');
      const data = result.data?.data || result.data || [];

      const mappedUsers: AdminUser[] = Array.isArray(data) ? data.map((user: any) => ({
        id: user.id,
        name: user.fullName || user.name || 'Unknown',
        email: user.email,
        phone: user.phone || 'N/A',
        role: user.role?.toLowerCase() || 'customer',
        status: user.status?.toLowerCase() || 'active',
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A',
        orders: 0, // Would need additional API call
      })) : [];

      setUsers(mappedUsers);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update user role
  const updateUserRole = useCallback(async (userId: string | number, role: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { role });
      setUsers(users.map(u => u.id === userId ? { ...u, role: role as any } : u));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update user role';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [users]);



  // Update user status
  const updateUserStatus = useCallback(async (userId: string | number, status: string) => {
    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [users]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserRole,
    updateUserStatus,

  };
};
