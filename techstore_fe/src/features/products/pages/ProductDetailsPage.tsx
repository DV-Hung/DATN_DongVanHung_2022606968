import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Footer, Breadcrumb } from '../../../shared/components';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductInfo from '../components/ProductInfo';
import ProductDescription from '../components/ProductDescription';
import RelatedProducts from '../components/RelatedProducts';
import { Product, Variant } from '../../../shared/types';
import { apiClient } from '../../../services/api';

interface ProductDetailsPageProps {
  product?: Product;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ product: initialProduct }) => {
  const { id } = useParams<{ id: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [displayImage, setDisplayImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  // Fetch product by ID from API
  useEffect(() => {
    if (!id) {
      setError('Product ID not found');
      setIsLoading(false);
      return;
    }

    // If we have initialProduct, use it and don't fetch
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      // Set initial display image from first variant
      const firstVariantImage = initialProduct.variants && initialProduct.variants.length > 0
        ? initialProduct.variants[0].image || '/placeholder.jpg'
        : initialProduct.image || '/placeholder.jpg';
      setDisplayImage(firstVariantImage);
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getProductById(id);
        const productData = response.data?.data;

        if (!productData) {
          setError('Product not found');
          setIsLoading(false);
          return;
        }

        // Map API response to Product type
        const firstVariantImage = productData.variants && productData.variants.length > 0
          ? productData.variants[0].imageUrl
          : '/placeholder.jpg';

        setDisplayImage(firstVariantImage);

        const inStock = productData.totalStock > 0;

        const product: Product = {
          id: productData.id?.toString(),
          name: productData.name,
          price: productData.price ? parseFloat(productData.price) : 0,
          image: firstVariantImage,
          brand: productData.brandName || 'Unknown',
          description: productData.description || '',
          category: productData.categoryName || '',
          inStock: inStock,
          variants: (productData.variants || []).map((v: any) => ({
            id: v.id?.toString() || '',
            sku: v.sku || '',
            color: v.color,
            storage: v.rom,
            attributes: {},
            retailPrice: v.price ? parseFloat(v.price) : 0,
            initialStock: v.stockQuantity || 0,
            currentStock: v.stockQuantity || 0,
            image: v.imageUrl,
            isActive: true,
          })),
        };

        setSelectedProduct(product);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, initialProduct]);

  const [quantity, setQuantity] = useState(1);

  const handleVariantChange = (variant: Variant) => {
    // Update display image when variant changes
    if (variant.image) {
      setDisplayImage(variant.image);
    }
  };

  const breadcrumbs = selectedProduct ? [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: selectedProduct.category, path: `/products?category=${selectedProduct.category}` },
    { label: selectedProduct.name },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Back to Home
            </a>
          </div>
        </div>
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Product Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Left: Image Gallery */}
            <ProductImageGallery image={displayImage} />

            {/* Right: Product Info */}
            <ProductInfo
              product={selectedProduct}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onVariantChange={handleVariantChange}
            />
          </div>

          {/* Description Section */}
          <ProductDescription
            description={selectedProduct.description}
            specifications={{
              processor: selectedProduct.processor,
              memory: selectedProduct.memory,
              storage: selectedProduct.storage,
              display: selectedProduct.display,
              inStock: selectedProduct.inStock,
            }}
          />
        </div>

        {/* Related Products Section */}
        <RelatedProducts currentProductId={selectedProduct.id} />
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
