import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface ProductVariant {
    id: string | number;
    color: string;
    rom: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    productId: string | number;
    productName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

interface VariantDTO {
    id?: string | number;
    color: string;
    rom: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    productId: string | number;
}

// Helper function to transform backend VariantDTO to ProductVariant
const transformToProductVariant = (dto: any): ProductVariant => {
    return {
        id: dto.id,
        color: dto.color || '',
        rom: dto.rom || '',
        price: typeof dto.price === 'string' ? parseFloat(dto.price) : dto.price,
        stockQuantity: dto.stockQuantity || 0,
        imageUrl: dto.imageUrl,
        productId: dto.productId,
        productName: dto.productName,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
    };
};

// Helper function to calculate total stock from all variants
const calculateTotalStock = (variantList: ProductVariant[]): number => {
    return variantList.reduce((sum, variant) => sum + variant.stockQuantity, 0);
};

// Helper function to get count of variants with stock > 0
const calculateActiveVariants = (variantList: ProductVariant[]): number => {
    return variantList.filter((v) => v.stockQuantity > 0).length;
};

// Helper function to get variant with lowest stock
const getLowestStockVariant = (variantList: ProductVariant[]): ProductVariant | null => {
    if (variantList.length === 0) return null;
    return variantList.reduce((lowest, current) =>
        current.stockQuantity < lowest.stockQuantity ? current : lowest
    );
};

export const useAdminProductVariants = (productId: string | number) => {
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalStock, setTotalStock] = useState<number>(0);

    // Fetch all variants for a product
    const fetchVariants = useCallback(async () => {
        if (!productId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.getVariantsByProductId(productId);
            const variantData = response.data as ApiResponse<any[]>;

            if (variantData.data && Array.isArray(variantData.data)) {
                setVariants(variantData.data.map(transformToProductVariant));
            } else if (Array.isArray(variantData)) {
                setVariants(variantData.map(transformToProductVariant));
            } else {
                setVariants([]);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch variants';
            setError(errorMessage);
            console.error('Failed to fetch variants:', err);
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    // Load variants on mount or when productId changes
    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    // Update total stock whenever variants change
    useEffect(() => {
        const newTotalStock = calculateTotalStock(variants);
        setTotalStock(newTotalStock);
    }, [variants]);

    // Get variant by ID
    const getVariantById = useCallback(
        async (id: string | number) => {
            setError(null);
            try {
                const response = await apiClient.getVariantById(id);
                const variantData = response.data?.data || response.data;
                return transformToProductVariant(variantData);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch variant';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        []
    );

    // Create new variant
    const createVariant = useCallback(
        async (variantData: Omit<ProductVariant, 'id'>) => {
            setError(null);
            try {
                const requestData: VariantDTO = {
                    color: variantData.color,
                    rom: variantData.rom,
                    price: variantData.price,
                    stockQuantity: variantData.stockQuantity,
                    imageUrl: variantData.imageUrl,
                    productId: variantData.productId,
                };

                const response = await apiClient.createVariant(requestData);
                const responseData = response.data?.data || response.data;
                const newVariant = transformToProductVariant(responseData);
                setVariants([...variants, newVariant]);
                return newVariant;
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to create variant';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [variants]
    );

    // Update variant
    const updateVariant = useCallback(
        async (id: string | number, variantData: Omit<ProductVariant, 'id'>) => {
            setError(null);
            try {
                const requestData: VariantDTO = {
                    color: variantData.color,
                    rom: variantData.rom,
                    price: variantData.price,
                    stockQuantity: variantData.stockQuantity,
                    imageUrl: variantData.imageUrl,
                    productId: variantData.productId,
                };

                const response = await apiClient.updateVariant(id, requestData);
                const responseData = response.data?.data || response.data;
                const updatedVariant = transformToProductVariant(responseData);
                setVariants(variants.map((v) => (v.id === id ? updatedVariant : v)));
                return updatedVariant;
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to update variant';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [variants]
    );

    // Delete variant
    const deleteVariant = useCallback(
        async (id: string | number) => {
            setError(null);
            try {
                await apiClient.deleteVariant(id);
                setVariants(variants.filter((v) => v.id !== id));
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to delete variant';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [variants]
    );

    // Update variant stock
    const updateStock = useCallback(
        async (id: string | number, quantity: number) => {
            setError(null);
            try {
                const response = await apiClient.updateVariantStock(id, quantity);
                const responseData = response.data?.data || response.data;
                const updatedVariant = transformToProductVariant(responseData);
                const updatedVariants = variants.map((v) => (v.id === id ? updatedVariant : v));
                setVariants(updatedVariants);
                // Total stock will be automatically recalculated by useEffect
                return updatedVariant;
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to update stock';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [variants]
    );

    return {
        variants,
        isLoading,
        error,
        totalStock,
        activeVariantsCount: calculateActiveVariants(variants),
        lowestStockVariant: getLowestStockVariant(variants),
        createVariant,
        updateVariant,
        deleteVariant,
        updateStock,
        getVariantById,
        fetchVariants,
        calculateTotalStock,
    };
};
