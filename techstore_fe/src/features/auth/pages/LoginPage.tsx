import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../shared/hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading: authLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  // Validation functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // Validate email format
    if (name === 'email') {
      if (value && !isValidEmail(value)) {
        setFieldErrors(prev => ({
          ...prev,
          email: t('Email không hợp lệ'),
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          email: '',
        }));
      }
    }

    // Validate password is not empty
    if (name === 'password') {
      if (!value.trim()) {
        setFieldErrors(prev => ({
          ...prev,
          password: t('Mật khẩu không được để trống'),
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          password: '',
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newErrors = { email: '', password: '' };

    // Validate email
    if (!formData.email) {
      newErrors.email = t('Email không được để trống');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('Email không hợp lệ');
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = t('Mật khẩu không được để trống');
    }

    setFieldErrors(newErrors);

    // If there are any errors, stop submission
    if (Object.values(newErrors).some(err => err)) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result && !result.success) {
        setError(result.message);
        return;
      }
      // Navigate immediately after successful login
      navigate('/');
    } catch (err: any) {
      console.log('Login error:');
      const errorMessage = err.response?.data?.message || err.message;

      // Provide user-friendly error messages in Vietnamese
      if (errorMessage?.includes('401') || errorMessage?.includes('Unauthorized')) {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      } else if (errorMessage?.includes('not found') || errorMessage?.includes('không tìm thấy')) {
        setError('Tài khoản này không tồn tại');
      } else if (errorMessage?.includes('disabled') || errorMessage?.includes('inactive')) {
        setError('Tài khoản của bạn đã bị khóa');
      } else {
        setError(errorMessage || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo/Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('auth.enterCredentials')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-red-600 text-xl flex-shrink-0">⚠️</span>
                  <div>
                    <h3 className="text-red-900 font-semibold text-sm">Lỗi Đăng Nhập</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700 flex-shrink-0 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400">✉️</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder={t('auth.emailPlaceholder') || 'name@company.com'}
                  value={formData.email}
                  onChange={handleChange}

                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:bg-white transition ${fieldErrors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative mb-2">
                <span className="absolute left-4 top-3 text-gray-400">🔒</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}

                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:bg-white transition ${fieldErrors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-sm mb-2">{fieldErrors.password}</p>
              )}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* Remember Me */}


            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200"
            >
              {loading || authLoading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
