import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header, Footer, Breadcrumb } from '../../../shared/components';
import { useCart, CartItem } from '../../../shared/context/CartContext';

export const CartPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();

    const breadcrumbs = [
        { label: t('navigation.home'), path: '/' },
        { label: t('navigation.cart'), path: '#' },
    ];

    const subtotal = getTotalPrice();
    const shipping = subtotal > 0 ? 0 : 0; // Free shipping
    const totalAmount = subtotal + shipping;

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert(t('checkout.cartEmpty'));
            return;
        }
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

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
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.reviewCart')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Cart Items */}
                    <div className="lg:col-span-2">
                        {/* Cart Items Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('checkout.cartItems')}</h2>

                            {cart.length === 0 ? (
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
                                        onClick={handleContinueShopping}
                                        className="text-orange-600 font-semibold hover:text-orange-700"
                                    >
                                        {t('checkout.continueShopping')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item: CartItem) => (
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

                                            {/* Quantity & Remove */}
                                            <div className="flex flex-col items-end gap-3">
                                                <button
                                                    onClick={() => removeFromCart(item.id, item.variantId, item.cartItemId)}
                                                    className="text-gray-400 hover:text-red-500 transition"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                                <div className="flex items-center gap-2 border border-gray-300 rounded">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.cartItemId)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.cartItemId)}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    {cart.length > 0 && (
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 text-white rounded-lg shadow-sm p-6 sticky top-8">
                                <h2 className="text-lg font-bold mb-6">{t('checkout.orderSummary')}</h2>

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
                                    onClick={handleCheckout}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition mb-4"
                                >
                                    Đặt hàng
                                </button>

                                {/* Security Badges */}

                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CartPage;
