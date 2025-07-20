import socket from '../utils/socket';

/**
 * Socket service for handling real-time updates
 * This service provides methods for connecting to different socket rooms
 * and handling events for real-time updates
 */
const socketService = {
  /**
   * Join admin room for real-time updates
   * @param {string} userId - The user ID to join the admin room
   * @returns {Object} - Object with methods to handle admin events
   */
  joinAdminRoom: (userId) => {
    if (!userId) return null;
    
    // Join admin room
    socket.emit('joinRoom', { room: 'adminRoom', userId });
    
    return {
      /**
       * Listen for new order events
       * @param {Function} callback - Callback function to handle new order events
       * @returns {Function} - Function to remove the event listener
       */
      onNewOrder: (callback) => {
        socket.on('newOrder', callback);
        return () => socket.off('newOrder', callback);
      },
      
      /**
       * Listen for cart activity events
       * @param {Function} callback - Callback function to handle cart activity events
       * @returns {Function} - Function to remove the event listener
       */
      onCartActivity: (callback) => {
        socket.on('cartActivity', callback);
        return () => socket.off('cartActivity', callback);
      },
      
      /**
       * Listen for user activity events
       * @param {Function} callback - Callback function to handle user activity events
       * @returns {Function} - Function to remove the event listener
       */
      onUserActivity: (callback) => {
        socket.on('userActivity', callback);
        return () => socket.off('userActivity', callback);
      },
      
      /**
       * Listen for wishlist activity events
       * @param {Function} callback - Callback function to handle wishlist activity events
       * @returns {Function} - Function to remove the event listener
       */
      onWishlistActivity: (callback) => {
        socket.on('wishlistActivity', callback);
        return () => socket.off('wishlistActivity', callback);
      },
      
      /**
       * Listen for product activity events
       * @param {Function} callback - Callback function to handle product activity events
       * @returns {Function} - Function to remove the event listener
       */
      onProductActivity: (callback) => {
        socket.on('productActivity', callback);
        return () => socket.off('productActivity', callback);
      },
      
      /**
       * Leave admin room
       */
      leaveAdminRoom: () => {
        socket.emit('leaveRoom', { room: 'adminRoom', userId });
      }
    };
  },
  
  /**
   * Join product room for real-time updates on product stock
   * @param {string} productId - The product ID to join the product room
   * @returns {Object} - Object with methods to handle product events
   */
  joinProductRoom: (productId) => {
    if (!productId) return null;
    
    // Join product room
    socket.emit('joinRoom', { room: `product-${productId}` });
    
    return {
      /**
       * Listen for stock update events
       * @param {Function} callback - Callback function to handle stock update events
       * @returns {Function} - Function to remove the event listener
       */
      onStockUpdate: (callback) => {
        socket.on('stockUpdate', callback);
        return () => socket.off('stockUpdate', callback);
      },
      
      /**
       * Leave product room
       */
      leaveProductRoom: () => {
        socket.emit('leaveRoom', { room: `product-${productId}` });
      }
    };
  }
};

export default socketService;