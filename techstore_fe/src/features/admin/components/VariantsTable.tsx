import React from 'react';
import { Variant } from '../../../shared/types';

interface VariantsTableProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (variantId: string) => void;
}

export const VariantsTable: React.FC<VariantsTableProps> = ({
  variants,
  onEdit,
  onDelete,
}) => {
  if (variants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg">No variants yet. Create your first variant to get started.</p>
      </div>
    );
  }

  const getStockStatusColor = (stock: number) => {
    if (stock > 50) return 'bg-green-50 border-green-200';
    if (stock > 20) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStockStatusText = (stock: number) => {
    if (stock > 50) return 'text-green-700';
    if (stock > 20) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <input type="checkbox" className="w-4 h-4 rounded" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Variant Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Attributes
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pricing
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {variants.map((variant) => (
              <tr
                key={variant.id}
                className={`hover:bg-gray-50 border-l-4 ${variant.isActive ? 'border-blue-500' : 'border-gray-300'
                  }`}
              >
                <td className="px-6 py-4">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {variant.image ? (
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                        <img
                          src={variant.image}
                          alt={`${variant.color} ${variant.storage}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">
                        📦
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {variant.color} / {variant.storage}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {variant.isActive ? 'In Production' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-700">{variant.sku}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {variant.color}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {variant.storage}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{Math.round(variant.retailPrice).toLocaleString('vi-VN')}đ</p>
                    {variant.costPrice && (
                      <p className="text-xs text-gray-500">Cost: {Math.round(variant.costPrice).toLocaleString('vi-VN')}đ</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`px-3 py-2 rounded-lg border ${getStockStatusColor(variant.currentStock)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${getStockStatusText(variant.currentStock)}`}>
                        {variant.currentStock} units
                      </span>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${variant.currentStock > 50
                            ? 'bg-green-500'
                            : variant.currentStock > 20
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        style={{ width: `${Math.min((variant.currentStock / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEdit(variant)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit variant"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${variant.color} / ${variant.storage}?`
                          )
                        ) {
                          onDelete(variant.id);
                        }
                      }}
                      className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete variant"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {variants.length} variant{variants.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-4">
          <div className="text-sm">
            <span className="text-gray-600">Total Stock: </span>
            <span className="font-semibold text-gray-900">
              {variants.reduce((sum, v) => sum + v.currentStock, 0)} units
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Active: </span>
            <span className="font-semibold text-gray-900">{variants.filter((v) => v.isActive).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
