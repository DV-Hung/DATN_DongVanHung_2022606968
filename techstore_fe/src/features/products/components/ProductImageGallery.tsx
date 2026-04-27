import React, { useState } from 'react';

interface ProductImageGalleryProps {
  image: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ image }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative w-full aspect-square rounded-lg overflow-hidden ${
          isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
        } bg-gray-100 transition-all duration-300`}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img
          src={image}
          alt="Product"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-200' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : {}
          }
        />

        {/* Zoom Indicator */}
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 bg-black text-white px-3 py-1 rounded text-sm">
            Click to zoom
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
