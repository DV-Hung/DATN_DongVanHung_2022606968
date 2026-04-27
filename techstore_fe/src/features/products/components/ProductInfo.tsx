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
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);

  // Extract unique colors and storage options from variants
  const colors = Array.from(
    new Set(product.variants?.map(v => v.color).filter(Boolean) || [])
  );
  const storageOptions = Array.from(
    new Set(product.variants?.map(v => v.storage).filter(Boolean) || [])
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

  // Find variant based on selected color and storage
  const findVariant = (color?: string, storage?: string): Variant | null => {
    return product.variants?.find(v =>
      (!color || v.color === color) && (!storage || v.storage === storage)
    ) || null;
  };

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

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a variant (color and storage) before adding to cart');
      return;
    }
    addToCart(product, quantity, selectedVariant);
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
            {product.brand} {t('products.eliteSeries')}
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
      <div className="flex gap-3">
        <button
          onClick={handleBuyNow}
          disabled={selectedVariant === null}
          className="flex-1 bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
        >
          {t('products.purchaseNow')}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant === null}
          className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {t('products.addToCart')}
        </button>
      </div>

      {/* Shipping Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
        <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
        <div className="text-sm">
          <p className="font-semibold text-gray-900">Free Express Delivery</p>
          <p className="text-gray-600">Ships in 24 hours. Expected arrival Dec 12-14.</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};

export default ProductInfo;
