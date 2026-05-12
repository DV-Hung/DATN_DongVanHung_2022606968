import React, { useState, useMemo, useEffect } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminUsers, type AdminUser } from '../hooks/useAdminUsers';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';

export const AdminUsers: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    updateUserStatus,
  } = useAdminUsers();

  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deactivateConfirm, setDeactivateConfirm] = useState<{
    id: string | number;
    name: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatch = filterRole === 'all' ? true : user.role === filterRole;
      const statusMatch = filterStatus === 'all' ? true : user.status === filterStatus;
      return roleMatch && statusMatch;
    });
  }, [users, filterRole, filterStatus]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / DEFAULT_PAGE_SIZE);

  // Get paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    const endIndex = startIndex + DEFAULT_PAGE_SIZE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, filterStatus]);

  const roleColors: Record<AdminUser['role'], { bg: string; text: string }> = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
    moderator: { bg: 'bg-blue-100', text: 'text-blue-700' },
    customer: { bg: 'bg-gray-100', text: 'text-gray-700' },
    support: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  };

  const statusColors: Record<AdminUser['status'], { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
    suspended: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };

  const handleDeactivateUser = async (userId: string | number) => {
    try {
      setIsProcessing(true);
      await updateUserStatus(userId, 'inactive');
      setDeactivateConfirm(null);
      window.location.reload();
    } catch (err) {
      alert('Failed to deactivate user');
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = [
    { label: 'Tổng Người Dùng', value: users.length.toLocaleString(), change: 'Người dùng đã đăng ký', icon: '👥' },
    { label: 'Người Dùng Hoạt Động', value: users.filter((u) => u.status === 'active').length, change: 'Đang hoạt động', icon: '✅' },
    { label: 'Quản Trị Viên', value: users.filter((u) => u.role === 'admin').length, change: 'Quản trị viên hệ thống', icon: '👑' },
    { label: 'Khách Hàng', value: users.filter((u) => u.role === 'customer').length, change: 'Người dùng thường', icon: '🛍️' },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản người dùng, vai trò và quyền hạn.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">VAI TRÒ</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất Cả Vai Trò</option>
            <option value="admin">Quản Trị Viên</option>
            <option value="user">Người Dùng</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TRẠNG THÁI</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất Cả Trạng Thái</option>
            <option value="active">Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Đang tải người dùng...</p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NGƯỜI DÙNG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SỐ ĐIỆN THOẠI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    VAI TRÒ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TRẠNG THÁI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    NGÀY THAM GIA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]?.bg} ${roleColors[user.role]?.text}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusColors[user.status].dot}`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status].bg} ${statusColors[user.status].text}`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              // Navigate to user detail page
                              window.location.href = `/admin/users/${user.id}`;
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            👁️ Xem Chi Tiết
                          </button>
                          <button
                            onClick={() => setDeactivateConfirm({ id: user.id, name: user.name })}
                            disabled={user.status === 'inactive'}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✕ Vô Hiệu Hóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển Thị {paginatedUsers.length > 0 ? (currentPage - 1) * DEFAULT_PAGE_SIZE + 1 : 0} - {Math.min(currentPage * DEFAULT_PAGE_SIZE, filteredUsers.length)} của {filteredUsers.length} người dùng
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
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận Vô Hiệu Hóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn vô hiệu hóa người dùng <strong>{deactivateConfirm.name}</strong>? Họ sẽ không thể đăng nhập vào hệ thống.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeactivateConfirm(null)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeactivateUser(deactivateConfirm.id)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:opacity-50"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Vô Hiệu Hóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
