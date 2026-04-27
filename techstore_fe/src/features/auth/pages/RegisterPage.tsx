import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../shared/hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, logout, loading: authLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated (only on mount)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Check password match in real-time
    if (name === 'confirmPassword' || name === 'password') {
      if (
        name === 'confirmPassword' &&
        value !== formData.password
      ) {
        setPasswordMatchError(t('auth.passwordsDoNotMatch') || 'Mật khẩu không khớp');
      } else if (name === 'password' && value !== formData.confirmPassword && formData.confirmPassword) {
        setPasswordMatchError(t('auth.passwordsDoNotMatch') || 'Mật khẩu không khớp');
      } else {
        setPasswordMatchError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError(t('auth.passwordsDoNotMatch') || 'Mật khẩu không khớp');
      return;
    }

    if (!formData.agreeToTerms) {
      setError(t('auth.acceptTerms') || 'Bạn phải đồng ý với các điều khoản dịch vụ');
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort') || 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await register(formData.fullName, formData.email, formData.password);
      // Show success message
      setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
      setError('');
      // Logout to clear auth state and redirect to login page after 2 seconds
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('auth.registerError') || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.createAccount')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('auth.designYourExperience')}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.fullName')}
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder={t('auth.fullNamePlaceholder') || 'Julian Vane'}
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder={t('auth.emailPlaceholder') || 'architect@tech.io'}
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.confirm')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:bg-white transition ${passwordMatchError ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
              />
              {passwordMatchError && (
                <p className="text-red-600 text-sm mt-1">{passwordMatchError}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer mt-1"
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
                {t('auth.iAcknowledge')}{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  {t('auth.termsOfService')}
                </a>{' '}
                {t('auth.and')}{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  {t('auth.privacyPolicy')}
                </a>
                .
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 mt-6"
            >
              {loading || authLoading ? t('auth.creating') : t('auth.createAccount')}
              {!loading && !authLoading && ' →'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              {t('auth.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
