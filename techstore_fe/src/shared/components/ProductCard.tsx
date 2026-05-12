import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product, Variant } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, variant?: Variant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Extract unique colors and storage from variants
  const colors = Array.from(
    new Set(product.variants?.map(v => v.color).filter(Boolean) || [])
  );
  const storageOptions = Array.from(
    new Set(product.variants?.map(v => v.storage).filter(Boolean) || [])
  );

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* Image Container */}
      <div
        onClick={handleProductClick}
        className="relative overflow-hidden bg-gray-100 aspect-square cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-3 right-3 px-3 py-1 rounded text-xs font-semibold text-white ${product.badge === 'NEW ARRIVAL'
            ? 'bg-green-500'
            : product.badge === 'BEST SELLER'
              ? 'bg-blue-600'
              : 'bg-orange-500'
            }`}>
            {product.badge}
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs font-semibold text-orange-500 mb-1 uppercase tracking-wide">
          {product.brand}
        </p>

        {/* Product Name */}
        <h3
          onClick={handleProductClick}
          className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 h-10 cursor-pointer hover:text-orange-600 transition-colors"
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Specs Grid */}
        {(product.processor || product.memory || product.storage) && (
          <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-200 text-xs">
            {product.processor && (
              <div>
                <p className="text-gray-500">{t('productCard.processor')}</p>
                <p className="font-medium text-gray-900">{product.processor}</p>
              </div>
            )}
            {product.memory && (
              <div>
                <p className="text-gray-500">{t('productCard.ram')}</p>
                <p className="font-medium text-gray-900">{product.memory}</p>
              </div>
            )}
            {product.storage && (
              <div>
                <p className="text-gray-500">{t('productCard.storage')}</p>
                <p className="font-medium text-gray-900">{product.storage}</p>
              </div>
            )}
            {product.display && (
              <div>
                <p className="text-gray-500">{t('productCard.display')}</p>
                <p className="font-medium text-gray-900">{product.display}</p>
              </div>
            )}
          </div>
        )}

        {/* Brand Name */}
        <p className="text-xs text-gray-600 mb-3 font-medium">
          {product.brand}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {(selectedVariant?.retailPrice || product.price).toLocaleString('vi-VN')}đ
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        {/* Color Options */}
        {colors.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    const variant = product.variants?.find(v => v.color === color);
                    if (variant) handleVariantSelect(variant);
                  }}
                  className={`px-2 py-1 text-xs rounded border-2 transition-all ${selectedVariant?.color === color
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
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
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Storage</p>
            <div className="flex gap-2 flex-wrap">
              {storageOptions.map((storage) => (
                <button
                  key={storage}
                  onClick={() => {
                    const variant = product.variants?.find(v => v.storage === storage);
                    if (variant) handleVariantSelect(variant);
                  }}
                  className={`px-2 py-1 text-xs rounded border-2 transition-all ${selectedVariant?.storage === storage
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                    }`}
                >
                  {storage}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(product, selectedVariant || undefined)}
          disabled={!product.inStock}
          className={`w-full py-2 rounded font-semibold text-sm transition ${product.inStock
            ? 'bg-gray-900 text-white hover:bg-blue-600'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          {product.inStock ? t('productCard.viewDetails') : t('productCard.outOfStock')}
        </button>
      </div>
    </div>
  );
};
