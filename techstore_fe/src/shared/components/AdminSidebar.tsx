import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { icon: '📊', label: 'admin.dashboard', path: '/admin' },
    { icon: '👥', label: 'admin.users', path: '/admin/users' },
    { icon: '📦', label: 'admin.products', path: '/admin/products' },
    { icon: '🏷️', label: 'admin.brands', path: '/admin/brands' },
    { icon: '👥', label: 'admin.suppliers', path: '/admin/suppliers' }, { icon: '📥', label: 'admin.inventoryInflow', path: '/admin/inventory-inflow' }, { icon: '🛒', label: 'admin.orders', path: '/admin/orders' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:translate-x-0 lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white transition-transform duration-300 z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TA</span>
            </div>
            <span className="font-bold text-lg">{t('header.techStore')}</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{t(item.label)}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="px-4 py-6 space-y-2 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <span className="text-xl">⚙️</span>
            <span className="font-medium">{t('admin.settings')}</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">{t('admin.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
