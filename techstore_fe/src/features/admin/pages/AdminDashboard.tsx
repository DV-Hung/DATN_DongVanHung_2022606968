import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { apiClient } from '../../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState([
    { label: 'Total Sales', value: '$0.00', change: '+0%', icon: '💰', color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Orders', value: '0', change: '+0%', icon: '📦', color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Active Users', value: '0', change: '+0%', icon: '👥', color: 'bg-red-100 text-red-600' },
    { label: 'Total Products', value: '0', change: '+0%', icon: '🛍️', color: 'bg-gray-100 text-gray-600' },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          apiClient.getOrders(),
          apiClient.getAllUsers(),
          apiClient.getAllProducts(),
        ]);

        // Extract data from responses
        const ordersData = ordersRes.data?.data || {};
        const usersData = usersRes.data?.data || [];
        const productsData = productsRes.data?.data || {};

        // Calculate total orders count
        let totalOrders = 0;
        let totalSales = 0;

        // Handle paginated orders response
        if (ordersData.content && Array.isArray(ordersData.content)) {
          totalOrders = ordersData.totalElements || ordersData.content.length;
          totalSales = ordersData.content.reduce((sum: number, order: any) => {
            return sum + (order.totalAmount || 0);
          }, 0);
        } else if (Array.isArray(ordersData)) {
          totalOrders = ordersData.length;
          totalSales = ordersData.reduce((sum: number, order: any) => {
            return sum + (order.totalAmount || 0);
          }, 0);
        }

        // Calculate total users count
        const totalUsers = Array.isArray(usersData) ? usersData.length : 0;

        // Calculate total products count
        let totalProducts = 0;
        if (productsData.content && Array.isArray(productsData.content)) {
          totalProducts = productsData.totalElements || productsData.content.length;
        } else if (Array.isArray(productsData)) {
          totalProducts = productsData.length;
        }

        setStats([
          {
            label: 'Total Sales',
            value: `${Math.round(totalSales).toLocaleString('vi-VN')}đ`,
            change: '+0%',
            icon: '💰',
            color: 'bg-blue-100 text-blue-600'
          },
          {
            label: 'Total Orders',
            value: totalOrders.toString(),
            change: '+0%',
            icon: '📦',
            color: 'bg-indigo-100 text-indigo-600'
          },
          {
            label: 'Active Users',
            value: totalUsers.toString(),
            change: '+0%',
            icon: '👥',
            color: 'bg-red-100 text-red-600'
          },
          {
            label: 'Total Products',
            value: totalProducts.toString(),
            change: '+0%',
            icon: '🛍️',
            color: 'bg-gray-100 text-gray-600'
          },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Real-time analytics for Tech Store systems.</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-xl`}>
                    {stat.icon}
                  </div>
                  <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Monthly Performance</h2>
            </div>

            {/* Simple Bar Chart */}
            <div className="flex items-end justify-around h-48 gap-2">
              {[40, 45, 65, 35, 75, 85, 60].map((height, idx) => {
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'];
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full bg-blue-600 rounded-t" style={{ height: `${height * 1.5}px` }}></div>
                    <span className="text-xs font-medium text-gray-600">{months[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};
