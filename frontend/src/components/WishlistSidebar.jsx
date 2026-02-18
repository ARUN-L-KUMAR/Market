import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, removeFromWishlistAsync } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Package,
  Star,
  Zap
} from 'lucide-react';

const WishlistSidebar = ({ isOpen, onClose }) => {
  const { token, user } = useSelector(state => state.user);
  const isAuthenticated = user && token;
  const { items: wishlistItems, loading } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({ product: item, quantity: 1 }));
    toast.success(`${item.title} added to cart`, {
      icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />
    });
  };

  const handleViewProduct = (id) => {
    onClose();
    navigate(`/products/${id}`);
  };

  const handleViewWishlist = () => {
    onClose();
    navigate('/wishlist');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[420px] max-w-[95vw] z-[201] flex flex-col bg-white shadow-2xl"
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest font-outfit">
                    Wishlist
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'Asset' : 'Assets'} Saved
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── CONTENT ── */}
            <div className="flex-1 overflow-y-auto">

              {/* Loading State */}
              {loading && (
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                        <div className="h-4 bg-slate-100 rounded-full w-1/3 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && wishlistItems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full px-8 py-20 text-center space-y-6"
                >
                  <div className="relative">
                    <div className="p-8 bg-slate-50 rounded-full">
                      <Heart className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="absolute -top-1 -right-1 p-2 bg-slate-950 rounded-xl shadow-lg">
                      <Zap className="w-3.5 h-3.5 text-primary-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter font-outfit">
                      No Saved Assets
                    </h3>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[200px]">
                      Browse the catalogue and save items you love for later.
                    </p>
                  </div>
                  <button
                    onClick={() => { onClose(); navigate('/products'); }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors"
                  >
                    Browse Catalogue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* Items List */}
              {!loading && wishlistItems.length > 0 && (
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {wishlistItems.filter(item => item && item._id).map((item, idx) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-premium transition-all duration-300"
                      >
                        {/* Product Image */}
                        <div
                          className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 cursor-pointer"
                          onClick={() => handleViewProduct(item._id)}
                        >
                          <img
                            src={item.images?.[0]?.url || 'https://placehold.co/80x80?text=No+Image'}
                            alt={item.title || 'Product'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={e => { e.target.src = 'https://placehold.co/80x80?text=No+Image'; }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Category */}
                          <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">
                            {item.categoryName || item.brand || 'Product'}
                          </span>

                          {/* Title */}
                          <h3
                            className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight cursor-pointer hover:text-primary-600 transition-colors"
                            onClick={() => handleViewProduct(item._id)}
                          >
                            {item.title || 'Untitled Product'}
                          </h3>

                          {/* Price */}
                          <CurrencyPrice
                            price={item.price || 0}
                            variant="nexus"
                            weight="bold"
                            size="md"
                            showDecimals={false}
                          />

                          {/* Rating + Stock */}
                          <div className="flex items-center gap-3">
                            {item.rating?.average > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-bold text-slate-500">
                                  {item.rating.average.toFixed(1)}
                                </span>
                              </div>
                            )}
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.stock > 0
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-rose-50 text-rose-600'
                              }`}>
                              {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.stock || item.stock <= 0}
                            className="p-2 bg-slate-950 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            {!loading && wishlistItems.length > 0 && (
              <div className="border-t border-slate-100 p-4 space-y-3">
                {/* Summary */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Total Value
                  </span>
                  <CurrencyPrice
                    price={wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0)}
                    variant="nexus"
                    size="lg"
                    weight="bold"
                    showDecimals={false}
                  />
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleViewWishlist}
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-50 text-slate-900 border border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    View All
                  </button>
                  <button
                    onClick={() => {
                      wishlistItems.filter(i => i.stock > 0).forEach(item => {
                        dispatch(addToCart({ product: item, quantity: 1 }));
                      });
                      toast.success('All available items added to cart!');
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-lg"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add All
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistSidebar;
