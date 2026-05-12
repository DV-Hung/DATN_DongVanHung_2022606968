import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MAIN_NAV_LINKS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Don't call onSearchChange here - only call on button click
  };

  const handleSearchSubmit = () => {
    // Only call API when search button is clicked
    onSearchChange?.(searchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Also support Enter key to submit search
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleLoginClick = () => {
    setUserMenuOpen(false);
    navigate('/login');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">TA</span>
            </div>
            <span className="font-bold text-lg">{t('app.name')}</span>
          </Link>

          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {MAIN_NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium hover:text-blue-400 transition"
              >
                {t(link.label)}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            {/* Cart Icon */}
            <button
              onClick={() => navigate('/cart')}
              className="relative hover:text-blue-400 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Icon */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hover:text-blue-400 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t('header.orders')}
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          {t('header.admin')}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-200"
                      >
                        {t('header.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLoginClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        {t('auth.login')}
                      </button>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t('auth.register')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {
        mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="p-4 flex flex-col gap-4">
              {MAIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )
      }
    </header >
  );
};
