import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/wishlistSlice';
import { toast } from 'react-toastify';

const WishlistIcon = ({ product, className = '', size = 'md' }) => {
  const { user, token } = useSelector(state => state.user);
  const isAuthenticated = user && token;
  const { items: wishlistItems, loading } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();

  const isInWishlist = wishlistItems.some(item => item._id === product._id);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast.info('Please sign in to add items to your wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await dispatch(removeFromWishlistAsync(product._id)).unwrap();
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        await dispatch(addToWishlistAsync(product)).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error || 'Failed to update wishlist');
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`
        relative transition-all duration-200 transform hover:scale-110
        ${isInWishlist 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-400'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <svg className={`${sizeClasses[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg 
          className={`${sizeClasses[size]} ${isInWishlist ? 'fill-current' : ''}`} 
          fill={isInWishlist ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      )}
      
      {/* Animated heart effect */}
      {isInWishlist && (
        <div className="absolute inset-0 pointer-events-none">
          <svg 
            className={`${sizeClasses[size]} text-red-500 animate-pulse`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      )}
    </button>
  );
};

export default WishlistIcon;
