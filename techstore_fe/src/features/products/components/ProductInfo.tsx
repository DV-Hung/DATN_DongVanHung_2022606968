import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product, Variant } from '../../../shared/types';
import { useCart } from '../../../shared/context/CartContext';

interface ProductInfoProps {
  product: Product;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onVariantChange?: (variant: Variant) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  onQuantityChange,
  onVariantChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, error } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extract unique colors and storage options from variants
  const colors = Array.from(
    new Set(product.variants?.map(v => v.color).filter((c): c is string => Boolean(c)) || [])
  );
  const storageOptions = Array.from(
    new Set(product.variants?.map(v => v.storage).filter((s): s is string => Boolean(s)) || [])
  );

  // Initialize selected variant
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      if (product.variants[0].color) {
        setSelectedColor(product.variants[0].color);
      }
      if (product.variants[0].storage) {
        setSelectedStorage(product.variants[0].storage);
      }
    }
  }, [product.id, product.variants]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Find variant that matches the selected color
    const variant = product.variants?.find(v => v.color === color);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedStorage(variant.storage || null);
      onVariantChange?.(variant);
    }
  };

  // Handle storage selection
  const handleStorageSelect = (storage: string) => {
    setSelectedStorage(storage);
    // Find variant that matches the selected storage
    const variant = product.variants?.find(v => v.storage === storage);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedColor(variant.color || null);
      onVariantChange?.(variant);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const displayPrice = selectedVariant?.retailPrice || product.price;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setAddToCartError(t('products.pleaseSelectVariant') || 'Please select a variant (color and storage) before adding to cart');
      return;
    }

    setAddToCartLoading(true);
    setAddToCartError(null);
    setSuccessMessage(null);

    try {
      await addToCart(product, quantity, selectedVariant);
      setSuccessMessage(t('Đã thêm vào giỏ') || 'Product added to cart successfully!');

      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setAddToCartError(
        (err as any)?.response?.data?.message ||
        t('products.errorAddingToCart') ||
        'Failed to add product to cart. Please try again.'
      );
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant) {
      navigate('/checkout', {
        state: {
          directPurchase: {
            product,
            variant: selectedVariant,
            quantity,
          },
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Badge */}
      {product.badge && (
        <div className="inline-flex">
          <span className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
            {product.badge}
          </span>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
        {product.brand && (
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
            {product.brand}
          </p>
        )}
      </div>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'
                  } fill-current`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {product.rating} ({product.reviews?.toLocaleString()} {t('products.reviews')})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-gray-900">
          {Math.round(displayPrice).toLocaleString('vi-VN')}đ
        </div>
        {product.originalPrice && (
          <div className="flex items-center gap-2">
            <span className="text-xl text-gray-500 line-through">
              {product.originalPrice.toLocaleString('vi-VN')}đ
            </span>
            {discount > 0 && (
              <span className="text-sm font-bold px-2 py-1 bg-red-100 text-red-600 rounded">
                -{discount}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection: Chassis Color */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {t('products.selection')} ({selectedColor || 'Select Color'})
          </h3>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedColor === color
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-400'
                  }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Storage Options */}
      {storageOptions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            {t('products.configurableStorage')} ({selectedStorage || 'Select Storage'})
          </h3>
          <div className="flex gap-3 flex-wrap">
            {storageOptions.map((storage) => (
              <button
                key={storage}
                onClick={() => handleStorageSelect(storage)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedStorage === storage
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-400'
                  }`}
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('products.quantity')}</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium"
            min="1"
          />
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={handleBuyNow}
            disabled={selectedVariant === null || !product.inStock}
            className="flex-1 bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
          >
            {t('products.purchaseNow')}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant === null || !product.inStock || addToCartLoading}
            className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
          >
            {addToCartLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                {t('products.adding') || 'Adding...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {t('Đã thêm vào giỏ')}
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {(addToCartError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5.917A2.972 2.972 0 00 15.027 2H4.973A2.972 2.972 0 002 5.917v8.166A2.972 2.972 0 004.973 17h10.054A2.972 2.972 0 0018 14.083V5.917zM9 13a1 1 0 11-2 0 1 1 0 012 0zm0-5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Error</p>
              <p>{addToCartError || error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{successMessage}</p>
          </div>
        )}
      </div>

      {/* Shipping Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
        <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
        <div className="text-sm">
          <p className="font-semibold text-gray-900">Miễn phí vận chuyển</p>
          <p className="text-gray-600">Giao hàng trong 24-48 giờ</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
          {product.inStock ? 'Còn hàng' : 'Hết hàng'}
        </span>
      </div>
    </div>
  );
};

export default ProductInfo;
