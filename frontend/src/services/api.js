import axios from 'axios';
import { API_CONFIG } from '../config/appConfig';

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
      console.error('API Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection or try again later.',
        originalError: error
      });
    }

    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized — clear session and redirect to login
        console.warn('Session expired or invalid token');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Only redirect if not already on login/register pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
        break;
      case 403:
        console.warn('Forbidden API request');
        break;
      case 404:
        console.warn('API resource not found');
        break;
      case 429:
        console.warn('Rate limited — too many requests');
        break;
      case 500:
        console.error('API server error');
        break;
      default:
        break;
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
    return await apiClient.post(API_CONFIG.endpoints.auth.resetPassword, { token, password: newPassword });
  },
  verifyEmail: async (token) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.verifyEmail, { token });
  },
  resendVerification: async (email) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.resendVerification, { email });
  },
  googleLogin: async (idToken) => {
    return await apiClient.post(API_CONFIG.endpoints.auth.google, { idToken });
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
