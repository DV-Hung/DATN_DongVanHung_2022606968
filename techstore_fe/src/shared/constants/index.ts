import { NavLink, Category } from '../types';

// Navigation - translation keys will be used in components
export const MAIN_NAV_LINKS: NavLink[] = [
  { label: 'navigation.laptops', path: '/products/laptops' },
  { label: 'navigation.mobile', path: '/products/mobile' },
  { label: 'navigation.accessories', path: '/products/accessories' },
  { label: 'navigation.orderTracking', path: '/order-tracking' },
];

// Product Categories - translation keys will be used in components
export const PRODUCT_CATEGORIES: Category[] = [
  { id: 'laptops', name: 'navigation.laptops', path: '/products/laptops' },
  { id: 'mobile', name: 'navigation.mobile', path: '/products/mobile' },
  { id: 'accessories', name: 'navigation.accessories', path: '/products/accessories' },
];

// Filter Options
export const BRAND_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'asus', label: 'ASUS' },
  { value: 'dell', label: 'Dell' },
  { value: 'hp', label: 'HP' },
  { value: 'lenovo', label: 'Lenovo' },
];

export const PROCESSOR_OPTIONS = [
  { value: 'intel-core-i9', label: 'Intel Core i9' },
  { value: 'intel-core-i7', label: 'Intel Core i7' },
  { value: 'apple-m3', label: 'Apple M3 Pro' },
  { value: 'amd-ryzen-9', label: 'AMD Ryzen 9' },
];

export const MEMORY_OPTIONS = [
  { value: '16gb', label: '16GB' },
  { value: '32gb', label: '32GB' },
  { value: '64gb', label: '64GB' },
  { value: '128gb', label: '128GB' },
];

export const PRICE_RANGES = {
  min: 500,
  max: 5000,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  FILTERS: '/api/filters',
};
