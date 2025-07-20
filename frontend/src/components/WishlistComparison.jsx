import React, { useState } from 'react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';

const WishlistComparison = ({ products, onClose, onAddToCart }) => {
  const [selectedProducts, setSelectedProducts] = useState(products.slice(0, 3));

  if (!products || products.length === 0) {
    return null;
  }

  const handleProductSelect = (product) => {
    if (selectedProducts.find(p => p._id === product._id)) {
      setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
    } else if (selectedProducts.length < 3) {
      setSelectedProducts(prev => [...prev, product]);
    } else {
      toast.warning('You can compare up to 3 products at once');
    }
  };

  const getComparisonData = () => {
    if (selectedProducts.length === 0) return [];

    const features = [
      { key: 'price', label: 'Price', formatter: (value) => <CurrencyPrice price={value || 0} /> },
      { key: 'inStock', label: 'Availability', formatter: (value) => value ? 'In Stock' : 'Out of Stock' },
      { key: 'stock', label: 'Quantity Available', formatter: (value) => value || 'N/A' },
      { key: 'category', label: 'Category', formatter: (value) => {
        if (typeof value === 'object') return value?.name || 'N/A';
        return value || 'N/A';
      }},
      { key: 'brand', label: 'Brand', formatter: (value) => value || 'N/A' },
      { key: 'rating', label: 'Rating', formatter: (value) => {
        const rating = value || 0;
        return `${rating.toFixed(1)} ⭐`;
      }},
      { key: 'reviews', label: 'Reviews', formatter: (value) => `${value?.length || 0} reviews` }
    ];

    return features;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Compare Products</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Product Selection */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-3">Select up to 3 products to compare:</p>
            <div className="flex flex-wrap gap-2">
              {products.map(product => (
                <button
                  key={product._id}
                  onClick={() => handleProductSelect(product)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedProducts.find(p => p._id === product._id)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {product.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-auto max-h-[70vh]">
          {selectedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Select products to start comparing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 border-b border-gray-200 w-48">Feature</th>
                    {selectedProducts.map(product => (
                      <th key={product._id} className="text-center p-4 border-b border-gray-200 min-w-64">
                        <div className="flex flex-col items-center">
                          <img
                            src={product.images?.[0]?.url || 'https://placehold.co/120x120?text=No+Image'}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg mb-2"
                          />
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {product.title}
                          </h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getComparisonData().map(feature => (
                    <tr key={feature.key} className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700">{feature.label}</td>
                      {selectedProducts.map(product => (
                        <td key={product._id} className="p-4 text-center">
                          <span className={`${
                            feature.key === 'inStock' 
                              ? product[feature.key] ? 'text-green-600' : 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            {feature.formatter(product[feature.key])}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        {selectedProducts.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Comparing {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3">
                {selectedProducts.map(product => (
                  <div key={product._id} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{product.title}</p>
                    <Button
                      size="sm"
                      variant={product.inStock ? 'primary' : 'disabled'}
                      disabled={!product.inStock}
                      onClick={() => product.inStock && onAddToCart(product)}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistComparison;
