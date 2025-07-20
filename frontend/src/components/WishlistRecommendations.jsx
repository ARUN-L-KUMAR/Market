import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import WishlistIcon from './WishlistIcon';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';

const WishlistRecommendations = ({ wishlistItems = [] }) => {
  const { token, user } = useSelector(state => state.user);
  const isAuthenticated = user && token;
  const dispatch = useDispatch();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('similar');

  useEffect(() => {
    if (wishlistItems.length > 0 && isAuthenticated) {
      fetchRecommendations();
    }
  }, [wishlistItems, isAuthenticated, selectedCategory]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Get product IDs from wishlist
      const productIds = wishlistItems
        .filter(item => item && item.product && item.product._id)
        .map(item => item.product._id);
      if (!productIds.length && selectedCategory !== 'trending' && selectedCategory !== 'price-drop') {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      let endpoint = '';
      let params = {};
      
      switch (selectedCategory) {
        case 'similar':
          endpoint = '/api/products/recommendations/similar';
          params = { productIds: productIds.join(',') };
          break;
        case 'frequently-bought':
          endpoint = '/api/products/recommendations/frequently-bought-together';
          params = { productIds: productIds.join(',') };
          break;
        case 'trending':
          endpoint = '/api/products/recommendations/trending';
          break;
        case 'price-drop':
          endpoint = '/api/products/recommendations/price-drops';
          break;
        default:
          endpoint = '/api/products/recommendations/similar';
          params = { productIds: productIds.join(',') };
      }

      const response = await axios.get(`${apiUrl}${endpoint}`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecommendations(response.data.products || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to general products if recommendation API fails
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${apiUrl}/api/products?limit=8&sortBy=rating&sortOrder=desc`);
        setRecommendations(response.data.products || []);
      } catch (fallbackError) {
        console.error('Error fetching fallback products:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!product.inStock) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({
      product,
      quantity: 1
    }));
    toast.success(`${product.title} added to cart`);
  };

  if (!isAuthenticated || wishlistItems.length === 0) {
    return null;
  }

  const categories = [
    { id: 'similar', label: 'Similar Products', icon: '🔍' },
    { id: 'frequently-bought', label: 'Frequently Bought Together', icon: '🛒' },
    { id: 'trending', label: 'Trending Now', icon: '🔥' },
    { id: 'price-drop', label: 'Price Drops', icon: '💰' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Recommended for You</h3>
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No recommendations available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.slice(0, 8).filter(product => product && product._id).map(product => (
            <Card key={product._id} hover padding="none" className="relative group">
              {/* Discount Badge */}
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge color="danger" size="sm">
                    {product.discount}% OFF
                  </Badge>
                </div>
              )}

              {/* Wishlist Icon */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-white/90 p-1 rounded-full shadow-sm">
                  <WishlistIcon product={product} size="sm" />
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden rounded-t-xl">
                <img
                  src={product.images?.[0]?.url || 'https://placehold.co/300x300?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = 'https://placehold.co/300x300?text=No+Image'; }}
                />
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                  {product.title}
                </h4>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.reviews?.length || 0})
                    </span>
                  </div>
                  
                  {!product.inStock && (
                    <Badge color="danger" size="xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    {product.discount > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-primary-600">
                          <CurrencyPrice price={product.price * (1 - product.discount / 100)} />
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          <CurrencyPrice price={product.price} />
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-primary-600">
                        <CurrencyPrice price={product.price} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="xs"
                    variant="primary"
                    fullWidth
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex items-center justify-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {product.inStock ? 'Add' : 'Unavailable'}
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => window.location.href = `/products/${product._id}`}
                    className="px-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistRecommendations;
