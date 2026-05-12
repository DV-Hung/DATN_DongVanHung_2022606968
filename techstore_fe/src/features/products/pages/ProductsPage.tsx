import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Header,
  Footer,
  FilterSidebar,
  ProductCard,
  Pagination,
  Breadcrumb,
  Toast,
} from '../../../shared/components';
import { ProductFilter, Product } from '../../../shared/types';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';
import { apiClient } from '../../../services/api';

interface CategoryMap {
  [key: string]: { id: number; label: string };
}

const CATEGORY_MAP: CategoryMap = {
  laptops: { id: 1, label: 'navigation.laptops' },
  mobile: { id: 2, label: 'navigation.mobile' },
  accessories: { id: 3, label: 'navigation.accessories' },
};

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract category from URL path
  const getCategory = () => {
    const pathParts = location.pathname.split('/');
    return pathParts[2] || 'laptops';
  };

  const category = getCategory();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('price-low');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Clear search when category changes
  useEffect(() => {
    setSearchQuery('');
  }, [category]);

  // Get category info
  const categoryInfo = CATEGORY_MAP[category] || CATEGORY_MAP.laptops;

  // Fetch products by category with filters - SERVER-SIDE filtering AND sorting
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Always fetch by category, apply search filter if exists
        const params: any = {
          page: currentPage - 1, // Server expects 0-based page index
          size: DEFAULT_PAGE_SIZE,
          sortBy: sortBy, // Add sort parameter to server
        };

        // Add search query if exists
        if (searchQuery.trim()) {
          params.name = searchQuery;
        }

        // Add price range filter
        if (filters.priceRange) {
          params.minPrice = filters.priceRange.min;
          params.maxPrice = filters.priceRange.max;
        }

        // Add brand filter (by brand name, not id)
        if (filters.brand && filters.brand.length > 0) {
          params.brandNames = filters.brand.join(',');
        }

        // Call API with category (always search within category)
        const response = await apiClient.getProductsByCategory(categoryInfo.id, params);

        const data = response.data?.data || {};
        let productList: Product[] = [];

        if (data.content && Array.isArray(data.content)) {
          productList = data.content.map((p: any) => {
            // Get image from first variant, or use placeholder
            const firstVariantImage = p.variants && p.variants.length > 0
              ? p.variants[0].imageUrl
              : '/placeholder.jpg';

            // Check if in stock
            const inStock = p.totalStock > 0;

            return {
              id: p.id,
              name: p.name,
              price: p.price ? parseFloat(p.price) : 0,
              image: firstVariantImage,
              badge: undefined,
              rating: 0,
              reviews: 0,
              brand: p.brandName || 'Unknown',
              inStock: inStock,
            };
          });
        }

        setProducts(productList);
        setTotalProducts(data.totalElements || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, categoryInfo.id, currentPage, filters, searchQuery, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / DEFAULT_PAGE_SIZE);

  // Handle filter change - RESET to page 1 and fetch new data
  const handleFilterChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleAddToCart = (product: Product, variant?: any) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header onSearchChange={handleSearch} />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('navigation.home'), path: '/' },
          { label: t(categoryInfo.label) },
        ]}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t(categoryInfo.label)}
            </h1>
          </div>

          {/* Filters and Products Container */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Hidden on mobile, shown as overlay */}
            <div className="hidden lg:block">
              <FilterSidebar onFilterChange={handleFilterChange} />
            </div>

            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Sort Bar */}
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {products.length > 0 ? (
                    t('products.showing', {
                      from: (currentPage - 1) * DEFAULT_PAGE_SIZE + 1,
                      to: Math.min(currentPage * DEFAULT_PAGE_SIZE, totalProducts),
                      total: totalProducts,
                    })
                  ) : (
                    t('products.noProducts')
                  )}
                </p>

                <div className="flex items-center gap-3">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                    {t('products.sortBy')}
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="price-low">{t('products.priceLowToHigh')}</option>
                    <option value="price-high">{t('products.priceHighToLow')}</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <div className="inline-block">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600">{t('products.loadingProducts')}</p>
                  </div>
                </div>
              )}

              {/* No Results State */}
              {!isLoading && products.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 103 10.5a7.5 7.5 0 0114.15 4.65z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('products.noProducts')}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {t('products.tryAdjusting')}
                  </p>
                </div>
              )}

              {/* Products Grid */}
              {!isLoading && products.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      isLoading={isLoading}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
