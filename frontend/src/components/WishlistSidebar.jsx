import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, removeFromWishlistAsync } from '../store/wishlistSlice';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';

const WishlistSidebar = ({ isOpen, onClose }) => {
  const { token, user } = useSelector(state => state.user);
  const isAuthenticated = user && token;
  const { items: wishlistItems, loading } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen && isAuthenticated && token) {
      dispatch(fetchWishlist());
    }
  }, [isOpen, isAuthenticated, token, dispatch]);

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromWishlistAsync(productId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error || 'Failed to remove from wishlist');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                My Wishlist
                {wishlistItems.length > 0 && (
                  <Badge color="primary" size="sm" className="ml-2">
                    {wishlistItems.length}
                  </Badge>
                )}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No items in wishlist</h3>
                <p className="text-xs text-gray-500 mb-4">Start adding products you love!</p>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {wishlistItems.filter(item => item && item._id).map(item => (
                  <div key={item._id} className="flex gap-3 group">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.images?.[0]?.url || 'https://placehold.co/64x64?text=No+Image'}
                        alt={item.title || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                        onError={e => { e.target.src = 'https://placehold.co/64x64?text=No+Image'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.title || 'Untitled Product'}
                      </h3>
                      <span className="text-sm font-bold text-primary-600">
                        <CurrencyPrice price={item.price || 0} />
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge 
                          color={item.inStock ? 'success' : 'danger'} 
                          size="xs"
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => window.location.href = `/products/${item._id}`}
                        className="text-xs text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {wishlistItems.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  onClose();
                  window.location.href = '/wishlist';
                }}
              >
                View Full Wishlist
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistSidebar;
