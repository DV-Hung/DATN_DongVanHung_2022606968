import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminProductVariants, type ProductVariant } from '../hooks';
import { apiClient } from '../../../services/api';

interface FormData extends Omit<ProductVariant, 'id'> {
  id?: string | number;
}

export const AdminProductVariants: React.FC = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    variants,
    isLoading,
    error,
    createVariant,
    updateVariant,
    deleteVariant,
    totalStock,
    activeVariantsCount,
    lowestStockVariant,
  } = useAdminProductVariants(productId || '');

  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('color');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string | number;
    color: string;
    rom: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    color: '',
    rom: '',
    price: 0,
    stockQuantity: 0,
    imageUrl: '',
    productId: parseInt(productId || '0'),
  });

  // Load product details
  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      setLoadingProduct(true);
      try {
        const response = await apiClient.getProductById(productId);
        const productData = response.data?.data || response.data;
        setCurrentProduct(productData);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddVariant = (_newVariant: FormData) => {
    setFormError(null);
    setShowForm(false);
    // The hook handles state updates automatically
  };

  const handleUpdateVariant = (_updatedVariant: FormData) => {
    setFormError(null);
    setShowForm(false);
    setEditingVariant(null);
  };

  const handleSaveVariant = async (variantData: FormData) => {
    if (!productId) {
      setFormError('ID sản phẩm là bắt buộc');
      return;
    }

    setIsSaving(true);
    try {
      const saveData: Omit<ProductVariant, 'id'> = {
        color: variantData.color,
        rom: variantData.rom,
        price: variantData.price,
        stockQuantity: variantData.stockQuantity,
        imageUrl: variantData.imageUrl,
        productId: parseInt(productId),
      };

      if (editingVariant) {
        await updateVariant(editingVariant.id, saveData);
        handleUpdateVariant(variantData);
      } else {
        await createVariant(saveData);
        handleAddVariant(variantData);
      }
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu biến thể');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      color: variant.color,
      rom: variant.rom,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      imageUrl: variant.imageUrl,
      productId: variant.productId,
    });
    setImagePreview(variant.imageUrl || null);
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormError('Vui lòng chọn một tập tin hình ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Kích thước hình ảnh phải nhỏ hơn 5MB');
      return;
    }

    setIsUploadingImage(true);
    setFormError(null);

    try {
      const response = await apiClient.uploadProductImage(file);
      const uploadedUrl = response.data?.data?.url || response.data?.secure_url;

      if (uploadedUrl) {
        setFormData({ ...formData, imageUrl: uploadedUrl });
        setImagePreview(uploadedUrl);
      } else {
        setFormError('Không thể lấy URL hình ảnh từ phản pháp tãi lên');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải lên hình ảnh';
      setFormError(errorMessage);
      console.error('Image upload error:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteVariant = async (variantId: string | number) => {
    setIsSaving(true);
    try {
      await deleteVariant(variantId);
      setDeleteConfirm(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể xóa biến thể');
      setDeleteConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVariant(null);
    setFormError(null);
    setImagePreview(null);
    setFormData({
      color: '',
      rom: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      productId: parseInt(productId || '0'),
    });
  };

  const handleOpenForm = () => {
    setEditingVariant(null);
    setImagePreview(null);
    setFormData({
      color: '',
      rom: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      productId: parseInt(productId || '0'),
    });
    setFormError(null);
    setShowForm(true);
  };

  // Filter and sort variants
  const filteredVariants = variants.filter((v) => {
    if (filterStatus === 'active') return v.stockQuantity > 0;
    if (filterStatus === 'inactive') return v.stockQuantity === 0;
    if (filterStatus === 'low-stock') return v.stockQuantity < 20 && v.stockQuantity > 0;
    return true;
  });

  const sortedVariants = [...filteredVariants].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'stock':
        return b.stockQuantity - a.stockQuantity;
      case 'color':
        return (a.color || '').localeCompare(b.color || '');
      default:
        return 0;
    }
  });

  return (
    <AdminLayout>
      {formError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600">⚠️</span>
          <div>
            <p className="font-medium text-red-900">Lỗi</p>
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-4xl">📱</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {loadingProduct ? 'Đang tải...' : (currentProduct?.name || 'Biến Thể Sản Phẩm')}
              </h1>
              {currentProduct && (
                <p className="text-sm text-gray-600 mt-1">
                  ID: <span className="font-medium">{currentProduct.id}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
        >
          ← Quay Lại Sản Phẩm
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Tổng Số Biến Thể</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{variants.length}</p>
          <p className="text-xs text-gray-500 mt-1">biến thể đã xác định</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Tổng Hàng Tồn</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalStock}</p>
          <p className="text-xs text-gray-500 mt-1">sản phẩm trong kho</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm font-medium">Có Sẵn Hàng</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activeVariantsCount}</p>
          <p className="text-xs text-gray-500 mt-1">biến thể khả dụng</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">Hàng Tồn Ít Nhất</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{lowestStockVariant?.stockQuantity || 0}</p>
          <p className="text-xs text-gray-500 mt-1">
            {lowestStockVariant?.color} / {lowestStockVariant?.rom}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">Sắp Xếp Theo</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="color">Màu Sắc</option>
              <option value="price-low">Giá: Thấp đến Cao</option>
              <option value="price-high">Giá: Cao đến Thấp</option>
              <option value="stock">MỨc Hàng Tồn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">Lọc</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất Cả Biến Thể</option>
              <option value="active">Có Sẵn Hàng</option>
              <option value="inactive">Hết Hàng</option>
              <option value="low-stock">Hàng Tồn Ít (&lt;20)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenForm}
          disabled={isLoading}
          className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium flex items-center justify-center gap-2 whitespace-nowrap disabled:bg-gray-400"
        >
          🆕 Thêm Biến Thể Mới
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !variants.length && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Đang tải biến thể...</p>
        </div>
      )}

      {/* Variants Table */}
      {!isLoading || variants.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Màu Sắc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Bộ Nhớ (ROM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hàng Tồn
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedVariants.length > 0 ? (
                  sortedVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{variant.color}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{variant.rom}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {Math.round(variant.price).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${variant.stockQuantity > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {variant.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditVariant(variant)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            ✎ Chỉnh Sửa
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: variant.id, color: variant.color, rom: variant.rom })}
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
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      Không tìm thấy biến thể
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {sortedVariants.length} của {variants.length} biến thể
            </p>
          </div>
        </div>
      ) : null}

      {/* Variant Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingVariant ? 'Chỉnh Sửa Biến Thể' : 'Thêm Biến Thể Mới'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu Sắc *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Xám Không Gian, Xanh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bộ Nhớ (ROM) *
                </label>
                <input
                  type="text"
                  value={formData.rom}
                  onChange={(e) => setFormData({ ...formData, rom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 256GB, 512GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (đ)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 15000000"
                  step="1000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Lượng Hàng Tồn
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 100"
                  step="1"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tải Lên Hình ảnh
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-blue-600">Đang tải lên...</span>
                    </div>
                  )}
                </div>
              </div>

              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xem Trước Hình ảnh
                  </label>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseForm}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveVariant(formData)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSaving || !formData.color || !formData.rom || formData.price < 0 || formData.stockQuantity < 0}
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
                Bạn có chắc chắn muốn xóa biến thể <strong>{deleteConfirm.color} / {deleteConfirm.rom}</strong>? Hành động này không thể hoàn tác.
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
                  onClick={() => handleDeleteVariant(deleteConfirm.id)}
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
