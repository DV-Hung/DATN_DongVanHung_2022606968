import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../services/api';

export interface InventoryInflowItem {
  variantId: string | number;
  productName: string;
  color: string;
  rom: string;
  quantity: number;
  importPrice: number;
}

export interface InventoryInflowBatch {
  id: string | number;
  supplierId: string | number;
  supplierName: string;
  importDate: string;
  totalCost: number;
  items: InventoryInflowItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface ImportDetailDTO {
  variantId: string | number;
  quantity: number;
  importPrice: number;
}

interface ImportOrderRequestDTO {
  supplierId: string | number;
  importDetails: ImportDetailDTO[];
  // Note: totalCost and importDate are optional and handled by backend
  // totalCost?: number;  // Can be calculated by backend
  // importDate?: string; // Auto-set by backend @PrePersist
}

interface ImportOrderResponseDTO {
  id: string | number;
  supplierId: string | number;
  supplierName: string;
  importDetails: Array<ImportDetailDTO & { id: string | number; productName: string; color: string; rom: string }>;
  totalCost: number;
  importDate: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to transform ImportOrderResponseDTO to InventoryInflowBatch
const transformToInventoryInflowBatch = (dto: ImportOrderResponseDTO): InventoryInflowBatch => {
  return {
    id: dto.id,
    supplierId: dto.supplierId,
    supplierName: dto.supplierName || '',
    importDate: dto.importDate || new Date().toISOString(),
    totalCost: typeof dto.totalCost === 'string' ? parseFloat(dto.totalCost as any) : dto.totalCost,
    items: (dto.importDetails || []).map((detail: any) => ({
      variantId: detail.variantId,
      productName: detail.productName || '',
      color: detail.color || '',
      rom: detail.rom || '',
      quantity: detail.quantity,
      importPrice: typeof detail.importPrice === 'string' ? parseFloat(detail.importPrice as any) : detail.importPrice,
    })),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

export const useAdminInventoryInflow = () => {
  const [batches, setBatches] = useState<InventoryInflowBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all import orders - Initialize as empty (no GET all endpoint in backend)
  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Backend does not have GET /import-orders endpoint, so initialize as empty
      // Users can filter by supplier using getBatchesBySupplier()
      setBatches([]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch import orders';
      setError(errorMessage);
      console.error('Failed to fetch import orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load batches on component mount
  // This now loads orders from all suppliers since there's no GET /import-orders endpoint
  useEffect(() => {
    const loadAllBatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all suppliers first
        const suppliersResponse = await apiClient.getAllSuppliers();
        const suppliersData = suppliersResponse.data?.data || suppliersResponse.data || [];
        const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

        // Fetch orders for each supplier and combine
        const allBatches: InventoryInflowBatch[] = [];
        for (const supplier of suppliers) {
          try {
            const ordersResponse = await apiClient.getImportOrdersBySupplier(supplier.id);
            const ordersData = ordersResponse.data?.data || ordersResponse.data || [];
            const orders = Array.isArray(ordersData) ? ordersData : [];
            allBatches.push(...orders.map(transformToInventoryInflowBatch));
          } catch (err) {
            console.warn(`Failed to load orders for supplier ${supplier.id}:`, err);
          }
        }

        setBatches(allBatches);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch import orders';
        setError(errorMessage);
        console.error('Failed to load all batches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllBatches();
  }, []);

  // Get batch by ID
  const getBatchById = useCallback(
    async (id: string | number) => {
      setError(null);
      try {
        const response = await apiClient.getImportOrderById(id);
        const batchData = response.data?.data || response.data;
        return transformToInventoryInflowBatch(batchData);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch batch details';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Create new import order
  const createBatch = useCallback(
    async (batchData: InventoryInflowBatch) => {
      setError(null);
      try {
        const requestData: ImportOrderRequestDTO = {
          supplierId: batchData.supplierId,
          importDetails: batchData.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            importPrice: item.importPrice,
          })),
          // Note: importDate and totalCost are optional
          // importDate will be auto-set by backend (@PrePersist = LocalDateTime.now())
          // totalCost can be calculated by backend or included here
        };

        const response = await apiClient.createImportOrder(requestData);
        const responseData = response.data?.data || response.data;
        const newBatch = transformToInventoryInflowBatch(responseData);
        setBatches([...batches, newBatch]);
        return newBatch;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to create import order';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [batches]
  );

  // Get import orders by supplier
  const getBatchesBySupplier = useCallback(
    async (supplierId: string | number) => {
      setError(null);
      try {
        const response = await apiClient.getImportOrdersBySupplier(supplierId);
        const batchData = response.data as ApiResponse<ImportOrderResponseDTO[]>;

        if (batchData.data && Array.isArray(batchData.data)) {
          return batchData.data.map(transformToInventoryInflowBatch);
        } else if (Array.isArray(batchData)) {
          return batchData.map(transformToInventoryInflowBatch);
        }
        return [];
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch batches by supplier';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    batches,
    isLoading,
    error,
    createBatch,
    getBatchById,
    getBatchesBySupplier,
    fetchBatches,
  };
};
