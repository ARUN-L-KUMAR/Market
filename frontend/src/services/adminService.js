import apiClient from './api';
import { API_CONFIG } from '../config/appConfig';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  stats: '/api/admin/stats',
  orders: '/api/admin/orders',
  products: '/api/admin/products',
  users: '/api/admin/users',
  settings: '/api/admin/settings',
};

// Get dashboard statistics
export const getStats = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.stats);
};

// Get all orders with pagination and filtering
export const getOrders = async (params = {}) => {
  return await apiClient.get(ADMIN_ENDPOINTS.orders, { params });
};

// Get order by ID
export const getOrderById = async (id) => {
  return await apiClient.get(`${ADMIN_ENDPOINTS.orders}/${id}`);
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  return await apiClient.put(`${ADMIN_ENDPOINTS.orders}/${id}/status`, { status });
};

// Get all products with pagination and filtering
export const getProducts = async (params = {}) => {
  return await apiClient.get(ADMIN_ENDPOINTS.products, { params });
};

// Create new product
export const createProduct = async (productData) => {
  return await apiClient.post(ADMIN_ENDPOINTS.products, productData);
};

// Update product
export const updateProduct = async (id, productData) => {
  return await apiClient.put(`${ADMIN_ENDPOINTS.products}/${id}`, productData);
};

// Delete product
export const deleteProduct = async (id) => {
  return await apiClient.delete(`${ADMIN_ENDPOINTS.products}/${id}`);
};

// Get all users with pagination and filtering
export const getUsers = async (params = {}) => {
  return await apiClient.get(ADMIN_ENDPOINTS.users, { params });
};

// Get user by ID
export const getUserById = async (id) => {
  return await apiClient.get(`${ADMIN_ENDPOINTS.users}/${id}`);
};

// Update user
export const updateUser = async (id, userData) => {
  return await apiClient.put(`${ADMIN_ENDPOINTS.users}/${id}`, userData);
};

// Delete user
export const deleteUser = async (id) => {
  return await apiClient.delete(`${ADMIN_ENDPOINTS.users}/${id}`);
};

// Get store settings
export const getSettings = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.settings);
};

// Update store settings
export const updateSettings = async (settingsData) => {
  return await apiClient.put(ADMIN_ENDPOINTS.settings, settingsData);
};