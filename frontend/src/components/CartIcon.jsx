import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CurrencyPrice from './CurrencyPrice';

const CartIcon = () => {
  const { items } = useSelector(state => state.cart);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const navigate = useNavigate();

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0);

  useEffect(() => {
    if (itemCount > prevCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  const handleClick = () => navigate('/cart');

  return (
    <motion.div
      className="relative cursor-pointer group"
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative p-2.5 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-xl transition-all duration-300">
        <motion.div
          animate={isAnimating ? {
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, -10, 0]
          } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
        </motion.div>

        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1 right-1"
            >
              <div className="min-w-[18px] h-[18px] px-1 bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm font-outfit">
                {itemCount > 99 ? '99+' : itemCount}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip — CSS-only, pointer-events-none, truly invisible when not hovered */}
      {itemCount > 0 && (
        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-[110] shadow-premium pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="text-primary-400">{itemCount} ASSETS</span>
            <div className="w-1 h-3 border-l border-white/20" />
            <CurrencyPrice price={totalAmount} variant="white" weight="bold" showDecimals={false} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CartIcon;