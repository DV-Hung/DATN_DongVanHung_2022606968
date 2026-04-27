// Variant Type
export interface Variant {
  id: string;
  sku: string;
  color?: string;
  storage?: string;
  attributes: Record<string, string>;
  retailPrice: number;
  costPrice?: number;
  initialStock: number;
  currentStock: number;
  image?: string;
  isActive: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  baseSku?: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  badge?: 'NEW ARRIVAL' | 'BEST SELLER' | 'SALE';
  rating?: number;
  reviews?: number;
  brand: string;
  processor?: string;
  memory?: string;
  storage?: string;
  display?: string;
  inStock: boolean;
  variants?: Variant[];
}

// Filter Types
export interface ProductFilter {
  brand?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  processor?: string[];
  memory?: string[];
  category?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation Types
export interface NavLink {
  label: string;
  path: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  path: string;
}
