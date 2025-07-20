import React from 'react';

/**
 * Skeleton UI component for loading states
 * 
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Type of skeleton (text, circle, rectangle)
 * @param {number} height - Height in pixels or CSS value (eg: "100%")
 * @param {number} width - Width in pixels or CSS value (eg: "100%")
 * @param {number} count - Number of skeleton items to render
 */
const Skeleton = ({ 
  className = '', 
  variant = 'rectangle',
  height = 20,
  width = '100%',
  count = 1
}) => {
  const getVariantClasses = () => {
    switch(variant) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded';
      case 'rectangle':
      default:
        return 'rounded-md';
    }
  };

  const containerStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  const renderSkeletons = () => {
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`bg-gray-200 animate-pulse ${getVariantClasses()} ${className}`}
        style={containerStyle}
      ></div>
    ));
  };

  return (
    <div className="space-y-2">
      {renderSkeletons()}
    </div>
  );
};

/**
 * Product Card Skeleton
 */
export const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-300 rounded-t-xl mb-4"></div>
    <div className="px-4 pb-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-full mb-4"></div>
      <div className="h-5 bg-gray-300 rounded w-1/4 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-300 rounded w-full"></div>
        <div className="h-8 bg-gray-300 rounded w-12"></div>
      </div>
    </div>
  </div>
);

/**
 * Product Details Skeleton
 */
export const ProductDetailsSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
    <div className="h-96 bg-gray-300 rounded-xl"></div>
    <div className="space-y-6">
      <div className="h-8 bg-gray-300 rounded w-3/4"></div>
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

/**
 * Order Summary Skeleton
 */
export const OrderSummarySkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex justify-between">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/6"></div>
      </div>
    ))}
    <div className="h-px bg-gray-300 w-full my-2"></div>
    <div className="flex justify-between">
      <div className="h-5 bg-gray-300 rounded w-1/4"></div>
      <div className="h-5 bg-gray-300 rounded w-1/6"></div>
    </div>
  </div>
);

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 4, rows = 3 }) => (
  <div className="animate-pulse space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="grid grid-cols-12 gap-4">
        {[...Array(columns)].map((_, j) => (
          <div
            key={j}
            className="h-6 bg-gray-300 rounded"
            style={{ gridColumn: `span ${Math.floor(12 / columns)} / span ${Math.floor(12 / columns)}` }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
