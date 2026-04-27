import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface Brand {
  id: string | number;
  name: string;
  description?: string;
  logo?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all brands
  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllBrands();
      const data = response.data as ApiResponse<Brand[]>;
      if (data.data && Array.isArray(data.data)) {
        setBrands(data.data);
      } else {
        setBrands([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch brands';
      setError(errorMessage);
      console.error('Error fetching brands:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new brand
  const createBrand = useCallback(async (brandData: Omit<Brand, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.createBrand(brandData);
      const data = response.data as ApiResponse<Brand>;
      setBrands((prev) => [...prev, data.data]);
      return data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create brand';
      setError(errorMessage);
      console.error('Error creating brand:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a brand
  const updateBrand = useCallback(async (id: string | number, brandData: Partial<Brand>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.updateBrand(id, brandData);
      const data = response.data as ApiResponse<Brand>;
      setBrands((prev) =>
        prev.map((brand) => (brand.id === id ? data.data : brand))
      );
      return data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update brand';
      setError(errorMessage);
      console.error('Error updating brand:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a brand
  const deleteBrand = useCallback(async (id: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.deleteBrand(id);
      setBrands((prev) => prev.filter((brand) => brand.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete brand';
      setError(errorMessage);
      console.error('Error deleting brand:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load brands on component mount
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};
