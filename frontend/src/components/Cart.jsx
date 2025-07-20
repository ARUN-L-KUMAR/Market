import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  Lock, 
  Truck, 
  Shield,
  CreditCard,
  Gift,
  Star,
  Heart,
  X,
  AlertCircle
} from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import socket from '../utils/socket';
import { toast } from 'react-toastify';
import Button from './ui/Button';
import Badge from './ui/Badge';
import CurrencyPrice from './CurrencyPrice';

const Cart = () => {
  const { items, total } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stockWarnings, setStockWarnings] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  useEffect(() => {
    // Listen for stock updates
    socket.on('stockUpdate', (data) => {
      const { productId, stock } = data;
      const cartItem = items.find(item => item.product._id === productId);
      
      if (cartItem && cartItem.quantity > stock) {
        setStockWarnings(prev => ({
          ...prev,
          [productId]: `Only ${stock} items available`
        }));
        
        toast.warning(`Stock for ${cartItem.product.title} has been updated. Only ${stock} available.`);
      }
    });
    
    return () => {
      socket.off('stockUpdate');
    };
  }, [items]);
  
  const handleQuantityChange = async (itemId, newQuantity) => {
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      dispatch(updateQuantity({ itemId, quantity: newQuantity }));
      
      // Emit cart update event if user is logged in
      if (user) {
        socket.emit('updateCart', {
          userId: user._id,
          action: 'update',
          item: { itemId, quantity: newQuantity }
        });
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setTimeout(() => {
        setIsUpdating(prev => ({ ...prev, [itemId]: false }));
      }, 500);
    }
  };
  
  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
    
    // Emit cart update event if user is logged in
    if (user) {
      socket.emit('updateCart', {
        userId: user._id,
        action: 'remove',
        item: { itemId }
      });
    }
    
    toast.success('Item removed from cart');
  };
  
  const handleClearCart = () => {
    dispatch(clearCart());
    setShowClearConfirm(false);
    toast.success('Cart cleared');
  };
  
  const handleCheckout = () => {
    if (!user) {
      toast.info('Please login to continue to checkout');
      navigate('/login?redirect=checkout');
      return;
    }
    
    navigate('/checkout');
  };
  
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;
  
  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12"
      >
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center"
          >
            <ShoppingBag className="w-16 h-16 text-purple-600" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Your Cart is Empty
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            Looks like you haven't added anything to your cart yet. Let's change that!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              onClick={() => navigate('/products')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/deals" className="text-purple-600 hover:text-purple-700 font-medium">
                Check out our deals
              </Link>
              <Link to="/trending" className="text-purple-600 hover:text-purple-700 font-medium">
                View trending products
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <Badge variant="primary" size="sm">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </motion.button>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative w-full sm:w-32 h-32 flex-shrink-0"
                      >
                        <img 
                          src={item.product.images[0]?.url || 'https://placehold.co/400x300?text=No+Image'}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        {item.product.discount && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{item.product.discount}%
                          </div>
                        )}
                      </motion.div>
                      
                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">
                              {item.product.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {item.size && <span className="mr-4">Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </p>
                            <p className="text-gray-600 text-sm capitalize">
                              Category: {typeof item.product.category === 'object' ? item.product.category?.name : item.product.category}
                            </p>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </div>
                        
                        {/* Stock Warning */}
                        {stockWarnings[item.product._id] && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200"
                          >
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="text-orange-700 text-sm font-medium">
                              {stockWarnings[item.product._id]}
                            </span>
                          </motion.div>
                        )}
                        
                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600">Quantity:</span>
                            <div className="flex items-center bg-gray-100 rounded-xl">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                disabled={isUpdating[item.id]}
                                className="p-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 transition-colors duration-200"
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>
                              
                              <span className="px-4 py-2 font-bold text-gray-800 min-w-[3rem] text-center">
                                {isUpdating[item.id] ? '...' : item.quantity}
                              </span>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isUpdating[item.id]}
                                className="p-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 transition-colors duration-200"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              <CurrencyPrice price={item.product.price * item.quantity} />
                            </div>
                            <span className="text-sm text-gray-500">
                              <CurrencyPrice price={item.product.price} /> each
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-8"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-purple-600" />
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-800"><CurrencyPrice price={total} /></span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Shipping</span>
                  </div>
                  <div className="text-right">
                    {shipping === 0 ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-gray-800"><CurrencyPrice price={shipping} /></span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-800"><CurrencyPrice price={tax} /></span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      <CurrencyPrice price={finalTotal} />
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Add <CurrencyPrice price={50 - total} /> more for FREE shipping!
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(total / 50) * 100}%` }}
                      transition={{ duration: 1 }}
                      className="bg-blue-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4"
              >
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-xl hover:shadow-2xl"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Secure Checkout
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-6"
              >
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => navigate('/products')}
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </motion.div>
              
              {/* Security Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>Gift wrapping available</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Clear Cart?</h3>
                <p className="text-gray-600">
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  onClick={handleClearCart}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear Cart
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;