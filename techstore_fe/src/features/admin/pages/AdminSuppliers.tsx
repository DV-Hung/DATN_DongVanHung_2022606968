import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminSuppliers, type AdminSupplier } from '../hooks';

interface FormData {
  id?: string | number;
  name: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export const AdminSuppliers: React.FC = () => {
  const navigate = useNavigate();
  const {
    suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useAdminSuppliers();

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<AdminSupplier | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
    status: 'Active',
  });

  const [filters, setFilters] = useState({
    status: 'All Status',
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const statusMatch =
        filters.status === 'All Status' || supplier.status === filters.status;
      return statusMatch;
    });
  }, [suppliers, filters]);

  const handleOpenModal = (supplier?: AdminSupplier) => {
    setFormError(null);
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        phone: supplier.phone || '',
        address: supplier.address || '',
        status: supplier.status,
        id: supplier.id,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        status: 'Active',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('Tên nhà cung cấp là bắt buộc');
      return false;
    }
    if (!formData.phone?.trim()) {
      setFormError('Số điện thoại là bắt buộc');
      return false;
    }
    if (!formData.address?.trim()) {
      setFormError('Địa chỉ là bắt buộc');
      return false;
    }
    if (!formData.status) {
      setFormError('Trạng thái là bắt buộc');
      return false;
    }
    return true;
  };

  const handleSaveSupplier = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const supplierData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }
      handleCloseModal();
      navigate('/admin/suppliers');
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu nhà cung cấp');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = async (id: string | number) => {
    setIsSaving(true);
    try {
      await deleteSupplier(id);
      setDeleteConfirm(null);
      navigate('/admin/suppliers');
    } catch (err: any) {
      setFormError(err.message || 'Không thể xóa nhà cung cấp');
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
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Nhà Cung Cấp</h1>
          <p className="text-gray-600 mt-1">Quản lý các nhà cung cấp và kỳ hạn hợp tác của bạn.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          disabled={isLoading}
        >
          ➕ Thêm Nhà Cung Cấp Mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TRẠNG THÁI</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Status">Tất Cả Trạng Thái</option>
            <option value="Active">Hoạt Động</option>
            <option value="Inactive">Không Hoạt Động</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !suppliers.length && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Đang tải nhà cung cấp...</p>
        </div>
      )}

      {/* Suppliers Table */}
      {!isLoading || suppliers.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên NHÀ CUNG CẤP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SỐ ĐIỆN THOẠI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ĐỊA CHỈ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{supplier.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {supplier.address || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${supplier.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {supplier.status === 'Active' ? '✓' : '○'} {supplier.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleOpenModal(supplier)}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            ✎ Chỉnh Sửa
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: supplier.id, name: supplier.name })}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
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
                      Không tìm thấy nhà cung cấp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Summary */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredSuppliers.length} trong số {suppliers.length} nhà cung cấp
            </p>
          </div>
        </div>
      ) : null}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Nhà Cung Cấp
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tên nhà cung cấp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Điện Thoại *
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa Chỉ *
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Địa chỉ nhà cung cấp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng Thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Hoạt Động</option>
                  <option value="Inactive">Không Hoạt Động</option>
                </select>
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
                onClick={handleSaveSupplier}
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
                Bạn có chắc chắn muốn xóa nhà cung cấp <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
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
                  onClick={() => handleDeleteSupplier(deleteConfirm.id)}
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
