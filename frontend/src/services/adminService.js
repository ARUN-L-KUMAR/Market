import apiClient from './api';
import { API_CONFIG } from '../config/appConfig';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  stats: '/api/admin/stats',
  activities: '/api/admin/activities',
  lowStock: '/api/admin/low-stock',
  outOfStock: '/api/admin/out-of-stock',
  inventoryMovements: '/api/admin/inventory-movements',
  restockHistory: '/api/admin/restock-history',
  traffic: '/api/admin/traffic-stats',
  orders: '/api/admin/orders',
  products: '/api/admin/products',
  uploadImage: '/api/admin/products/upload-image',
  users: '/api/admin/users',
  settings: '/api/admin/settings',
  brands: '/api/admin/brands',
  variants: '/api/admin/variants',
};

export const getStats = async (period = '30days') => {
  return await apiClient.get(`${ADMIN_ENDPOINTS.stats}?period=${period}`);
};

// Get recent activities
export const getActivities = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.activities);
};

// Get low stock products
export const getLowStock = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.lowStock);
};

// Get out of stock products
export const getOutOfStock = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.outOfStock);
};

// Get inventory movements
export const getMovements = async (params = {}) => {
  return await apiClient.get(ADMIN_ENDPOINTS.inventoryMovements, { params });
};

// Get restock history
export const getRestockHistory = async (params = {}) => {
  return await apiClient.get(ADMIN_ENDPOINTS.restockHistory, { params });
};

// Get traffic statistics
export const getTrafficStats = async (period = '30days') => {
  return await apiClient.get(`${ADMIN_ENDPOINTS.traffic}?period=${period}`);
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

// Get product by ID
export const getProductById = async (id) => {
  return await apiClient.get(`${ADMIN_ENDPOINTS.products}/${id}`);
};

// Upload product image
export const uploadProductImage = async (imageData) => {
  return await apiClient.post(ADMIN_ENDPOINTS.uploadImage, { image: imageData });
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

// Get user roles statistics
export const getRolesStats = async () => {
  return await apiClient.get(`${ADMIN_ENDPOINTS.users}/roles-stats`);
};

// Get store settings
export const getSettings = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.settings);
};

// Update store settings
export const updateSettings = async (settingsData) => {
  return await apiClient.put(ADMIN_ENDPOINTS.settings, settingsData);
};

// ========================
// BRANDS
// ========================
export const getBrands = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.brands);
};

export const createBrand = async (brandData) => {
  return await apiClient.post(ADMIN_ENDPOINTS.brands, brandData);
};

export const updateBrand = async (id, brandData) => {
  return await apiClient.put(`${ADMIN_ENDPOINTS.brands}/${id}`, brandData);
};

export const deleteBrand = async (id) => {
  return await apiClient.delete(`${ADMIN_ENDPOINTS.brands}/${id}`);
};

// ========================
// VARIANTS
// ========================
export const getVariants = async () => {
  return await apiClient.get(ADMIN_ENDPOINTS.variants);
};

export const createVariant = async (variantData) => {
  return await apiClient.post(ADMIN_ENDPOINTS.variants, variantData);
};

export const updateVariant = async (id, variantData) => {
  return await apiClient.put(`${ADMIN_ENDPOINTS.variants}/${id}`, variantData);
};

export const deleteVariant = async (id) => {
  return await apiClient.delete(`${ADMIN_ENDPOINTS.variants}/${id}`);
};