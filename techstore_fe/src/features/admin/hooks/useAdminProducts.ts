import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface AdminProduct {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

export const useAdminProducts = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productResponse, categoryResponse, brandResponse] = await Promise.all([
        apiClient.getAllProducts(),
        apiClient.getCategories(),
        apiClient.getAllBrands(),
      ]);
      
      const productData = productResponse.data as ApiResponse<any>;
      const categories = categoryResponse.data?.data || [];
      const brands = brandResponse.data?.data || [];
      
      // Create maps for quick lookup
      const categoryMap = new Map(
        (categories as Category[]).map(c => [c.id, c.name])
      );
      const brandMap = new Map(
        (brands as Brand[]).map(b => [b.id, b.name])
      );
      
      if (productData.data && Array.isArray(productData.data)) {
        // Transform API response to AdminProduct format
        const transformedProducts: AdminProduct[] = productData.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku || '',
          category: item.categoryName || categoryMap.get(item.categoryId) || '',
          brand: item.brandName || brandMap.get(item.brandId) || '',
          price: item.price || 0,
          stock: item.totalStock || item.stock || 0,
          image: item.image || '🟩',
          description: item.description || '',
        }));
        setProducts(transformedProducts);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new product
  const createProduct = useCallback(async (productData: Omit<AdminProduct, 'id'>) => {
    setError(null);
    try {
      const response = await apiClient.createProduct(productData);
      const data = response.data as ApiResponse<any>;
      
      // Transform API response to AdminProduct format
      const newProduct: AdminProduct = {
        id: data.data.id,
        name: data.data.name,
        sku: data.data.sku || '',
        category: data.data.categoryName || '',
        brand: data.data.brandName || '',
        price: data.data.price || 0,
        stock: data.data.totalStock || data.data.stock || 0,
        image: data.data.image || '🟩',
        description: data.data.description || '',
      };
      
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      setError(errorMessage);
      console.error('Error creating product:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Update a product
  const updateProduct = useCallback(async (id: string | number, productData: Partial<AdminProduct>) => {
    setError(null);
    try {
      const response = await apiClient.updateProduct(id, productData);
      const data = response.data as ApiResponse<any>;
      
      // Transform API response to AdminProduct format
      const updatedProduct: AdminProduct = {
        id: data.data.id,
        name: data.data.name,
        sku: data.data.sku || '',
        category: data.data.categoryName || '',
        brand: data.data.brandName || '',
        price: data.data.price || 0,
        stock: data.data.totalStock || data.data.stock || 0,
        image: data.data.image || '🟩',
        description: data.data.description || '',
      };
      
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updatedProduct : product))
      );
      return updatedProduct;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update product';
      setError(errorMessage);
      console.error('Error updating product:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete a product
  const deleteProduct = useCallback(async (id: string | number) => {
    setError(null);
    try {
      await apiClient.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      setError(errorMessage);
      console.error('Error deleting product:', err);
      throw new Error(errorMessage);
    }
  }, []);

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
