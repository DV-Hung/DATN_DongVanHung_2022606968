import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminProducts, type AdminProduct } from '../hooks';
import { apiClient } from '../../../services/api';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';

interface FormData extends Omit<AdminProduct, 'id'> {
  id?: string | number;
  categoryId?: number;
  brandId?: number;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

export const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProducts();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    category: '',
    brand: '',
    price: 0,
    stock: 0,
    image: '🟩',
    description: '',
    categoryId: undefined,
    brandId: undefined,
  });

  const [filters, setFilters] = useState({
    category: 'All Categories',
    brand: 'All Brands',
    status: 'All Statuses',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string | number;
    name: string;
  } | null>(null);

  // Fetch categories and brands from API on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getAllBrands(),
        ]);

        if (categoriesResponse.data?.data) {
          setCategories(categoriesResponse.data.data);
        }
        if (brandsResponse.data?.data) {
          setBrands(brandsResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories or brands:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const statuses = ['All Statuses', 'In Stock', 'Low Stock', 'Out of Stock'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch =
        filters.category === 'All Categories' || p.category === filters.category;
      const brandMatch =
        filters.brand === 'All Brands' || p.brand === filters.brand;
      const statusMatch =
        filters.status === 'All Statuses' ||
        (filters.status === 'In Stock' && p.stock > 0) ||
        (filters.status === 'Low Stock' && p.stock > 0 && p.stock < 20) ||
        (filters.status === 'Out of Stock' && p.stock === 0);
      return categoryMatch && brandMatch && statusMatch;
    });
  }, [products, filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / DEFAULT_PAGE_SIZE);

  // Get paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleOpenModal = (product?: AdminProduct) => {
    setFormError(null);
    if (product) {
      // Find categoryId and brandId based on names
      const categoryObj = categories.find(c => c.name === product.category);
      const brandObj = brands.find(b => b.name === product.brand);

      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        image: product.image,
        description: product.description || '',
        id: product.id,
        categoryId: categoryObj?.id,
        brandId: brandObj?.id,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        category: '',
        brand: '',
        price: 0,
        stock: 0,
        image: '🟩',
        description: '',
        categoryId: undefined,
        brandId: undefined,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('Tên sản phẩm là bắt buộc');
      return false;
    }
    if (!formData.sku.trim()) {
      setFormError('SKU là bắt buộc');
      return false;
    }
    if (!formData.categoryId) {
      setFormError('Danh mục là bắt buộc');
      return false;
    }
    if (!formData.brandId) {
      setFormError('Thương hiệu là bắt buộc');
      return false;
    }
    return true;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        image: formData.image,
        description: formData.description,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      handleCloseModal();
      setCurrentPage(1);
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu sản phẩm');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    setIsSaving(true);
    try {
      await deleteProduct(id);
      setDeleteConfirm(null);
      setCurrentPage(1);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Không thể xóa sản phẩm';
      setFormError(message);
      setDeleteConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600">⚠️</span>
          <div>
            <p className="font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý hàng hóa và mức hàng tồn.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          disabled={isLoading}
        >
          ➕ Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CATEGORY</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Categories">Tất cả Danh Mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">BRAND</label>
          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Brands">Tất Cả Thương Hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TRẠNG THÁI HÀNG TỒN</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Statuses">Tất Cả Trạng Thái</option>
            <option value="In Stock">Còn Hàng</option>
            <option value="Low Stock">Hàng Ít</option>
            <option value="Out of Stock">Hết Hàng</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !products.length && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      )}

      {/* Products Table */}
      {!isLoading || products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên Sản Phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    DANH MỤC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    GIÁ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    MỨC HÀNG TỒN
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {Math.round(product.price).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full ${product.stock > 50
                                ? 'bg-green-500'
                                : product.stock > 20
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                                }`}
                              style={{
                                width: `${Math.min((product.stock / 200) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/variants`)}
                            className="px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded"
                            title="Manage product variants"
                          >
                            📦 Biến Thể
                          </button>
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            ✎ Chỉnh Sửa
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                            disabled={isLoading}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      Không tìm thấy sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Summary */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển Thị {paginatedProducts.length > 0 ? (currentPage - 1) * DEFAULT_PAGE_SIZE + 1 : 0} - {Math.min(currentPage * DEFAULT_PAGE_SIZE, filteredProducts.length)} của {filteredProducts.length} sản phẩm
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${currentPage === page
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Sản Phẩm
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh Mục</label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => {
                    const catId = parseInt(e.target.value) || undefined;
                    const categoryObj = categories.find(c => c.id === catId);
                    handleInputChange('categoryId', catId);
                    if (categoryObj) {
                      handleInputChange('category', categoryObj.name);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thương Hiệu</label>
                <select
                  value={formData.brandId || ''}
                  onChange={(e) => {
                    const brandId = parseInt(e.target.value) || undefined;
                    const brandObj = brands.find(b => b.id === brandId);
                    handleInputChange('brandId', brandId);
                    if (brandObj) {
                      handleInputChange('brand', brandObj.name);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Mô tả sản phẩm"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Xóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm.id)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                >
                  {isSaving ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

