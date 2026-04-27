import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BRAND_OPTIONS,
} from '../constants';
import { ProductFilter } from '../types';

interface FilterSidebarProps {
  onFilterChange: (filters: ProductFilter) => void;
}

interface PriceRange {
  label: string;
  min: number;
  max: number | null;
}

const PRICE_RANGES_BUTTONS: PriceRange[] = [
  { label: '0 - 3 triệu', min: 0, max: 3000000 },
  { label: '3 - 7 triệu', min: 3000000, max: 7000000 },
  { label: '7 - 15 triệu', min: 7000000, max: 15000000 },
  { label: '15 triệu+', min: 15000000, max: null },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: true,
    price: true,
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandChange = (brand: string) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(updated);

    onFilterChange({
      brand: updated.length > 0 ? updated : undefined,
      priceRange: selectedPriceRange ? { min: selectedPriceRange.min, max: selectedPriceRange.max || 999999999 } : undefined,
    });
  };

  const handlePriceRangeSelect = (range: PriceRange) => {
    const updated = selectedPriceRange?.label === range.label ? null : range;
    setSelectedPriceRange(updated);

    onFilterChange({
      brand: selectedBrands.length > 0 ? selectedBrands : undefined,
      priceRange: updated ? { min: updated.min, max: updated.max || 999999999 } : undefined,
    });
  };

  const handleClearAll = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);

    onFilterChange({
      brand: undefined,
      priceRange: undefined,
    });
  };

  const totalFilters = selectedBrands.length + (selectedPriceRange ? 1 : 0);

  return (
    <aside className="bg-white rounded-lg p-6 h-fit sticky top-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">{t('filters.filters')}</h2>
        {totalFilters > 0 && (
          <button
            onClick={handleClearAll}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition"
          >
            {t('filters.clearAll')}
          </button>
        )}
      </div>

      {/* Brand Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-4 hover:text-blue-600 transition"
        >
          <span>{t('filters.brand')}</span>
          <svg
            className={`w-4 h-4 transition ${expandedSections.brand ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {expandedSections.brand && (
          <div className="space-y-3">
            {BRAND_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(option.value)}
                  onChange={() => handleBrandChange(option.value)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700 group-hover:text-blue-600 transition">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex justify-between items-center font-semibold text-gray-900 mb-4 hover:text-blue-600 transition"
        >
          <span>{t('filters.priceRange')}</span>
          <svg
            className={`w-4 h-4 transition ${expandedSections.price ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {expandedSections.price && (
          <div className="space-y-3">
            {PRICE_RANGES_BUTTONS.map((range) => (
              <button
                key={range.label}
                onClick={() => handlePriceRangeSelect(range)}
                className={`w-full py-3 px-4 rounded-lg border-2 font-medium transition text-left ${selectedPriceRange?.label === range.label
                    ? 'bg-blue-50 border-blue-600 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
