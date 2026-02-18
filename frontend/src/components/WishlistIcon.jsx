import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/wishlistSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';

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
      toast.info('Nexus authentication required to synchronize vault');
      return;
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlistAsync(product._id)).unwrap();
        toast.info('Asset purged from vault', { autoClose: 2000 });
      } else {
        await dispatch(addToWishlistAsync(product)).unwrap();
        toast.success('Asset synchronized to vault', { autoClose: 2000 });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Sync protocol failed');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`
        relative flex items-center justify-center transition-colors
        ${isInWishlist
          ? 'text-rose-500'
          : 'text-slate-400 hover:text-rose-400'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className={`${sizeClasses[size]} animate-spin`} />
          </motion.div>
        ) : (
          <motion.div
            key={isInWishlist ? 'active' : 'inactive'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Heart
              className={`${sizeClasses[size]} ${isInWishlist ? 'fill-current' : ''}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default WishlistIcon;
