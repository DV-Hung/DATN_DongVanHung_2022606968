import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { apiClient } from '../../../services/api';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: 'Total Sales', value: '$0.00', change: '+0%', icon: '💰', color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Orders', value: '0', change: '+0%', icon: '📦', color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Active Users', value: '0', change: '+0%', icon: '👥', color: 'bg-red-100 text-red-600' },
    { label: 'Total Products', value: '0', change: '+0%', icon: '🛍️', color: 'bg-gray-100 text-gray-600' },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [logs, setLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState<number>(0);
  const [logsSize, setLogsSize] = useState<number>(10);
  const [logsTotalPages, setLogsTotalPages] = useState<number>(0);
  const [logsLoading, setLogsLoading] = useState(false);

  // Helper function to format and translate log values
  const formatLogValue = (value: any): string => {
    if (!value) return '-';

    const stringValue = String(value).trim();

    // Handle "Import order created with X items" message
    if (stringValue.includes('Import order created with')) {
      const itemCount = stringValue.match(/\d+/)?.[0];
      return itemCount ? `Đơn nhập hàng đã tạo với ${itemCount} sản phẩm` : stringValue;
    }
    if (stringValue.includes('Variant created with price')) {
      const price = stringValue.match(/\d+/)?.[0];
      return price ? `Phiên bản sản phẩm đã khai báo tồn với giá ${price}` : stringValue;
    }
    if (stringValue.includes('Variant created with stock quantity')) {
      const stockQuantity = stringValue.match(/\d+/)?.[0];
      return stockQuantity ? `Phiên bản sản phẩm đã khai báo tồn với số lượng ${stockQuantity}` : stringValue;
    }

    // Translate order/status values
    const statusKey = stringValue.toUpperCase();
    const translatedStatus = t(`systemLogs.LOG_STATUS.${statusKey}`, null);
    if (translatedStatus && translatedStatus !== `systemLogs.LOG_STATUS.${statusKey}`) {
      return translatedStatus;
    }

    try {
      // Try to parse as JSON
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;

      if (typeof parsed === 'object' && parsed !== null) {
        // Format object entries
        const entries = Object.entries(parsed)
          .map(([key, val]) => {
            // Translate field name
            const translatedKey = t(`systemLogs.LOG_FIELD.${key}`, key);
            // Translate value if it's a status
            const translatedVal = t(`systemLogs.LOG_STATUS.${String(val).toUpperCase()}`, null);
            const finalVal = translatedVal && translatedVal !== `systemLogs.LOG_STATUS.${String(val).toUpperCase()}` ? translatedVal : val;
            return `${translatedKey}: ${finalVal}`;
          })
          .join(', ');
        return entries;
      }
    } catch (e) {
      // Not JSON, continue with string formatting
    }

    // Try to translate if it's a key in LOG_FIELD
    const translated = t(`systemLogs.LOG_FIELD.${stringValue}`, null);
    if (translated && translated !== `systemLogs.LOG_FIELD.${stringValue}`) {
      return translated;
    }

    return stringValue;
  };

  // Fetch available years on component mount
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        const currentYear = new Date().getFullYear();

        // Generate years from 10 years ago to current year
        const defaultYears: number[] = [];
        for (let i = currentYear; i >= currentYear - 10; i--) {
          defaultYears.push(i);
        }

        // Try to fetch available years from API
        try {
          const response = await apiClient.getAvailableYears();
          const apiYears = response.data?.data || [];

          // Merge API years with default years and remove duplicates
          const mergedYears = Array.from(new Set([...apiYears, ...defaultYears]));
          const sortedYears = mergedYears.sort((a, b) => b - a); // Sort descending

          setAvailableYears(sortedYears);

          // Set selected year to current year if available, otherwise use the first year
          if (!sortedYears.includes(currentYear) && sortedYears.length > 0) {
            setSelectedYear(sortedYears[0]);
          }
        } catch (apiErr) {
          console.error('Error fetching API years:', apiErr);
          // Fallback to default years if API fails
          setAvailableYears(defaultYears);
        }
      } catch (err) {
        console.error('Error processing years:', err);
      }
    };

    fetchAvailableYears();
  }, []);

  // Fetch stats whenever year changes
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch stats by year
        const statsRes = await apiClient.getDashboardStatsByYear(selectedYear);
        const statsData = statsRes.data?.data || {};

        setStats([
          {
            label: 'Tổng Doanh Thu',
            value: `${Math.round(statsData.totalSales || 0).toLocaleString('vi-VN')}đ`,
            change: '',
            icon: '💰',
            color: 'bg-blue-100 text-blue-600'
          },
          {
            label: 'Tổng Đơn Hàng',
            value: (statsData.totalOrders || 0).toString(),
            change: '',
            icon: '📦',
            color: 'bg-indigo-100 text-indigo-600'
          },
          {
            label: 'Người Dùng Hoạt Động',
            value: (statsData.totalUsers || 0).toString(),
            change: '',
            icon: '👥',
            color: 'bg-red-100 text-red-600'
          },
          {
            label: 'Tổng Sản Phẩm',
            value: (statsData.totalProducts || 0).toString(),
            change: '',
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
  }, [selectedYear]);

  // Fetch system logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const response = await apiClient.get('/system-logs', {
          params: {
            page: logsPage,
            size: logsSize
          }
        });
        const pageData = response.data?.data || {};
        setLogs(pageData.content || []);
        setLogsTotalPages(pageData.totalPages || 0);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLogsLoading(false);
      }
    };

    fetchLogs();
  }, [logsPage, logsSize]);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan Bảng Điều Khiển</h1>
          <p className="text-gray-600 mt-1">Phân tích thời gian thực cho hệ thống Tech Store.</p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="year-select" className="text-gray-700 font-medium">
            Chọn Năm:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu bảng điều khiển...</p>
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

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">{t('systemLogs.title')}</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">{t('systemLogs.itemsPerPage')}</label>
                <select
                  value={logsSize}
                  onChange={(e) => {
                    setLogsSize(parseInt(e.target.value));
                    setLogsPage(0);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {logsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">⏳</div>
                <p className="mt-2 text-gray-600">{t('systemLogs.loading')}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">{t('systemLogs.noLogs')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.timestamp')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.action')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.table')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.entityId')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.oldValue')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.newValue')}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">{t('systemLogs.user')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: any, idx: number) => {
                        // Translate log action
                        const actionKey = log.action?.toUpperCase();
                        const translatedAction = actionKey && t(`systemLogs.LOG_ACTION.${actionKey}`, log.action || '-');

                        // Translate table name
                        const tableKey = log.tableName?.toLowerCase() || log.targetTable?.toLowerCase();
                        const translatedTable = tableKey && t(`systemLogs.LOG_TABLE.${tableKey}`, log.tableName || log.targetTable || '-');

                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">
                              {new Date(log.createdAt || log.timestamp).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{translatedAction}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{translatedTable}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 font-mono">{log.entityId || log.targetId || '-'}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-xs" title={formatLogValue(log.oldValue)}>{formatLogValue(log.oldValue)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-md" title={formatLogValue(log.newValue)}>{formatLogValue(log.newValue)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{log.userId || log.user || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    {t('systemLogs.pagination', { current: logsPage + 1, total: logsTotalPages })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogsPage(Math.max(0, logsPage - 1))}
                      disabled={logsPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {t('systemLogs.previous')}
                    </button>
                    <button
                      onClick={() => setLogsPage(Math.min(logsTotalPages - 1, logsPage + 1))}
                      disabled={logsPage === logsTotalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {t('systemLogs.next')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};
