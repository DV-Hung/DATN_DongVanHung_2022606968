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
      setFormError('Product ID is required');
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
      setFormError(err.message || 'Failed to save variant');
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
      setFormError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must be less than 5MB');
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
        setFormError('Failed to get image URL from upload response');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
      setFormError(errorMessage);
      console.error('Image upload error:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteVariant = (variantId: string | number) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      deleteVariant(variantId).catch((err) => {
        setFormError(err.message || 'Failed to delete variant');
      });
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
            <p className="font-medium text-red-900">Error</p>
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
                {loadingProduct ? 'Loading...' : (currentProduct?.name || 'Product Variants')}
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
          ← Back to Products
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total Variants</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{variants.length}</p>
          <p className="text-xs text-gray-500 mt-1">variants defined</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Total Stock</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalStock}</p>
          <p className="text-xs text-gray-500 mt-1">units in inventory</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm font-medium">In Stock</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activeVariantsCount}</p>
          <p className="text-xs text-gray-500 mt-1">variants available</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm font-medium">Lowest Stock</p>
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
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="color">Color</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Stock Level</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Variants</option>
              <option value="active">In Stock</option>
              <option value="inactive">Out of Stock</option>
              <option value="low-stock">Low Stock (&lt;20)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenForm}
          disabled={isLoading}
          className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 font-medium flex items-center justify-center gap-2 whitespace-nowrap disabled:bg-gray-400"
        >
          🆕 Add New Variant
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !variants.length && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Loading variants...</p>
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
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Storage (ROM)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
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
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVariant(variant.id)}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                            disabled={isLoading}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      No variants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {sortedVariants.length} of {variants.length} variants
            </p>
          </div>
        </div>
      ) : null}

      {/* Variant Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Space Gray, Blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage (ROM) *
                </label>
                <input
                  type="text"
                  value={formData.rom}
                  onChange={(e) => setFormData({ ...formData, rom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 256GB, 512GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (đ) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15000000"
                  step="1000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                  step="1"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
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
                      <span className="text-xs text-blue-600">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {imagePreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
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
                Cancel
              </button>
              <button
                onClick={() => handleSaveVariant(formData)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSaving || !formData.color || !formData.rom || formData.price < 0 || formData.stockQuantity < 0}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
