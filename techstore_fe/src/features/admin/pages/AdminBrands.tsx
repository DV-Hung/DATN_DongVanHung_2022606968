import React, { useState } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useBrands, type Brand } from '../hooks';

interface FormData extends Omit<Brand, 'id'> {
  id?: string | number;
}

export const AdminBrands: React.FC = () => {
  const {
    brands,
    isLoading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useBrands();

  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    logo: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string | number;
    name: string;
  } | null>(null);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        description: '',
        logo: '',
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Brand name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, formData);
      } else {
        await createBrand(formData);
      }
      handleCloseModal();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save brand');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    setIsSaving(true);
    try {
      await deleteBrand(id);
      setDeleteConfirm(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete brand');
      setDeleteConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Nhãn hàng</h1>
            <p className="text-gray-600 mt-1">Quản lý và giám sát các nhãn hàng điện tử chính trong danh mục sản phẩm của bạn.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>+</span> Tạo Nhãn hàng Mới
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Đang tải ...</p>
        </div>
      )}

      {/* Brands List */}
      {!isLoading && brands.length > 0 && (
        <div className="space-y-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {brand.logo && <span className="text-2xl">{brand.logo}</span>}
                    <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{brand.description}</p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button
                    onClick={() => handleOpenModal(brand)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition flex items-center gap-2"
                  >
                    ✎ Sửa
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ id: brand.id, name: brand.name })}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition flex items-center gap-2"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && brands.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Không tìm thấy nhãn hàng nào. Tạo nhãn hàng đầu tiên để bắt đầu.</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Tạo Nhãn hàng Mới
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBrand ? 'Sửa Nhãn hàng' : 'Tạo Nhãn hàng Mới'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Nhãn hàng *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple, Samsung"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả ngắn gọn về nhãn hàng..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Nhãn hàng'}
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
                Bạn có chắc chắn muốn xóa nhãn hàng <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
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
                  onClick={() => handleDelete(deleteConfirm.id)}
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
