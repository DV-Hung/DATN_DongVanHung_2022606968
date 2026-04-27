import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminSuppliers, type AdminSupplier } from '../hooks';

interface FormData extends Omit<AdminSupplier, 'id'> {
  id?: string | number;
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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactDetails: '',
    status: 'Active',
  });

  const [filters, setFilters] = useState({
    status: 'All Status',
  });

  const statuses = ['All Status', 'Active', 'Inactive'];

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
        contactDetails: supplier.contactDetails,
        status: supplier.status,
        id: supplier.id,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactDetails: '',
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
      setFormError('Supplier name is required');
      return false;
    }
    if (!formData.contactDetails.trim()) {
      setFormError('Contact details are required');
      return false;
    }
    if (!formData.status) {
      setFormError('Status is required');
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
        contactDetails: formData.contactDetails,
        status: formData.status as 'Active' | 'Inactive',
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }
      handleCloseModal();
      navigate('/admin/suppliers');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save supplier');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id)
        .then(() => {
          navigate('/admin/suppliers');
        })
        .catch((err) => {
          alert(`Failed to delete supplier: ${err.message}`);
        });
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
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage your suppliers and partnerships.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          disabled={isLoading}
        >
          ➕ Add New Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">STATUS</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !suppliers.length && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Loading suppliers...</p>
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
                    SUPPLIER NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    CONTACT DETAILS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ACTIONS
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
                        {supplier.contactDetails}
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
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(supplier.id)}
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
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                      No suppliers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Summary */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </p>
          </div>
        </div>
      ) : null}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Details
                </label>
                <input
                  type="text"
                  value={formData.contactDetails}
                  onChange={(e) => handleInputChange('contactDetails', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email, phone, or address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>


            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isSaving}
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
