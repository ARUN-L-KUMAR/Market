import { useState, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Star,
  Zap,
  TrendingUp,
  Plus,
  Minus,
  Clock,
  ShoppingBag,
  Eye,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ZapOff
} from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/wishlistSlice';
import { toast } from 'react-toastify';
import socket from '../utils/socket';
import Badge from './ui/Badge';
import CurrencyPrice from './CurrencyPrice';
import Card from './ui/Card';
import Button from './ui/Button';

const ProductCard = forwardRef(({ product, index = 0, viewMode = 'grid' }, ref) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const { items: wishlistItems } = useSelector(state => state.wishlist);

  const isInWishlist = wishlistItems.some(item => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock || product.stock <= 0) {
      toast.error('Asset currently unavailable in local nodes');
      return;
    }
    if (!user) {
      toast.warning('Authentication required for collection');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    dispatch(addToCart({ product, quantity }));

    if (user) {
      socket.emit('updateCart', {
        userId: user._id,
        action: 'add',
        item: { productId: product._id, quantity }
      });
    }

    setTimeout(() => {
      setIsAddingToCart(false);
      toast.success(`${product.title} archived in cart`, {
        icon: <ShoppingBag className="text-emerald-500 w-5 h-5" />,
        style: {
          borderRadius: '1rem',
          background: '#020617',
          color: '#fff',
          fontSize: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }
      });
    }, 800);
  };

  const handleQuantityChange = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => Math.max(1, Math.min(product.stock || 10, prev + delta)));
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Please login to add items to your wishlist');
      return;
    }
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlistAsync(product._id)).unwrap();
      } else {
        await dispatch(addToWishlistAsync(product)).unwrap();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error?.message || 'Failed to update wishlist');
    }
  };

  const avgRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isNew = product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isListView = viewMode === 'list';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      className="h-full"
    >
      <Card
        className={`group relative rounded-[2.5rem] border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 overflow-hidden ${isListView ? 'flex h-full min-h-[280px]' : 'flex flex-col h-full'}`}
        padding="none"
        onClick={() => navigate(`/products/${product._id}`)}
      >
        {/* Action Overlays */}
        <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 z-20">
          <button
            onClick={handleWishlistToggle}
            className={`w-10 h-10 rounded-xl shadow-premium flex items-center justify-center transition-all border ${isInWishlist
              ? 'bg-rose-500 text-white border-rose-500 scale-110'
              : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 border-white/20 hover:scale-110'
              }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-premium flex items-center justify-center text-slate-400 hover:text-primary-600 hover:scale-110 transition-all border border-white/20"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Background Detail */}
        <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />

        {/* Product Image Section */}
        <div className={`relative bg-slate-50 overflow-hidden ${isListView ? 'w-48 sm:w-80 flex-shrink-0' : 'aspect-[4/5]'}`}>
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/600x800?text=Premium+Market'}
            alt={product.title}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-115"
            onError={e => { e.target.src = 'https://placehold.co/600x800?text=Image+Unavailable'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Dynamic Badges */}
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
            {isOnSale && (
              <Badge variant="danger" className="bg-rose-500/90 backdrop-blur-md text-white font-bold border-none px-2.5 py-1 text-[9px] shadow-lg shadow-rose-500/10">
                <Zap className="w-3 h-3 mr-1" />
                {discountPercentage}% OFF
              </Badge>
            )}
            {isNew && (
              <Badge variant="primary" className="bg-primary-600/90 backdrop-blur-md text-white font-bold border-none px-2.5 py-1 text-[9px] shadow-lg shadow-primary-500/10">
                <TrendingUp className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            )}
          </div>
        </div>

        {/* Product Content Section */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-500">
                {Array.isArray(product.categoryName) ? product.categoryName[0] : (product.category?.name || product.category)}
              </span>
              <h3 className="text-base font-bold text-slate-800 font-outfit tracking-tight leading-snug group-hover:text-primary-600 transition-colors duration-300 line-clamp-2">
                {product.title}
              </h3>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-current mr-1" />
                <span className="text-[11px] font-bold font-outfit">{avgRating > 0 ? avgRating.toFixed(1) : '4.8'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{product.reviews?.length || 12} Archives</span>
            </div>

            {isListView && (
              <p className="text-sm text-slate-500 line-clamp-3 font-medium leading-relaxed max-w-xl">
                {product.description}
              </p>
            )}

            {/* Price Hub */}
            <div className="flex items-baseline gap-3 pt-1">
              <CurrencyPrice
                price={product.price}
                variant="nexus"
                size="xl"
                weight="bold"
                showDecimals={false}
              />
              {isOnSale && (
                <CurrencyPrice
                  price={product.originalPrice}
                  size="xs"
                  color="text-slate-400"
                  weight="medium"
                  className="line-through"
                  showDecimals={false}
                />
              )}
            </div>
          </div>

          <div className="pt-5 mt-auto border-t border-slate-100 flex items-center gap-3">
            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
              <button
                onClick={(e) => handleQuantityChange(e, -1)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-[11px] font-bold text-slate-700">{quantity}</span>
              <button
                onClick={(e) => handleQuantityChange(e, 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className={`flex-1 h-10 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${isAddingToCart
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-950 text-white hover:bg-primary-600 shadow-sm hover:shadow-lg hover:shadow-primary-600/10'
                }`}
            >
              {isAddingToCart ? 'ARCHIVING...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          {/* Critical Stock Monitor */}
          {product.inStock && product.stock <= 10 && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-amber-600">
                <div className="flex items-center gap-1.5">
                  <ZapOff className="w-3 h-3" /> Stock Monitor
                </div>
                <span>{product.stock} LEFT</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(product.stock / 10) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;