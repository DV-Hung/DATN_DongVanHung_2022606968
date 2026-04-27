import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { useAdminUsers, type AdminUser } from '../hooks/useAdminUsers';

export const AdminUsers: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    updateUserRole,
    updateUserStatus,
    deleteUser,
  } = useAdminUsers();

  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<AdminUser['role']>('customer');
  const [editStatus, setEditStatus] = useState<AdminUser['status']>('active');
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleMatch = filterRole === 'all' ? true : user.role === filterRole;
      const statusMatch = filterStatus === 'all' ? true : user.status === filterStatus;
      return roleMatch && statusMatch;
    });
  }, [users, filterRole, filterStatus]);

  const roleColors: Record<AdminUser['role'], { bg: string; text: string }> = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
    user: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  const statusColors: Record<AdminUser['status'], { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  };

  const handleEditRole = async (userId: string | number, role: AdminUser['role']) => {
    try {
      await updateUserRole(userId, role);
      setEditingUser(null);
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleEditStatus = async (userId: string | number, status: AdminUser['status']) => {
    try {
      await updateUserStatus(userId, status);
      setEditingUser(null);
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string | number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await updateUserStatus(userId, 'inactive');
      } catch (err) {
        alert('Failed to deactivate user');
      }
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length.toLocaleString(), change: 'Registered users', icon: '👥' },
    { label: 'Active Users', value: users.filter((u) => u.status === 'active').length, change: 'Online now', icon: '✅' },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, change: 'System admins', icon: '👑' },
    { label: 'Customers', value: users.filter((u) => u.role === 'customer').length, change: 'Regular users', icon: '🛍️' },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions.</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">ROLE</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">STATUS</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Loading users...</p>
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
                    USER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ROLE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    JOIN DATE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    LAST LOGIN
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                            onBlur={() => handleEditRole(user.id, editRole)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            autoFocus
                          >
                            <option value="admin">Admin</option>
                            <option value="customer">Customer</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]?.bg} ${roleColors[user.role]?.text}`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingUser === user.id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            onBlur={() => handleEditStatus(user.id, editStatus)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            autoFocus
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusColors[user.status].dot}`}></div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status].bg} ${statusColors[user.status].text}`}>
                              {user.status}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEditingUser(editingUser === String(user.id) ? null : String(user.id));
                              setEditRole(user.role);
                              setEditStatus(user.status);
                            }}
                            className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                          >
                            � Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-600">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
