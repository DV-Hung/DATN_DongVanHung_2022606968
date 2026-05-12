import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface AdminSupplier {
  id: string | number;
  name: string;
  contactDetails?: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive';
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface SupplierDTO {
  id: string | number;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  isActive: boolean;
}

// Helper function to transform SupplierDTO to AdminSupplier
const transformToAdminSupplier = (dto: SupplierDTO): AdminSupplier => {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone || '',
    address: dto.address || '',
    contactDetails: [dto.phone, dto.address, dto.email].filter(Boolean).join(', ') || '',
    status: dto.isActive ? 'Active' : 'Inactive',
  };
};

export const useAdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all suppliers
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supplierResponse = await apiClient.getAllSuppliers();

      const supplierData = supplierResponse.data as ApiResponse<SupplierDTO[]>;

      if (supplierData.data && Array.isArray(supplierData.data)) {
        setSuppliers(supplierData.data.map(transformToAdminSupplier));
      } else if (Array.isArray(supplierData)) {
        setSuppliers(supplierData.map(transformToAdminSupplier));
      } else {
        setSuppliers([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch suppliers';
      setError(errorMessage);
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Create new supplier
  const createSupplier = useCallback(
    async (supplierData: Omit<AdminSupplier, 'id'>) => {
      setError(null);
      try {
        const response = await apiClient.createSupplier({
          name: supplierData.name,
          phone: supplierData.phone || '',
          address: supplierData.address || '',
          isActive: supplierData.status === 'Active',
        });

        const responseData = response.data?.data || response.data;
        const newSupplier = transformToAdminSupplier(responseData);
        setSuppliers([...suppliers, newSupplier]);
        return newSupplier;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create supplier';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [suppliers]
  );

  // Update supplier
  const updateSupplier = useCallback(
    async (id: string | number, supplierData: Omit<AdminSupplier, 'id'>) => {
      setError(null);
      try {
        const response = await apiClient.updateSupplier(id, {
          name: supplierData.name,
          phone: supplierData.phone || '',
          address: supplierData.address || '',
          isActive: supplierData.status === 'Active',
        });

        const responseData = response.data?.data || response.data;
        const updatedSupplier = transformToAdminSupplier(responseData);
        setSuppliers(suppliers.map((s) => (s.id === id ? updatedSupplier : s)));
        return updatedSupplier;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to update supplier';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [suppliers]
  );

  // Delete supplier
  const deleteSupplier = useCallback(
    async (id: string | number) => {
      setError(null);
      try {
        await apiClient.deleteSupplier(id);
        setSuppliers(suppliers.filter((s) => s.id !== id));
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete supplier';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [suppliers]
  );

  return {
    suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers,
  };
};
