import React from 'react';

interface ProductDescriptionProps {
  description: string;
  specifications?: {
    processor?: string;
    memory?: string;
    storage?: string;
    display?: string;
    inStock?: boolean;
  };
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  specifications,
}) => {
  return (
    <div className="border-t border-gray-200">
      {/* Description Section */}
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>

        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
          {description.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>


      </div>
    </div>
  );
};

export default ProductDescription;
