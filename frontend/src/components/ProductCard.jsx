import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCart,
  Heart,
  Star,
  Zap,
  TrendingUp,
  Plus,
  Minus,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/wishlistSlice';
import { toast } from 'react-toastify';
import socket from '../utils/socket';
import Badge from './ui/Badge';
import CurrencyPrice from './CurrencyPrice';

const ProductCard = ({ product, index = 0 }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { items: wishlistItems } = useSelector(state => state.wishlist);

  const isInWishlist = wishlistItems.some(item => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);

    try {
      dispatch(addToCart({ product, quantity }));
      toast.success(`${product.title} added to cart`);

      if (user) {
        socket.emit('updateCart', {
          userId: user._id,
          action: 'add',
          item: { productId: product._id, quantity }
        });
      }
    } catch (error) {
      toast.error('Failed to add item to cart');
    } finally {
      setTimeout(() => setIsAddingToCart(false), 1000);
    }
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
        toast.info(`${product.title} removed from wishlist`);
        if (user) {
          socket.emit('updateWishlist', {
            userId: user._id, userName: user.name, action: 'remove',
            product: { productId: product._id, name: product.title }
          });
        }
      } else {
        await dispatch(addToWishlistAsync(product)).unwrap();
        toast.success(`${product.title} added to wishlist`);
        if (user) {
          socket.emit('updateWishlist', {
            userId: user._id, userName: user.name, action: 'add',
            product: { productId: product._id, name: product.title }
          });
        }
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

  return (
    <div className="group relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-sm transition-all duration-200 ${isInWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-slate-400 hover:text-red-500 hover:bg-red-50'
          }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
      </button>

      <Link to={`/products/${product._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/400x300?text=No+Image'}
            alt={product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isOnSale && (
              <Badge variant="danger" size="sm">
                <Zap className="w-3 h-3 mr-1" />
                {discountPercentage}% OFF
              </Badge>
            )}
            {isNew && (
              <Badge variant="success" size="sm">
                <TrendingUp className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="default" size="sm">Out of Stock</Badge>
            )}
            {product.inStock && product.stock <= 5 && product.stock > 0 && (
              <Badge variant="warning" size="sm">
                <Clock className="w-3 h-3 mr-1" />
                Only {product.stock} left
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-sm font-medium text-slate-900 mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(avgRating) ? 'text-amber-400 fill-current' : 'text-slate-200'
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">
                ({product.reviews?.length || 0})
              </span>
            </div>
          )}

          {/* Category */}
          <p className="text-xs text-slate-400 mb-3 capitalize">
            {Array.isArray(product.categoryName) && product.categoryName.length > 0
              ? (product.categoryName.length > 1
                ? `${product.categoryName[0]} & ${product.categoryName.length - 1} more`
                : product.categoryName[0])
              : (typeof product.category === 'object' ? product.category?.name : product.category)}
          </p>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-semibold text-slate-900">
            <CurrencyPrice price={product.price} />
          </span>
          {isOnSale && (
            <span className="text-sm text-slate-400 line-through">
              <CurrencyPrice price={product.originalPrice} />
            </span>
          )}
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-md">
            <button
              onClick={(e) => handleQuantityChange(e, -1)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-slate-700 min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={(e) => handleQuantityChange(e, 1)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${product.inStock
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              } disabled:opacity-50`}
          >
            {isAddingToCart ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </>
            )}
          </button>
        </div>

        {/* Low Stock Bar */}
        {product.inStock && product.stock <= 10 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-amber-600 font-medium">Low stock</span>
              <span className="text-slate-400">{product.stock} left</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(product.stock / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;