import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Eye,
  Zap,
  TrendingUp,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Award,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync } from '../store/wishlistSlice';
import { toast } from 'react-toastify';
import socket from '../utils/socket';
import WishlistIcon from './WishlistIcon';
import Badge from './ui/Badge';
import Button from './ui/Button';
import CurrencyPrice from './CurrencyPrice';

const ProductCard = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  
  const isInWishlist = wishlistItems.some(item => item._id === product._id);
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    try {
      dispatch(addToCart({
        product,
        quantity: quantity
      }));
      
      toast.success(`${product.title} added to cart`);
      
      // Emit socket event if user is logged in
      if (user) {
        socket.emit('updateCart', {
          userId: user._id,
          action: 'add',
          item: { productId: product._id, quantity: quantity }
        });
      }
    } catch (error) {
      toast.error('Failed to add item to cart');
    } finally {
      setTimeout(() => setIsAddingToCart(false), 1000);
    }
  };
  
  const handleQuantityChange = (delta) => {
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
        // Emit socket event for admin dashboard
        if (user) {
          socket.emit('updateWishlist', {
            userId: user._id,
            userName: user.name,
            action: 'remove',
            product: { productId: product._id, name: product.title }
          });
        }
      } else {
        await dispatch(addToWishlistAsync(product)).unwrap();
        toast.success(`${product.title} added to wishlist`);
        // Emit socket event for admin dashboard
        if (user) {
          socket.emit('updateWishlist', {
            userId: user._id,
            userName: user.name,
            action: 'add',
            product: { productId: product._id, name: product.title }
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error?.message || 'Failed to update wishlist');
    }
  };
  
  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Check if product is trending/new
  const isNew = product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        delay: index * 0.1
      }}
      className="group relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:border-purple-200 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Enhanced Wishlist Button - Outside Link to prevent interference */}
      <div className="absolute top-4 right-4 z-30">
        <motion.button
          onClick={handleWishlistToggle}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className={`p-3 rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 ${
            isInWishlist 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-200' 
              : 'bg-white/95 text-gray-600 hover:bg-white hover:text-red-500 hover:shadow-lg'
          }`}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </motion.button>
      </div>
      
      <Link to={`/products/${product._id}`} className="block relative">
        {/* Image Container */}
        <div className="relative pb-[75%] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <motion.img 
            src={product.images[selectedImage]?.url || product.images[0]?.url || 'https://placehold.co/400x300?text=No+Image'}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-contain"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onError={e => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
          />
          
          {/* Multiple Images Navigation */}
          {product.images?.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.slice(0, 3).map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage(idx);
                  }}
                  whileHover={{ scale: 1.2 }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    selectedImage === idx ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Floating Sparkles */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 360,
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="absolute"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${20 + i * 20}%`
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
        
        {/* Enhanced Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">{/* Reduced z-index */}
          {isOnSale && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Badge variant="danger" size="sm" animate className="shadow-lg">
                <Zap className="w-3 h-3 mr-1" />
                {discountPercentage}% OFF
              </Badge>
            </motion.div>
          )}
          {isNew && (
            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              <Badge variant="success" size="sm" animate className="shadow-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            </motion.div>
          )}
          {!product.inStock && (
            <Badge variant="secondary" size="sm" className="shadow-lg">
              Out of Stock
            </Badge>
          )}
          {product.inStock && product.stock <= 5 && product.stock > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Badge variant="warning" size="sm" pulse className="shadow-lg">
                <Clock className="w-3 h-3 mr-1" />
                Only {product.stock} left
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Quick Action Buttons - appears on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-white/95 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Eye className="w-4 h-4" />
                Quick View
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
      
      {/* Enhanced Product Info */}
      <div className="p-6 relative">
        <Link to={`/products/${product._id}`} className="block group/link">
          <motion.h3 
            className="font-bold text-xl mb-3 text-gray-800 group-hover/link:text-purple-600 transition-colors duration-300 line-clamp-2"
            whileHover={{ x: 5 }}
          >
            {product.title}
          </motion.h3>
          
          {/* Enhanced Rating */}
          {avgRating > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        i < Math.floor(avgRating) 
                          ? 'text-yellow-400 fill-current' 
                          : i < avgRating 
                          ? 'text-yellow-400 fill-current opacity-50' 
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {avgRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
              </span>
            </div>
          )}
          
          {/* Enhanced Category */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <p className="text-sm text-gray-600 font-medium capitalize">
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </p>
          </div>
        </Link>
        
        {/* Enhanced Price */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              <CurrencyPrice price={product.price} />
            </motion.span>
            {isOnSale && (
              <span className="text-lg text-gray-400 line-through">
                <CurrencyPrice price={product.originalPrice} />
              </span>
            )}
          </div>
          {isOnSale && (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-green-600 font-bold text-sm"
            >
              Save <CurrencyPrice price={product.originalPrice - product.price} />
            </motion.div>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-600">Qty:</span>
          <div className="flex items-center bg-gray-100 rounded-lg">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantityChange(-1)}
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <span className="px-4 py-2 font-medium text-gray-800">{quantity}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleQuantityChange(1)}
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        {/* Enhanced Add to Cart Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            fullWidth
            size="lg"
            variant={product.inStock ? "primary" : "secondary"}
            disabled={!product.inStock || isAddingToCart}
            onClick={handleAddToCart}
            className={`font-semibold relative overflow-hidden ${
              product.inStock 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : ''
            }`}
          >
            <AnimatePresence mode="wait">
              {isAddingToCart ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Adding...
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Stock Indicator */}
        {product.inStock && product.stock <= 10 && (
          <div className="mt-3 bg-orange-50 rounded-lg p-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-600 font-medium">Stock Level:</span>
              <span className="text-orange-800">{product.stock} remaining</span>
            </div>
            <div className="mt-1 h-2 bg-orange-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(product.stock / 10) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default ProductCard;