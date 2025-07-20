import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-primary-700">Live Inventory Updates</h3>
        <Badge color="primary" dot={updates.length > 0}>
          {updates.length > 0 ? 'Live' : 'Waiting'}
        </Badge>
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No recent updates. Updates will appear here in real-time.
        </div>
      ) : (
        <ul className="space-y-3">
          {updates.map(update => (
            <li 
              key={update.id} 
              className="bg-gray-50 rounded-lg p-3 border border-gray-100 cursor-pointer hover:bg-gray-100 transition duration-200"
              onClick={() => handleClick(update)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">{getUpdateMessage(update)}</p>
                  <Badge color={getBadgeColor(update.type)} size="sm" className="mt-1">
                    {update.type}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{formatTime(update.timestamp)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RealTimeStock;