import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWishlist, removeFromWishlistAsync, addToWishlistAsync } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import CurrencyPrice from '../components/CurrencyPrice';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import WishlistRecommendations from '../components/WishlistRecommendations';

const EmptyWishlist = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-40 h-40 mx-auto"
        >
          <div className="absolute inset-0 bg-rose-50 rounded-full animate-ping opacity-20" />
          <div className="relative w-full h-full bg-white rounded-full shadow-premium flex items-center justify-center border border-slate-50">
            <Heart className="w-16 h-16 text-rose-200" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-outfit tracking-tight">
            Vault <span className="text-rose-500">Empty</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Your collection of curated desires is currently empty. Begin indexing your next primary targets.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate('/products')}
            className="h-14 px-10 bg-slate-950 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary-600/20 flex items-center gap-3 mx-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </button>
        </div>
      </div>
    </div>
  );
};

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector(state => state.user);
  const { items: wishlistItems, loading } = useSelector(state => state.wishlist);
  const isAuthenticated = user && token;

  const [sortBy, setSortBy] = useState('date');
  const [recentlyRemoved, setRecentlyRemoved] = useState(null);
  const undoTimeoutRef = useRef(null);

  // Sorting logic
  const sortedWishlistItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return b._id.localeCompare(a._id);
  });

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Nexus vault link synchronized to clipboard');
  };

  const handleRemoveFromWishlist = async (productId) => {
    const removedProduct = wishlistItems.find(p => p._id === productId);
    setRecentlyRemoved(removedProduct);
    await dispatch(removeFromWishlistAsync(productId)).unwrap();
    toast.info("Target removed from vault", {
      onClick: handleUndoRemove,
      autoClose: 3000
    });
  };

  const handleUndoRemove = async () => {
    if (recentlyRemoved) {
      await dispatch(addToWishlistAsync(recentlyRemoved)).unwrap();
      setRecentlyRemoved(null);
      toast.success('Asset restored to vault');
    }
  };

  const handleAddToCart = (product) => {
    if (!product.inStock) {
      toast.error('Inventory depleted for this asset');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.title} archived to cart`);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, token, dispatch]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 border-b border-slate-50 pb-12"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-rose-100/50">
                Nexus Vault
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-slate-900 font-outfit tracking-tight">
                Collection <span className="text-rose-500">Vault</span>
              </h1>
              <p className="text-slate-500 font-medium">
                {wishlistItems.length} curated targets awaiting further protocols
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none h-12 pl-6 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none hover:bg-white focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="date">Sync: Recent</option>
                <option value="price">Valuation</option>
                <option value="name">Designation</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <button
              onClick={handleShareWishlist}
              className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {sortedWishlistItems.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-premium-lg transition-all duration-500 flex flex-col h-full"
                >
                  {/* Asset Preview */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                    <img
                      src={product.images?.[0]?.url || 'https://placehold.co/600x800?text=Nexus+Asset'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-premium flex items-center justify-center text-rose-400 hover:text-rose-600 hover:scale-110 transition-all border border-white/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute top-4 left-4">
                      {product.inStock ? (
                        <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-none py-1 px-2.5 text-[9px] font-bold">IN STOCK</Badge>
                      ) : (
                        <Badge className="bg-rose-500/90 backdrop-blur-md text-white border-none py-1 px-2.5 text-[9px] font-bold">DEPLETED</Badge>
                      )}
                    </div>
                  </div>

                  {/* Asset Info */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                          {typeof product.category === 'object' ? product.category?.name : product.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 font-outfit leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </div>
                      <div className="flex items-center mt-auto">
                        <CurrencyPrice
                          price={product.price || 0}
                          variant="nexus"
                          size="2xl"
                          weight="bold"
                          showDecimals={false}
                        />
                      </div>
                    </div>

                    <div className="pt-6 mt-auto">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${product.inStock
                          ? 'bg-slate-950 text-white hover:bg-primary-600 shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                        {product.inStock ? 'Archive to Cart' : 'Inventory Depleted'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Intelligence Protocol: Recommendations */}
        {!loading && wishlistItems.length > 0 && (
          <WishlistRecommendations wishlistItems={wishlistItems} />
        )}
      </div>
    </div>
  );
};

export default Wishlist;
