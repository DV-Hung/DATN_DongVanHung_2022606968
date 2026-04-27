import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call forgot password API here
      console.log('Send reset link to:', email);
      setSuccess(true);
    } catch (err) {
      setError(t('auth.resetError') || 'Gửi liên kết đặt lại thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.checkEmail')}
              </h1>
              <p className="text-gray-600 text-sm">
                {t('auth.resetLinkSent')}
              </p>
              <p className="text-gray-900 font-medium mt-4 break-all">{email}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                {t('auth.didNotReceive')}
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition duration-200 mb-4"
            >
              {t('auth.backToLogin')}
            </button>

            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-lg transition duration-200"
            >
              {t('auth.tryAnotherEmail')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('auth.forgotPasswordTitle')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('auth.forgotPasswordDesc')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
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
                  placeholder={t('auth.emailPlaceholder') || 'name@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <p className="text-gray-600 text-xs mt-2">
                {t('auth.resetInstructions')}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200"
            >
              {loading ? t('auth.sending') : t('auth.sendResetLink')}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              {t('auth.rememberPassword')}{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('auth.backToLogin')}
              </Link>
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-4">
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
