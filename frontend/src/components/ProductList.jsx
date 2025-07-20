import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import socket from '../utils/socket';
import { productsAPI } from '../services/api';
import { API_CONFIG } from '../config/appConfig';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';

const ProductSkeleton = () => (
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

const ProductList = ({ 
  category = 'all', 
  searchQuery = '',
  sortBy = 'newest',
  priceRange = { min: '', max: '' }
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector(state => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      const params = {
        category: category !== 'all' ? category : undefined,
        search: searchQuery || undefined,
        sortBy: sortBy === 'newest' ? 'createdAt' : sortBy,
        sortOrder: sortBy === 'newest' ? 'desc' : 'asc'
      };
      
      // Add price range filters
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
      
      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      dispatch(fetchProducts(params));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [category, searchQuery, priceRange.min, priceRange.max, sortBy, dispatch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  
  // Debounce function for socket events to prevent excessive API calls
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  // Setup socket listeners separately with an empty dependency array
  // so they're only established once
  useEffect(() => {
    // Instead of directly calling fetchProducts, set a refresh flag
    const handleProductChange = () => setShouldRefresh(true);
    
    // Listen for real-time product updates
    socket.on('productCreated', handleProductChange);
    socket.on('productUpdated', handleProductChange);
    socket.on('productDeleted', handleProductChange);
    
    return () => {
      socket.off('productCreated', handleProductChange);
      socket.off('productUpdated', handleProductChange);
      socket.off('productDeleted', handleProductChange);
    };
  }, []);
  
  // Handle the refresh flag with a 2 second debounce
  useEffect(() => {
    if (shouldRefresh) {
      const timer = setTimeout(() => {
        loadProducts();
        setShouldRefresh(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldRefresh, loadProducts]);

  // Apply client-side sorting
  useEffect(() => {
    if (!products?.length) return;

    console.log('Products received:', products);
    console.log('First product images:', products[0]?.images);

    let sorted = [...products];
    
    switch(sortBy) {
      case 'newest':
        sorted = sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted = sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price_asc':
        sorted = sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted = sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        sorted = sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    setFilteredProducts(sorted);
  }, [products, sortBy]);

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (product) => {
    if (!product.inStock || product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({
      product,
      quantity: 1
    }));
    toast.success(`${product.title} added to cart`);
  };

  // Render loading skeletons
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} hover={false} padding="none" className="flex flex-col h-full">
          <ProductSkeleton />
        </Card>
      ))}
    </div>
  );

  // Render error state
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-red-700">{error}</p>
          <p className="mt-2 text-sm text-red-600">Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    </div>
  );

  // Render empty state
  if (!filteredProducts || filteredProducts.length === 0) return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-yellow-700">No products available</p>
          <p className="mt-2 text-sm text-yellow-600">Try adjusting your filters or check back later.</p>
        </div>
      </div>
    </div>
  );

  // Render product grid
  return (
    <div className="space-y-6">
      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card 
            key={product._id} 
            hover={true}
            padding="none"
            className="flex flex-col h-full"
          >
            <Card.Image 
              src={product.images && product.images[0] ? product.images[0].url : 'https://placehold.co/400x300?text=No+Image'} 
              alt={product.title} 
              aspect="aspect-[4/3]"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.src = 'https://placehold.co/400x300?text=No+Image';
              }}
            />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <Card.Title>{product.title}</Card.Title>
                {product.inStock ? (
                  <Badge variant="success" size="sm">In Stock</Badge>
                ) : (
                  <Badge variant="danger" size="sm">Out of Stock</Badge>
                )}
              </div>
              <div className="text-sm text-gray-600 mb-2 flex-1">
                {product.description ? (
                  <p className="line-clamp-2">{product.description}</p>
                ) : (
                  <p className="italic text-gray-400">No description available</p>
                )}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <CurrencyPrice price={product.price} className="text-lg font-bold text-blue-600" />
                {product.oldPrice && (
                  <CurrencyPrice price={product.oldPrice} className="text-sm text-gray-400 line-through" />
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleViewDetails(product._id)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-shrink-0"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock || product.stock <= 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductList;