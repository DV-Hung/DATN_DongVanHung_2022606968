import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class APIClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          // LẤY ĐƯỜNG DẪN HIỆN TẠI
          const currentPath = window.location.pathname;

          // CHỈ CHUYỂN HƯỚNG NẾU KHÔNG PHẢI ĐANG Ở TRANG LOGIN
          if (currentPath !== '/login' && currentPath !== '/auth/login') {
            window.location.href = '/login';
          }
        }

        // Log error details for debugging
        if (error.response?.status === 500) {
          console.error('Server error (500):', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  // Product endpoints
  getProducts(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
  }) {
    return this.instance.get('/products', { params });
  }

  getProductById(id: string | number) {
    return this.instance.get(`/products/${id}`);
  }

  getAllProducts() {
    return this.instance.get('/products/all');
  }

  createProduct(productData: any) {
    return this.instance.post('/products', productData);
  }

  updateProduct(id: string | number, productData: any) {
    return this.instance.put(`/products/${id}`, productData);
  }

  deleteProduct(id: string | number) {
    return this.instance.delete(`/products/${id}`);
  }

  searchProductsByName(name: string, params?: { page?: number; size?: number }) {
    return this.instance.get('/products/search', { params: { name, ...params } });
  }

  getProductsByCategory(categoryId: string | number, params?: { page?: number; size?: number }) {
    return this.instance.get(`/products/category/${categoryId}`, { params });
  }

  getProductsByBrand(brandId: string | number, params?: { page?: number; size?: number }) {
    return this.instance.get(`/products/brand/${brandId}`, { params });
  }

  // Brand endpoints
  getAllBrands() {
    return this.instance.get('/brands');
  }

  getBrandById(id: string | number) {
    return this.instance.get(`/brands/${id}`);
  }

  createBrand(brandData: any) {
    return this.instance.post('/brands', brandData);
  }

  updateBrand(id: string | number, brandData: any) {
    return this.instance.put(`/brands/${id}`, brandData);
  }

  deleteBrand(id: string | number) {
    return this.instance.delete(`/brands/${id}`);
  }

  // Category endpoints
  getCategories() {
    return this.instance.get('/categories');
  }

  // Search endpoint
  searchProducts(query: string) {
    return this.instance.get('/search', { params: { q: query } });
  }

  // Cart endpoints
  addToCart(userId: number | string, variantId: number | string, quantity: number = 1) {
    return this.instance.post('/cart/add', null, {
      params: { userId, variantId, quantity }
    });
  }

  getCart(userId: number | string) {
    return this.instance.get(`/cart/user/${userId}`);
  }

  getCartItem(cartItemId: number | string) {
    return this.instance.get(`/cart/${cartItemId}`);
  }

  updateCartItem(cartItemId: number | string, quantity: number) {
    return this.instance.put(`/cart/${cartItemId}`, null, {
      params: { quantity }
    });
  }

  removeFromCart(cartItemId: number | string) {
    return this.instance.delete(`/cart/${cartItemId}`);
  }

  clearCart(userId: number | string) {
    return this.instance.delete(`/cart/user/${userId}`);
  }

  getCartSummary(userId: number | string) {
    return this.instance.get(`/cart/user/${userId}/summary`);
  }

  // Order endpoints
  createOrder(data: any, userId?: string | number) {
    return this.instance.post('/orders', data, { params: userId ? { userId } : {} });
  }

  getOrders() {
    return this.instance.get('/orders');
  }

  getOrderById(id: string) {
    return this.instance.get(`/orders/${id}`);
  }

  searchOrdersByPhoneNumber(phoneNumber: string, page: number = 0, size: number = 10) {
    return this.instance.get('/orders/search/phone', { params: { phoneNumber, page, size } });
  }

  // Supplier endpoints
  getAllSuppliers() {
    return this.instance.get('/suppliers');
  }

  getSupplierById(id: string | number) {
    return this.instance.get(`/suppliers/${id}`);
  }

  createSupplier(supplierData: any) {
    return this.instance.post('/suppliers', supplierData);
  }

  updateSupplier(id: string | number, supplierData: any) {
    return this.instance.put(`/suppliers/${id}`, supplierData);
  }

  deleteSupplier(id: string | number) {
    return this.instance.delete(`/suppliers/${id}`);
  }

  // Inventory Inflow endpoints (DEPRECATED - use Import Order endpoints instead)
  // getAllInventoryInflowBatches() - NOT AVAILABLE IN BACKEND
  // Use getImportOrdersBySupplier() or getImportOrdersByUser() instead

  // Import Order endpoints
  createImportOrder(importData: any) {
    return this.instance.post('/import-orders', importData);
  }

  getImportOrderById(id: string | number) {
    return this.instance.get(`/import-orders/${id}`);
  }

  getImportOrdersBySupplier(supplierId: string | number) {
    return this.instance.get(`/import-orders/supplier/${supplierId}`);
  }

  getImportOrdersByUser(userId: string | number) {
    return this.instance.get(`/import-orders/user/${userId}`);
  }

  // Product Variant endpoints
  getVariantById(id: string | number) {
    return this.instance.get(`/product-variants/${id}`);
  }

  getVariantsByProductId(productId: string | number) {
    return this.instance.get(`/product-variants/product/${productId}`);
  }

  getAvailableVariantsByProductId(productId: string | number) {
    return this.instance.get(`/product-variants/product/${productId}/available`);
  }

  createVariant(variantData: any) {
    return this.instance.post('/product-variants', variantData);
  }

  updateVariant(id: string | number, variantData: any) {
    return this.instance.put(`/product-variants/${id}`, variantData);
  }

  deleteVariant(id: string | number) {
    return this.instance.delete(`/product-variants/${id}`);
  }

  updateVariantStock(id: string | number, quantity: number) {
    return this.instance.patch(`/product-variants/${id}/stock`, null, { params: { quantity } });
  }

  // User endpoints
  login(email: string, password: string) {
    return this.instance.post('/auth/login', { email, password });
  }

  register(userData: any) {
    return this.instance.post('/auth/register', userData);
  }

  getUserProfile() {
    return this.instance.get('/users/profile');
  }

  updateUserProfile(userData: any) {
    return this.instance.put('/users/profile', userData);
  }

  getAllUsers() {
    return this.instance.get('/users/all');
  }

  getUsers(params?: { page?: number; size?: number }) {
    return this.instance.get('/users', { params });
  }

  // File upload endpoints
  uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    // Use axios directly without Content-Type to let browser set multipart/form-data
    return axios.post(
      `${API_BASE_URL}/files/upload/product`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
          // Do NOT set Content-Type - let axios auto-detect for multipart
        },
      }
    );
  }

  deleteImage(publicId: string) {
    return this.instance.delete(`/files/${publicId}`);
  }

  // Dashboard endpoints
  getDashboardStatsByYear(year: number) {
    return this.instance.get(`/dashboard/stats/${year}`);
  }

  getAvailableYears() {
    return this.instance.get('/dashboard/available-years');
  }

  // Generic methods for flexible API calls
  get<T = any>(url: string, config?: any) {
    return this.instance.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.instance.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.instance.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.instance.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: any) {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();
