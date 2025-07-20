import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Card from './ui/Card';
import Badge from './ui/Badge';

const WishlistAnalytics = () => {
  const { token, user } = useSelector(state => state.user);
  const isAuthenticated = user && token;
  const [analytics, setAnalytics] = useState({
    totalItems: 0,
    totalValue: 0,
    avgPrice: 0,
    inStockItems: 0,
    outOfStockItems: 0,
    categoryBreakdown: {},
    priceRanges: {
      under25: 0,
      '25to50': 0,
      '50to100': 0,
      over100: 0
    },
    addedThisWeek: 0,
    addedThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAnalytics();
    }
  }, [isAuthenticated, token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${apiUrl}/api/wishlist/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist analytics:', error);
      // Set default analytics if there's an error
      setAnalytics({
        totalItems: 0,
        totalValue: 0,
        avgPrice: 0,
        inStockItems: 0,
        outOfStockItems: 0,
        categoryBreakdown: {},
        priceRanges: {
          under25: 0,
          '25to50': 0,
          '50to100': 0,
          over100: 0
        },
        addedThisWeek: 0,
        addedThisMonth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryChartData = () => {
    if (!analytics.categoryBreakdown) return [];
    
    const categories = Object.entries(analytics.categoryBreakdown);
    const total = categories.reduce((sum, [, count]) => sum + count, 0);
    
    return categories.map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0
    }));
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Items */}
      <Card className="text-center">
        <div className="text-3xl font-bold text-primary-600 mb-2">
          {analytics.totalItems}
        </div>
        <div className="text-sm text-gray-600">Total Items</div>
      </Card>

      {/* Total Value */}
      <Card className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">
          ${(analytics.totalValue && !isNaN(analytics.totalValue)) ? analytics.totalValue.toFixed(2) : '0.00'}
        </div>
        <div className="text-sm text-gray-600">Total Value</div>
      </Card>

      {/* Average Price */}
      <Card className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          ${(analytics.avgPrice && !isNaN(analytics.avgPrice)) ? analytics.avgPrice.toFixed(2) : '0.00'}
        </div>
        <div className="text-sm text-gray-600">Average Price</div>
      </Card>

      {/* Stock Status */}
      <Card className="text-center">
        <div className="flex justify-center gap-4 mb-2">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {analytics.inStockItems}
            </div>
            <div className="text-xs text-gray-600">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">
              {analytics.outOfStockItems}
            </div>
            <div className="text-xs text-gray-600">Out of Stock</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">Stock Status</div>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(analytics.categoryBreakdown).length > 0 && (
        <Card className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="space-y-2">
            {getCategoryChartData().map(({ category, count, percentage }) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge color="primary" size="sm">
                    {typeof category === 'object' ? category?.name || 'Unknown' : category}
                  </Badge>
                  <span className="text-sm text-gray-600">{count} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Price Ranges */}
      <Card className="md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {analytics.priceRanges.under25}
            </div>
            <div className="text-sm text-gray-600">Under $25</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {analytics.priceRanges['25to50']}
            </div>
            <div className="text-sm text-gray-600">$25 - $50</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {analytics.priceRanges['50to100']}
            </div>
            <div className="text-sm text-gray-600">$50 - $100</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800">
              {analytics.priceRanges.over100}
            </div>
            <div className="text-sm text-gray-600">Over $100</div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="text-center">
        <div className="space-y-2">
          <div>
            <div className="text-xl font-bold text-purple-600">
              {analytics.addedThisWeek}
            </div>
            <div className="text-sm text-gray-600">Added This Week</div>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-600">
              {analytics.addedThisMonth}
            </div>
            <div className="text-sm text-gray-600">Added This Month</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WishlistAnalytics;
