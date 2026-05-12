import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminInventoryInflow, type InventoryInflowBatch, type InventoryInflowItem } from '../hooks';
import { apiClient } from '../../../services/api';

interface FormData extends Omit<InventoryInflowBatch, 'id'> {
  id?: string | number;
}

export const AdminInventoryInflow: React.FC = () => {
  const navigate = useNavigate();
  const {
    batches,
    isLoading,
    error,
    createBatch,
  } = useAdminInventoryInflow();

  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryInflowBatch | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    supplierId: 0,
    supplierName: '',
    importDate: new Date().toISOString().split('T')[0],
    totalCost: 0,
    items: [],
  });

  const [currentItem, setCurrentItem] = useState<InventoryInflowItem>({
    variantId: 0,
    productName: '',
    color: '',
    rom: '',
    quantity: 0,
    importPrice: 0,
  });

  const [selectedProductId, setSelectedProductId] = useState<string | number>(0);

  // Load suppliers on modal open
  const loadSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const response = await apiClient.getAllSuppliers();
      const supplierData = response.data?.data || response.data || [];
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Load products on modal open
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await apiClient.getAllProducts();
      const productData = response.data?.data || response.data || [];
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load variants when product is selected
  const loadVariants = async (productId: string | number) => {
    setLoadingVariants(true);
    try {
      const response = await apiClient.getVariantsByProductId(productId);
      const variantData = response.data?.data || response.data || [];
      setVariants(Array.isArray(variantData) ? variantData : []);
    } catch (err) {
      console.error('Failed to load variants:', err);
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleOpenModal = () => {
    setFormError(null);
    setFormData({
      supplierId: 0,
      supplierName: '',
      importDate: new Date().toISOString().split('T')[0],
      totalCost: 0,
      items: [],
    });
    setCurrentItem({
      variantId: 0,
      productName: '',
      color: '',
      rom: '',
      quantity: 0,
      importPrice: 0,
    });
    setSelectedProductId(0);
    setVariants([]);
    setShowModal(true);
    loadSuppliers();
    loadProducts();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleOpenDetailModal = (batch: InventoryInflowBatch) => {
    setSelectedBatch(batch);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBatch(null);
  };

  const handleProductChange = (productId: string | number) => {
    setSelectedProductId(productId);
    if (productId) {
      loadVariants(productId);
    } else {
      setVariants([]);
    }
    setCurrentItem((prev) => ({ ...prev, variantId: 0, productName: '' }));
  };

  const handleVariantChange = (variantId: string | number) => {
    const selectedVariant = variants.find(v => v.id === variantId);
    if (selectedVariant) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      setCurrentItem((prev) => ({
        ...prev,
        variantId: selectedVariant.id,
        productName: selectedProduct?.name || selectedVariant.productName || '',
        color: selectedVariant.color || '',
        rom: selectedVariant.rom || '',
      }));
    }
  };

  const handleAddItem = () => {
    if (!currentItem.variantId) {
      setFormError('Vui lòng chọn một biến thể');
      return;
    }
    if (currentItem.quantity <= 0) {
      setFormError('Số lượng phải lớn hơn 0');
      return;
    }
    if (currentItem.importPrice <= 0) {
      setFormError('Giá nhập phải lớn hơn 0');
      return;
    }

    const newItems = [...formData.items, currentItem];
    const newTotalCost = newItems.reduce((sum, item) => sum + item.quantity * item.importPrice, 0);

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      totalCost: newTotalCost,
    }));

    setCurrentItem({
      variantId: 0,
      productName: '',
      color: '',
      rom: '',
      quantity: 0,
      importPrice: 0,
    });
    setSelectedProductId(0);
    setVariants([]);
    setFormError(null);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotalCost = newItems.reduce((sum, item) => sum + item.quantity * item.importPrice, 0);

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      totalCost: newTotalCost,
    }));
  };

  const validateForm = (): boolean => {
    setFormError(null);
    if (!formData.supplierId) {
      setFormError('Nhà cung cấp là bắt buộc');
      return false;
    }
    if (!formData.importDate) {
      setFormError('Ngày nhập là bắt buộc');
      return false;
    }
    if (formData.items.length === 0) {
      setFormError('Phải thêm ít nhất một biến thể');
      return false;
    }
    return true;
  };

  const handleSaveBatch = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const batchData: InventoryInflowBatch = {
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        importDate: formData.importDate,
        totalCost: formData.totalCost,
        items: formData.items,
      };

      await createBatch(batchData);
      handleCloseModal();
      navigate('/admin/inventory-inflow');
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo đơn hàng nhập');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: keyof InventoryInflowItem, value: any) => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));
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
          <h1 className="text-3xl font-bold text-gray-900">Nhập Kho</h1>
          <p className="text-gray-600 mt-1">Quản lý đơn nhập hàng.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          disabled={isLoading}
        >
          📄 Nhập Kho
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !batches.length && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Đang tải đơn nhập...</p>
        </div>
      )}

      {/* Import Orders Table */}
      {!isLoading || batches.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    MÃ NHẬP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NGÀY NHẬP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NHÀ CUNG CẤP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SỐ LượNG HÀNG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TỔNG CHI PHÍ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{batch.id}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(batch.importDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{batch.supplierName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {batch.items.length}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {Math.round(batch.totalCost).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOpenDetailModal(batch)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                        >
                          👁 Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      Không tìm thấy đơn nhập
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {batches.length} đơn nhập
            </p>
          </div>
        </div>
      ) : null}

      {/* Create Import Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tạo Đơn Nhập</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhà Cung Cấp *
                </label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value) || 0;
                    const selectedSupplier = suppliers.find(s => s.id === selectedId);
                    handleInputChange('supplierId', selectedId);
                    handleInputChange('supplierName', selectedSupplier?.name || '');
                  }}
                  disabled={loadingSuppliers}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{loadingSuppliers ? 'Đang tải...' : 'Chọn nhà cung cấp'}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Import Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày Nhập *
                </label>
                <input
                  type="date"
                  value={formData.importDate}
                  onChange={(e) => handleInputChange('importDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Add Variant Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Thêm Biến Thể Sản Phẩm</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sản Phẩm
                    </label>
                    <select
                      value={selectedProductId || ''}
                      onChange={(e) => {
                        const selectedId = parseInt(e.target.value) || 0;
                        handleProductChange(selectedId);
                      }}
                      disabled={loadingProducts}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{loadingProducts ? 'Đang tải...' : 'Chọn sản phẩm'}</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biến Thể
                    </label>
                    <select
                      value={currentItem.variantId || ''}
                      onChange={(e) => {
                        const selectedId = parseInt(e.target.value) || 0;
                        handleVariantChange(selectedId);
                      }}
                      disabled={loadingVariants || !selectedProductId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">
                        {!selectedProductId ? 'Chọn sản phẩm trước' : loadingVariants ? 'Đang tải...' : 'Chọn biến thể'}
                      </option>
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.color} - {variant.rom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số Lượng
                      </label>
                      <input
                        type="number"
                        value={currentItem.quantity}
                        onChange={(e) => handleItemChange('quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá Nhập (đ)
                      </label>
                      <input
                        type="number"
                        value={currentItem.importPrice}
                        onChange={(e) => handleItemChange('importPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="1"
                        step="1000"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddItem}
                    className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm"
                  >
                    + Thêm Biến Thể
                  </button>
                </div>
              </div>

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Các Mục Hàng Trong Đơn Hàng</h3>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Màu: {item.color} | Bộ Nhừ: {item.rom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {Math.round(item.importPrice).toLocaleString('vi-VN')}đ = {Math.round(
                              item.quantity * item.importPrice
                            ).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">
                      Tổng Mục: <span className="font-semibold text-gray-900">{formData.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng Chi Phí: <span className="font-semibold text-gray-900">{Math.round(formData.totalCost).toLocaleString('vi-VN')}đ</span>
                    </p>
                  </div>
                </div>
              )}
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
                onClick={handleSaveBatch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSaving}
              >
                {isSaving ? 'Đang Tạo...' : 'Tạo Đơn Hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chi Tiết Đơn Nhập</h2>

            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Mã Đơn Hàng</p>
                  <p className="font-semibold text-gray-900">{selectedBatch.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nhà Cung Cấp</p>
                  <p className="font-semibold text-gray-900">{selectedBatch.supplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày Nhập</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedBatch.importDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng Chi Phí</p>
                  <p className="font-semibold text-gray-900">{Math.round(selectedBatch.totalCost).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Các Biến Thể Được Nhập</h3>
                <div className="space-y-2">
                  {selectedBatch.items.map((item, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">Màu: {item.color} | Bộ Nhớ: {item.rom}</p>
                      <p className="text-sm text-gray-600">
                        Số Lượng: {item.quantity} | Giá Đơn Vị: {Math.round(item.importPrice).toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Tổng Tiền: {Math.round(item.quantity * item.importPrice).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseDetailModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
