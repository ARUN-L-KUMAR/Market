import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import socket from '../utils/socket';
import Badge from './ui/Badge';

const RealTimeStock = () => {
  const [updates, setUpdates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for real-time inventory updates
    const handleStockUpdate = (data) => {
      const { product, type } = data;

      if (!product) return; // Guard against malformed data

      // Add the update to the list with a timestamp
      setUpdates(prev => {
        // Keep only the 5 most recent updates
        const newUpdates = [
          {
            id: Date.now(),
            product,
            type,
            timestamp: new Date()
          },
          ...prev
        ];

        return newUpdates.slice(0, 5);
      });
    };

    // Define handlers for each event type
    const handleProductCreated = (data) => handleStockUpdate({ ...data, type: 'new' });
    const handleProductUpdated = (data) => handleStockUpdate({ ...data, type: 'update' });
    const handleProductDeleted = (data) => handleStockUpdate({ ...data, type: 'delete' });

    // Listen for different types of stock updates
    socket.on('stockUpdate', handleStockUpdate);
    socket.on('productCreated', handleProductCreated);
    socket.on('productUpdated', handleProductUpdated);
    socket.on('productDeleted', handleProductDeleted);

    return () => {
      socket.off('stockUpdate', handleStockUpdate);
      socket.off('productCreated', handleProductCreated);
      socket.off('productUpdated', handleProductUpdated);
      socket.off('productDeleted', handleProductDeleted);
    };
  }, []);

  const getUpdateMessage = (update) => {
    const { product, type } = update;

    switch (type) {
      case 'new':
        return `New product added: ${product.title}`;
      case 'update':
        return `${product.title} updated to ${product.stock} units`;
      case 'delete':
        return `${product.title || 'A product'} has been removed`;
      case 'low':
        return `${product.title} is running low (${product.stock} left)`;
      case 'out':
        return `${product.title} is now out of stock`;
      case 'restock':
        return `${product.title} has been restocked (${product.stock} units)`;
      default:
        return `${product.title} inventory changed`;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'new': return 'success';
      case 'update': return 'info';
      case 'delete': return 'danger';
      case 'low': return 'warning';
      case 'out': return 'danger';
      case 'restock': return 'success';
      default: return 'primary';
    }
  };

  const handleClick = (update) => {
    // Navigate to the product page if it still exists
    if (update.type !== 'delete' && update.product && update.product._id) {
      navigate(`/products/${update.product._id}`);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-xl font-black font-outfit text-slate-950 uppercase tracking-tight">Active Nodes</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Feed</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
            <Activity className="w-8 h-8 text-slate-200" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[150px] leading-relaxed">
            Synchronizing with global procurement nodes...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {updates.map((update, idx) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary-200 hover:shadow-premium transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => handleClick(update)}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${update.type === 'delete' ? 'bg-rose-100 text-rose-600' :
                      update.type === 'new' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-primary-100 text-primary-600'
                      }`}>
                      {update.type}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 font-mono">
                      {formatTime(update.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">
                    {getUpdateMessage(update)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RealTimeStock;