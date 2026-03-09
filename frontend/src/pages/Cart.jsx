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
import { getProductImageUrl } from '../utils/imageUtils';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 bg-primary-50 rounded-full animate-ping opacity-20" />
              <div className="relative w-full h-full bg-white rounded-full shadow-premium flex items-center justify-center border border-slate-50">
                <ShoppingBag className="w-16 h-16 text-slate-300" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-outfit tracking-tight">
                Inventory <span className="text-primary-600">Pending</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                Your distribution queue is currently empty. Secure your first assets from our global archive.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => navigate('/products')}
                className="h-14 px-10 bg-slate-950 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary-600/20 flex items-center gap-3"
              >
                <ShoppingBag className="w-4 h-4" />
                Access Archive
              </button>
              <button
                onClick={() => navigate('/deals')}
                className="h-14 px-10 bg-white text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 border border-slate-100 transition-all flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4 text-primary-500" />
                Priority Deals
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
              <div className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary-100/50">
                Nexus Queue
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-slate-900 font-outfit tracking-tight">
                Shopping <span className="text-primary-600">Cart</span>
              </h1>
              <p className="text-slate-500 font-medium">
                {items.length} units currently held in priority status
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-3 text-rose-500 hover:text-white hover:bg-rose-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-rose-100 hover:border-rose-500 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Buffer
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.product?._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-6 group transition-all duration-300 hover:shadow-premium-lg"
                >
                  <div className="flex flex-col sm:flex-row gap-8">
                    {/* Asset Preview */}
                    <div className="relative w-full sm:w-40 aspect-square flex-shrink-0 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={getProductImageUrl(item.product)}
                        alt={item.product?.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
                        }}
                      />
                      {item.product?.discount && (
                        <div className="absolute top-4 left-4">
                          <div className="px-2.5 py-1 bg-rose-500 text-white text-[9px] font-bold rounded-full shadow-lg">
                            -{item.product.discount}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Data */}
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                            {typeof item.product?.category === 'object' ? item.product.category?.name : item.product?.category}
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 font-outfit leading-tight group-hover:text-primary-600 transition-colors">
                            {item.product?.title || 'Product'}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {item.size && <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-slate-200" /> Size {item.size}</span>}
                            {item.color && <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-slate-200" /> Color {item.color}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product?._id)}
                          className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stock Warnings */}
                      {item.product?._id && stockWarnings[item.product._id] && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">{stockWarnings[item.product._id]}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-0.5">
                          <button
                            onClick={() => handleQuantityChange(item.product?._id, Math.max(1, item.quantity - 1))}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <CurrencyPrice
                            price={(item.product?.price || 0) * item.quantity}
                            variant="nexus"
                            size="2xl"
                            weight="bold"
                            showDecimals={false}
                          />
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] border border-slate-100 p-10 lg:p-12 sticky top-24 space-y-10"
            >
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Summary</h3>
                <p className="text-slate-500 text-sm font-medium">Finalizing distribution tier</p>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium tracking-tight">Asset Subtotal</span>
                  <CurrencyPrice price={subtotal} variant="nexus" weight="bold" />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Truck className="w-4 h-4" />
                    <span className="font-medium">Global Freight</span>
                  </div>
                  {shipping === 0 ? (
                    <span className="font-bold text-emerald-600 uppercase tracking-widest text-[10px]">Tier 1 Free</span>
                  ) : (
                    <span className="font-bold text-slate-900 font-outfit"><CurrencyPrice price={shipping} /></span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium tracking-tight">Protocol Fees (Tax)</span>
                  <CurrencyPrice price={tax} variant="nexus" weight="bold" />
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest">Protocol Discount</span>
                    <span className="font-bold text-emerald-700 font-outfit">-<CurrencyPrice price={discount} /></span>
                  </div>
                )}

                <div className="pt-8 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Valuation</span>
                      <CurrencyPrice
                        price={total}
                        variant="nexus"
                        size="4xl"
                        weight="extrabold"
                        showDecimals={false}
                        className="tracking-tighter"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Protocol */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder="PROTOCOL CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:border-primary-500 transition-all font-outfit"
                />
                <button
                  onClick={handlePromoCode}
                  className="absolute right-2 top-2 h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-600 transition-all"
                >
                  Apply
                </button>
              </div>

              {/* Free Freight Warning */}
              {shipping > 0 && (
                <div className="p-5 bg-primary-50 rounded-2xl border border-primary-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-primary-700 uppercase tracking-widest">
                    <span>Target: Free Freight</span>
                    <span>{Math.min((subtotal / 50) * 100, 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1 bg-primary-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-primary-600"
                    />
                  </div>
                  <p className="text-[10px] text-primary-600/70 font-medium text-center">
                    Procure <CurrencyPrice price={50 - subtotal} variant="primary" weight="bold" /> more for Priority Freight Tier.
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button
                  onClick={handleCheckout}
                  className="w-full h-16 bg-slate-950 text-white rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary-600/20 flex items-center justify-center gap-3"
                >
                  <Lock className="w-4 h-4" />
                  Secure Protocol
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full h-14 bg-white text-slate-500 rounded-[2rem] font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 border border-slate-100 transition-all"
                >
                  Return to Archive
                </button>
              </div>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-6 pt-6 opacity-30 group-hover:opacity-50 transition-opacity">
                <Shield className="w-5 h-5" />
                <Truck className="w-5 h-5" />
                <CreditCard className="w-5 h-5" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-premium-lg border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-outfit mb-3">Reset Buffer?</h3>
                <p className="text-slate-500 font-medium">
                  This protocol will clear your current distribution queue. This action is final.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-12 bg-slate-50 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 h-12 bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
