import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header, Footer, Breadcrumb } from '../../../shared/components';
import { useCart, CartItem } from '../../../shared/context/CartContext';
import { Product, Variant } from '../../../shared/types';
import { apiClient } from '../../../services/api';

interface DirectPurchaseData {
  product: Product;
  variant: Variant;
  quantity: number;
}

export const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [directPurchaseData, setDirectPurchaseData] = useState<DirectPurchaseData | null>(null);

  // Handle direct purchase from product details page
  useEffect(() => {
    const state = location.state as { directPurchase?: DirectPurchaseData } | undefined;
    if (state?.directPurchase) {
      setDirectPurchaseData(state.directPurchase);
    }
  }, [location.state]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    address: '',
    phone: '',
  });

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = `${t('checkout.fullName')} không được để trống`;
        } else {
          newErrors.fullName = '';
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = `${t('checkout.emailAddress')} không được để trống`;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors.email = 'Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: abc@gmail.com)';
          } else {
            newErrors.email = '';
          }
        }
        break;

      case 'address':
        if (!value.trim()) {
          newErrors.address = `${t('checkout.shippingAddress')} không được để trống`;
        } else {
          newErrors.address = '';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          newErrors.phone = `${t('checkout.phoneNumber')} không được để trống`;
        } else {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value)) {
            newErrors.phone = 'Số điện thoại phải là 10 chữ số và chỉ chứa các chữ số (không có chữ hoặc ký tự đặc biệt)';
          } else {
            newErrors.phone = '';
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return newErrors[field as keyof typeof newErrors] === '';
  };

  const validateAllFields = () => {
    const allValid =
      validateField('fullName', shippingInfo.fullName) &&
      validateField('email', shippingInfo.email) &&
      validateField('address', shippingInfo.address) &&
      validateField('phone', shippingInfo.phone);

    return allValid;
  };

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const breadcrumbs = [
    { label: t('navigation.home'), path: '/' },
    { label: t('navigation.cart'), path: '/cart' },
    { label: t('navigation.checkout'), path: '#' },
  ];

  // Calculate totals based on whether this is direct purchase or from cart
  const checkoutItems = directPurchaseData
    ? [{
      id: directPurchaseData.variant.id,
      variantId: directPurchaseData.variant.id,
      name: directPurchaseData.product.name,
      productId: directPurchaseData.product.id,
      price: directPurchaseData.variant.retailPrice,
      image: directPurchaseData.variant.image,
      quantity: directPurchaseData.quantity,
      brand: directPurchaseData.product.brand,
      memory: directPurchaseData.variant.storage,
    }]
    : cart;

  const subtotal = checkoutItems.reduce((total, item: any) => {
    const itemPrice = item.variantPrice || item.price || 0;
    return total + (itemPrice * item.quantity);
  }, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const totalAmount = subtotal + shipping;

  const isEmpty = checkoutItems.length === 0;

  const handlePlaceOrder = async () => {
    // Validate all fields
    if (!validateAllFields()) {
      return;
    }

    if (checkoutItems.length === 0) {
      setErrors((prev) => ({
        ...prev,
        fullName: t('checkout.cartEmpty'),
      }));
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order items from checkout items
      const orderItems = checkoutItems.map((item: any) => ({
        variantId: item.variantId || item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
        priceAtPurchase: item.variantPrice || item.price,
        color: item.color || item.brand,
        rom: item.storage || item.memory,
        imageUrl: item.image,
        productName: item.name,
      }));

      // Prepare order data matching OrderDTO structure
      const orderData = {
        userId: parseInt(localStorage.getItem('userId') || '1'),
        customerName: shippingInfo.fullName,
        email: shippingInfo.email,
        shippingAddress: shippingInfo.address,
        phone: shippingInfo.phone,
        paymentMethod: 'COD', // Default payment method
        totalAmount: totalAmount,
        orderItems: orderItems,
      };

      // Call API to create order
      const userId = localStorage.getItem('userId') || '1';
      await apiClient.createOrder(orderData, userId);

      setIsProcessing(false);
      setOrderPlaced(true);

      // Clear cart only if it's from cart (not direct purchase)
      if (!directPurchaseData) {
        clearCart();
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setIsProcessing(false);
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="w-20 h-20 text-green-500 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('checkout.orderPlaced')}</h1>
            <p className="text-gray-600 mb-6">
              {t('checkout.thankYou')}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb items={breadcrumbs} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.orderReview')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Order Items Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('checkout.orderReview')}</h2>
              {isEmpty ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium mb-4">{t('checkout.cartEmpty')}</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="text-orange-600 font-semibold hover:text-orange-700"
                  >
                    Continue Shopping →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkoutItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.variantImage || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.brand} | {item.storage || item.memory}
                          {item.color && ` | ${item.color}`}
                        </p>
                        <p className="font-bold text-gray-900">
                          {Math.round((item.variantPrice || item.price) * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 border border-gray-300 rounded">
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping Information Section */}
            {!isEmpty && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Full Name */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder={t('checkout.fullName')}
                      value={shippingInfo.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      onBlur={() => validateField('fullName', shippingInfo.fullName)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.fullName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                        }`}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <input
                      type="email"
                      placeholder={t('checkout.emailAddress')}
                      value={shippingInfo.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      onBlur={() => validateField('email', shippingInfo.email)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                        }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder={t('checkout.shippingAddress')}
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      onBlur={() => validateField('address', shippingInfo.address)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.address
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                        }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-span-2">
                    <input
                      type="tel"
                      placeholder={t('checkout.phoneNumber')}
                      value={shippingInfo.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      onBlur={() => validateField('phone', shippingInfo.phone)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-orange-500'
                        }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          {!isEmpty && (
            <div className="lg:col-span-1">
              <div className="bg-gray-900 text-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-bold mb-6">{t('checkout.orderSummary')}</h2>

                <div className="max-h-64 overflow-y-auto mb-6 pb-6 border-b border-gray-700">
                  {checkoutItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between mb-3 text-sm">
                      <span className="text-gray-300">
                        {item.name} x{item.quantity}
                      </span>
                      <span>{Math.round((item.variantPrice || item.price) * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span>{t('checkout.subtotal')}</span>
                    <span>{Math.round(subtotal).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('checkout.shipping')}</span>
                    <span className="text-green-400 font-semibold">{t('checkout.free')}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    {t('checkout.totalAmount')}
                  </div>
                  <div className="text-3xl font-bold">
                    {Math.round(totalAmount).toLocaleString('vi-VN')}đ
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition ${isProcessing
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                >
                  {isProcessing ? t('checkout.processing') : t('checkout.placeOrder')}
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  disabled={isProcessing}
                  className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  {t('checkout.backToCart')}
                </button>


              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
