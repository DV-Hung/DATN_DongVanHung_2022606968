import React, { useState, useEffect } from 'react';
import { Variant } from '../../../shared/types';

interface VariantFormProps {
  variant?: Variant;
  onSave: (variant: Variant) => void;
  onCancel: () => void;
  colors?: string[];
  storageOptions?: string[];
}

export const VariantForm: React.FC<VariantFormProps> = ({
  variant,
  onSave,
  onCancel,
  colors = ['Gray', 'Blue', 'Titanium', 'Black', 'White', 'Gold'],
  storageOptions = ['256GB', '512GB', '1TB'],
}) => {
  const [formData, setFormData] = useState<Variant>(
    variant || {
      id: Date.now().toString(),
      sku: '',
      color: '',
      storage: '',
      attributes: {},
      retailPrice: 0,
      costPrice: 0,
      initialStock: 0,
      currentStock: 0,
      isActive: true,
      image: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>(variant?.image || '');

  useEffect(() => {
    if (variant) {
      setFormData(variant);
      setImagePreview(variant.image || '');
    }
  }, [variant]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.color) newErrors.color = 'Color is required';
    if (!formData.storage) newErrors.storage = 'Storage is required';
    if (formData.retailPrice <= 0) newErrors.retailPrice = 'Retail price must be greater than 0';
    if (formData.initialStock < 0) newErrors.initialStock = 'Initial stock cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setImagePreview(imageData);
        handleInputChange('image', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof Variant, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {variant ? 'Edit Variant' : 'Define New Variant'}
        </h2>

        <div className="space-y-6">
          {/* Variant Attributes Section */}
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">VARIANT ATTRIBUTES</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <select
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.color ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Capacity</label>
                <div className="flex gap-2 flex-wrap">
                  {storageOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInputChange('storage', option)}
                      className={`px-4 py-2 rounded-lg font-medium border-2 transition-colors ${formData.storage === option
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {errors.storage && <p className="text-red-500 text-xs mt-1">{errors.storage}</p>}
              </div>
            </div>
          </div>

          {/* Logistics & Pricing Section */}
          <div className="border-l-4 border-amber-600 pl-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">LOGISTICS & PRICING</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Merchant SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., ARCH-PH-V4-001"
                />
                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retail Price (đ)</label>
                  <input
                    type="number"
                    value={formData.retailPrice}
                    onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.retailPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="0"
                    step="1000"
                  />
                  {errors.retailPrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.retailPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price (đ)</label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => handleInputChange('initialStock', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.initialStock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.initialStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.initialStock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  In Production
                </label>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">VARIANT IMAGE</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Product Image</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="flex items-center justify-center px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">📁 Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            handleInputChange('image', '');
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
          >
            {variant ? 'Update Variant' : 'Save/Add Variant'}
          </button>
        </div>
      </div>
    </div>
  );
};
