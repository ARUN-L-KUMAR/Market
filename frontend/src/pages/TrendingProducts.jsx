import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CurrencyPrice from '../components/CurrencyPrice';

const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const [timeFilter, setTimeFilter] = useState('week');

  useEffect(() => {
    fetchProducts();
  }, [timeFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Fetch all products
      const response = await axios.get(`${apiUrl}/api/products?limit=50`);
      const products = response.data.products || [];
      
      // Mock trending data based on views, orders, and ratings
      const productsWithTrending = products.map((product, index) => ({
        ...product,
        views: Math.floor(Math.random() * 10000) + 100,
        orders: Math.floor(Math.random() * 500) + 10,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0 rating
        reviewCount: Math.floor(Math.random() * 200) + 5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercentage: Math.floor(Math.random() * 50) + 10,
        addedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        isNew: index < 12, // First 12 products are "new"
        category: product.category || ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty'][index % 5]
      }));

      // Sort by trending score (combination of views, orders, and ratings)
      const trending = productsWithTrending
        .map(product => ({
          ...product,
          trendingScore: (product.views * 0.3) + (product.orders * 50) + (parseFloat(product.rating) * 100)
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 24);

      // New arrivals (products added in last 7 days)
      const newProducts = productsWithTrending
        .filter(product => product.isNew)
        .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
        .slice(0, 16);

      setTrendingProducts(trending);
      setNewArrivals(newProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <span className="text-green-500">📈</span> : 
      <span className="text-red-500">📉</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeFilterText = () => {
    switch(timeFilter) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'This Week';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          📈 Trending & New
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover what's hot and what's new in our collection
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'trending'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔥 Trending Now
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'new'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✨ New Arrivals
          </button>
        </div>
      </div>

      {/* Trending Tab */}
      {activeTab === 'trending' && (
        <div>
          {/* Time Filter for Trending */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              Trending Products - {getTimeFilterText()}
            </h2>
            <div className="flex gap-2">
              {['day', 'week', 'month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'day' ? 'Today' : filter === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Most Viewed</p>
                  <p className="text-2xl font-bold">{trendingProducts[0]?.views?.toLocaleString()}</p>
                </div>
                <div className="text-3xl">👁️</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Top Orders</p>
                  <p className="text-2xl font-bold">{trendingProducts[0]?.orders}</p>
                </div>
                <div className="text-3xl">🛒</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Highest Rated</p>
                  <p className="text-2xl font-bold">{trendingProducts[0]?.rating}⭐</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Trending Items</p>
                  <p className="text-2xl font-bold">{trendingProducts.length}</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>
          </div>

          {/* Top 3 Trending Products - Featured */}
          <div className="mb-12">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 Top 3 Trending</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingProducts.slice(0, 3).map((product, index) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
                  {/* Rank Badge */}
                  <div className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Trending Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    {getTrendIcon(product.trend)}
                    {product.trendPercentage}%
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                      alt={product.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary-600">
                        <CurrencyPrice price={product.price} />
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.views?.toLocaleString()} views
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/products/${product._id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Trending Products Grid */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">All Trending Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(3).map((product, index) => (
                <div key={product._id} className="bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  {/* Trend Indicator */}
                  <div className="absolute top-3 right-3 z-10 bg-white/90 rounded-full p-1 flex items-center gap-1">
                    {getTrendIcon(product.trend)}
                    <span className="text-xs font-bold">{product.trendPercentage}%</span>
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviewCount})</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary-600">
                        <CurrencyPrice price={product.price} />
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.orders} sold
                      </span>
                    </div>

                    <Link to={`/products/${product._id}`}>
                      <Button size="sm" className="w-full">
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Arrivals Tab */}
      {activeTab === 'new' && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              ✨ Fresh Arrivals
            </h2>
            <div className="text-sm text-gray-600">
              {newArrivals.length} new products this week
            </div>
          </div>

          {/* New Arrivals Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 mb-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              🎉 Just Arrived!
            </h3>
            <p className="text-lg mb-6 text-indigo-100">
              Be the first to discover our latest additions
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">{newArrivals.length}</div>
                <div className="text-sm text-indigo-200">New Items</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-indigo-200">Categories</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">24h</div>
                <div className="text-sm text-indigo-200">Fresh</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl font-bold">🔥</div>
                <div className="text-sm text-indigo-200">Hot</div>
              </div>
            </div>
          </div>

          {/* New Arrivals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
                {/* New Badge */}
                <div className="absolute top-3 left-3 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  NEW
                </div>
                
                {/* Date Added */}
                <div className="absolute top-3 right-3 z-10 bg-white/90 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {formatDate(product.addedDate)}
                </div>

                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {typeof product.category === 'object' ? product.category?.name : product.category}
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-600">
                      <CurrencyPrice price={product.price} />
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Just Added
                    </span>
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <Button size="sm" className="w-full">
                      Explore
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">
          🔔 Stay Updated!
        </h3>
        <p className="text-lg mb-6 text-orange-100">
          Get notified about trending products and new arrivals
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-800"
          />
          <Button className="bg-white text-orange-600 hover:bg-gray-100">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TrendingProducts;
