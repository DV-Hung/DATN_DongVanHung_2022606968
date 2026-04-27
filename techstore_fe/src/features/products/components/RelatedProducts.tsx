import React, { useMemo } from 'react';
import { ProductCard } from '../../../shared/components';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../../shared/types';

interface RelatedProductsProps {
  currentProductId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId }) => {
  const { products } = useProducts();

  // Get related products (exclude current product and limit to 4)
  const relatedProducts = useMemo(() => {
    return products
      .filter((p: Product) => p.id !== currentProductId)
      .slice(0, 4);
  }, [products, currentProductId]);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <a
          href="/products"
          className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
        >
          View All →
        </a>
      </div>
    </div>
  );
};

export default RelatedProducts;
