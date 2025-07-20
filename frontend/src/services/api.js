import axios from 'axios';
import { API_CONFIG } from '../config/appConfig';

// For debugging:
console.log('API URL being used:', API_CONFIG.baseUrl);

// Create a base axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // 15 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Get token from localStorage or Redux store
    const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user'))?.token;
    
    // If token exists, add Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle network errors more gracefully
    if (!error.response) {
      console.error('API Network Error:', error);
      return Promise.reject({
        message: 'Network error. Please check your internet connection or try again later.',
        originalError: error
      });
    }
    
    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear user session and redirect to login
        console.warn('Unauthorized API request:', error.response);
        // You could dispatch a logout action here
        break;
      case 403:
        // Forbidden
        console.warn('Forbidden API request:', error.response);
        break;
      case 404:
        // Not Found
        console.warn('API resource not found:', error.response);
        break;
      case 500:
        // Server Error
        console.error('API server error:', error.response);
        break;
      default:
        console.error(`API error (${error.response.status}):`, error.response);
    }
    
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: async (credentials) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.login, credentials);
  },
  register: async (userData) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.register, userData);
  },
  forgotPassword: async (email) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.forgotPassword, { email });
  },
  resetPassword: async (token, newPassword) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.resetPassword, { token, newPassword });
  }
};

// Products API methods
export const productsAPI = {
  getAll: async (params = {}) => {
    return await apiClient.get(API_CONFIG.endpoints.products.getAll, { params });
  },
  getById: async (id) => {
    return await apiClient.get(API_CONFIG.endpoints.products.getById(id));
  },
  search: async (query, params = {}) => {
    return await apiClient.get(API_CONFIG.endpoints.products.search(query), { params });
  },
  getByCategory: async (categoryId, params = {}) => {
    return await apiClient.get(API_CONFIG.endpoints.products.byCategory(categoryId), { params });
  }
};

// Orders API methods
export const ordersAPI = {
  create: async (orderData) => {
    return await apiClient.post(API_CONFIG.endpoints.orders.create, orderData);
  },
  getById: async (id) => {
    return await apiClient.get(API_CONFIG.endpoints.orders.getById(id));
  },
  getUserOrders: async () => {
    return await apiClient.get(API_CONFIG.endpoints.user.orders);
  },
  cancelOrder: async (id) => {
    return await apiClient.put(API_CONFIG.endpoints.orders.cancel(id));
  }
};

// Wishlist API methods
export const wishlistAPI = {
  getAll: async () => {
    return await apiClient.get(API_CONFIG.endpoints.wishlist.getAll);
  },
  add: async (productId) => {
    return await apiClient.post(API_CONFIG.endpoints.wishlist.add(productId));
  },
  remove: async (productId) => {
    return await apiClient.delete(API_CONFIG.endpoints.wishlist.remove(productId));
  }
};

// User API methods
export const userAPI = {
  getProfile: async () => {
    return await apiClient.get(API_CONFIG.endpoints.user.profile);
  },
  updateProfile: async (profileData) => {
    return await apiClient.put(API_CONFIG.endpoints.user.updateProfile, profileData);
  }
};

// Export the base client for custom requests
export default apiClient;
