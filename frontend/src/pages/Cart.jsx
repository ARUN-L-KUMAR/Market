import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Sparkles,
  Clock,
  Award,
  ShoppingCart
} from 'lucide-react';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import socket from '../utils/socket';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import axios from 'axios';
import CurrencyPrice from '../components/CurrencyPrice';

const Cart = () => {
  const { items } = useSelector(state => state.cart);
  const { token } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [stockWarnings, setStockWarnings] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Calculate totals whenever cart items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => sum + ((item.product?.price ?? 0) * item.quantity), 0);
    const newTax = newSubtotal * 0.08; // 8% tax
    const newShipping = newSubtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const newTotal = newSubtotal + newTax + newShipping - discount;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setShipping(newShipping);
    setTotal(newTotal);
  }, [items, discount]);

  // Monitor real-time stock changes
  useEffect(() => {
    const checkStockWarnings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const productIds = items
          .map(item => item.product?._id)
          .filter(Boolean);

        if (productIds.length === 0) return;

        const response = await axios.get(`${apiUrl}/api/products`, {
          params: { ids: productIds.join(',') }
        });

        const products = response.data.products;
        const warnings = {};

        items.forEach(item => {
          if (!item.product?._id) return;
          const currentProduct = products.find(p => p._id === item.product._id);

          if (currentProduct && currentProduct.stock < item.quantity) {
            warnings[item.product._id] = `Only ${currentProduct.stock} items available`;
          }
        });

        setStockWarnings(warnings);
      } catch (error) {
        console.error('Error checking stock:', error);
      }
    };

    checkStockWarnings();

    // Listen for stock updates
    const handleStockUpdate = () => {
      checkStockWarnings();
    };

    socket.on('stockUpdate', handleStockUpdate);
    socket.on('productUpdated', handleStockUpdate);

    return () => {
      socket.off('stockUpdate', handleStockUpdate);
      socket.off('productUpdated', handleStockUpdate);
    };
  }, [items]);

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));

      // Clear stock warning if quantity is reduced to available stock
      if (stockWarnings[productId] && newQuantity <= 5) {
        setStockWarnings(prev => {
          const newWarnings = { ...prev };
          delete newWarnings[productId];
          return newWarnings;
        });
      }

      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setTimeout(() => {
        setIsUpdating(prev => ({ ...prev, [productId]: false }));
      }, 500);
    }
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));

    // Clear stock warning
    setStockWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[productId];
      return newWarnings;
    });

    toast.success('Item removed from cart');
  };

  // Handle clear cart
  const handleClearCart = () => {
    dispatch(clearCart());
    setStockWarnings({});
    setShowClearConfirm(false);
    toast.success('Cart cleared');
  };

  // Handle proceed to checkout
  const handleCheckout = () => {
    // Check if there are any stock warnings
    if (Object.keys(stockWarnings).length > 0) {
      toast.warning('Please adjust quantities for items with low stock');
      return;
    }

    if (!token) {
      toast.info('Please login to continue to checkout');
      navigate('/login?redirect=/checkout');
      return;
    }

    navigate('/checkout');
  };

  // Handle promo code
  const handlePromoCode = () => {
    if (promoCode.toLowerCase() === 'welcome10') {
      setDiscount(subtotal * 0.1);
      toast.success('Promo code applied! 10% discount');
    } else {
      toast.error('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-slate-50 py-12"
      >
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-32 h-32 mx-auto mb-8 bg-slate-100 rounded-full flex items-center justify-center relative"
          >
            <ShoppingBag className="w-16 h-16 text-slate-600" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-semibold text-slate-900 mb-4"
          >
            Your Cart is Empty
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-600 mb-8"
          >
            Time to fill it with amazing products! Browse our collection and find something you'll love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <Button
              onClick={() => navigate('/products')}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-sm hover:shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/deals')}
                className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-sm transition-all duration-300 border border-slate-200"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Hot Deals</h3>
                <p className="text-sm text-slate-600">Up to 70% off</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/trending')}
                className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-sm transition-all duration-300 border border-slate-200"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Trending</h3>
                <p className="text-sm text-slate-600">Popular items</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/products')}
                className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-sm transition-all duration-300 border border-slate-200"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Best Sellers</h3>
                <p className="text-sm text-slate-600">Top rated</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
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
              className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-4xl font-semibold text-slate-900">
              Shopping Cart
            </h1>
            <Badge variant="primary" size="md">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {items.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </motion.button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.product?._id || index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, height: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                  className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-sm transition-all duration-300 group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-full lg:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden"
                      >
                        <img
                          src={item.product?.images?.[0]?.url || 'https://placehold.co/400x300?text=No+Image'}
                          alt={item.product?.title || 'Product'}
                          className="w-full h-full object-cover"
                        />
                        {item.product?.discount && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            -{item.product.discount}%
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-xl text-slate-800 mb-2 line-clamp-1">
                              {item.product?.title || 'Product'}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                              <p className="text-slate-600 text-sm capitalize">
                                {typeof item.product?.category === 'object' ? item.product.category?.name : item.product?.category}
                              </p>
                            </div>

                            {/* Additional product info */}
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveItem(item.product?._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </div>

                        {/* Stock Warning */}
                        {stockWarnings[item.product?._id] && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200"
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
                            <span className="text-sm font-medium text-slate-600">Quantity:</span>
                            <div className="flex items-center bg-slate-100 rounded-lg">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.product?._id, Math.max(1, item.quantity - 1))}
                                disabled={isUpdating[item.product?._id]}
                                className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 transition-colors duration-200"
                              >
                                <Minus className="w-4 h-4" />
                              </motion.button>

                              <span className="px-4 py-2 font-semibold text-slate-800 min-w-[3rem] text-center">
                                {isUpdating[item.product?._id] ? '...' : item.quantity}
                              </span>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                                disabled={isUpdating[item.product?._id]}
                                className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 transition-colors duration-200"
                              >
                                <Plus className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-semibold text-slate-900">
                              <CurrencyPrice price={(item.product?.price || 0) * item.quantity} />
                            </div>
                            <span className="text-sm text-slate-500">
                              <CurrencyPrice price={item.product?.price || 0} /> each
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
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-8"
            >
              <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-slate-600" />
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800"><CurrencyPrice price={subtotal} /></span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-600">Shipping</span>
                  </div>
                  <div className="text-right">
                    {shipping === 0 ? (
                      <span className="font-semibold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-800"><CurrencyPrice price={shipping} /></span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-semibold text-slate-800"><CurrencyPrice price={tax} /></span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-600">Discount</span>
                    <span className="font-semibold text-emerald-600">-<CurrencyPrice price={discount} /></span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-slate-800">Total</span>
                    <span className="text-2xl font-semibold text-slate-900">
                      <CurrencyPrice price={total} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <Button
                    onClick={handlePromoCode}
                    variant="outline"
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">
                      Add <CurrencyPrice price={50 - subtotal} /> more for FREE shipping!
                    </span>
                  </div>
                  <div className="w-full bg-indigo-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="bg-indigo-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Stock Warning */}
              {Object.keys(stockWarnings).length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Stock Alert</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Some items in your cart have limited stock. Please adjust quantities before checkout.
                  </p>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm hover:shadow-sm"
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
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </motion.div>

              {/* Security Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Gift className="w-4 h-4 text-slate-600" />
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
              className="bg-white rounded-lg p-8 max-w-md w-full shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">Clear Cart?</h3>
                <p className="text-slate-600">
                  Are you sure you want to remove all items from your cart? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
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
