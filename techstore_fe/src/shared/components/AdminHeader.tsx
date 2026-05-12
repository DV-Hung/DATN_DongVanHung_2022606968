import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6">
      {/* Menu Button & Logo */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold text-gray-900">{t('header.adminHeader')}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search */}


        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">AD</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{"ADMIN"}</p>
            <p className="text-xs text-gray-500">{t('header.sampleRole')}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
