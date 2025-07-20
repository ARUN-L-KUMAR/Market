/**
 * T  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3002',is file contains global configuration settings for the application.
 * It centralizes important constants and settings to ensure consistency
 * across the application.
 */

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  baseUrl: import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com',
  
  // API Endpoints
  endpoints: {
    // Auth endpoints
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      verifyToken: '/api/auth/verify-token'
    },
    
    // Product endpoints
    products: {
      getAll: '/api/products',
      getById: (id) => `/api/products/${id}`,
      search: (query) => `/api/products/search?q=${encodeURIComponent(query)}`,
      byCategory: (categoryId) => `/api/products/category/${categoryId}`,
      featured: '/api/products/featured',
      trending: '/api/products/trending'
    },
    
    // User endpoints
    user: {
      profile: '/api/auth/profile',
      updateProfile: '/api/auth/profile',
      orders: '/api/orders/user',
      wishlist: '/api/wishlist',
      cart: '/api/cart'
    },
    
    // Orders endpoints
    orders: {
      create: '/api/orders',
      getById: (id) => `/api/orders/${id}`,
      cancel: (id) => `/api/orders/${id}/cancel`,
      trackOrder: (id) => `/api/orders/${id}/track`
    },
    
    // Wishlist endpoints
    wishlist: {
      getAll: '/api/wishlist',
      add: (productId) => `/api/wishlist/${productId}`,
      remove: (productId) => `/api/wishlist/${productId}`
    }
  },
  
  // Request headers
  headers: (token = null) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
};

// Socket Configuration
export const SOCKET_CONFIG = {
  url: import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001',
  options: {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  }
};

// UI Configuration
export const UI_CONFIG = {
  // Toast notification settings
  toast: {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 12,
    pageSizeOptions: [12, 24, 48]
  }
};

// Feature flags
export const FEATURES = {
  enableWishlist: true,
  enableRealTimeUpdates: true,
  enableGuestCheckout: true,
  enableProductReviews: true
};

export default {
  API_CONFIG,
  SOCKET_CONFIG,
  UI_CONFIG,
  FEATURES
};
