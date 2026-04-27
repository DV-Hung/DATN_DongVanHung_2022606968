import { useState, useCallback } from 'react';
import { Product, ProductFilter, PaginationParams } from '../../shared/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const applyFilters = useCallback((filters: ProductFilter) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...products];

      // Apply brand filter
      if (filters.brand && filters.brand.length > 0) {
        filtered = filtered.filter((p) =>
          filters.brand!.includes(p.brand.toLowerCase())
        );
      }

      // Apply price filter
      if (filters.priceRange) {
        filtered = filtered.filter(
          (p) => p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
        );
      }

      // Apply processor filter
      if (filters.processor && filters.processor.length > 0) {
        filtered = filtered.filter((p) =>
          filters.processor!.some((proc) =>
            p.processor?.toLowerCase().includes(proc.toLowerCase())
          )
        );
      }

      // Apply memory filter
      if (filters.memory && filters.memory.length > 0) {
        filtered = filtered.filter((p) =>
          filters.memory!.some((mem) =>
            p.memory?.toLowerCase().includes(mem.toLowerCase())
          )
        );
      }

      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 300);
  }, [products]);

  const searchProducts = useCallback((query: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(results);
      setIsLoading(false);
    }, 300);
  }, [products]);

  return {
    products: filteredProducts,
    isLoading,
    applyFilters,
    searchProducts,
  };
};
