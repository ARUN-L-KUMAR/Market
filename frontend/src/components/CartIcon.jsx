import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Badge from './ui/Badge';
import CurrencyPrice from './CurrencyPrice';

const CartIcon = () => {
  const { items } = useSelector(state => state.cart);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const navigate = useNavigate();
  
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0);
  
  // Animate when cart items change
  useEffect(() => {
    if (itemCount > prevCount) {
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
    
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);
  
  const handleClick = () => {
    navigate('/cart');
  };
  
  return (
    <motion.div 
      className="relative cursor-pointer group" 
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
        <motion.div
          animate={isAnimating ? { 
            scale: 1.2,
            rotate: [0, -10, 10, -10, 0]
          } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "tween", ease: "easeInOut" }}
        >
          <ShoppingCart className="w-5 h-5" />
        </motion.div>
        
        <AnimatePresence>
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                variant="primary" 
                size="xs" 
                className="min-w-[18px] h-[18px] flex items-center justify-center text-white font-bold"
                pulse={isAnimating}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50"
          >
            {itemCount} item{itemCount !== 1 ? 's' : ''} • <CurrencyPrice price={totalAmount} />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartIcon;