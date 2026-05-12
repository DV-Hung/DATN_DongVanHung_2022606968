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


export const PRICE_RANGES = {
  min: 500,
  max: 5000,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  FILTERS: '/api/filters',
};
