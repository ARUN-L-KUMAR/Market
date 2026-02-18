import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Modular Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import Revenue from '../pages/admin/Revenue';
import Sales from '../pages/admin/Sales';
import Products from '../pages/admin/Products';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import Categories from '../pages/admin/Categories';
import Orders from '../pages/admin/Orders';
import OrderDetail from '../pages/admin/OrderDetail';
import Users from '../pages/admin/Users';
import AdminUsers from '../pages/admin/AdminUsers';
import CustomerList from '../pages/admin/CustomerList';
import StockManagement from '../pages/admin/StockManagement';
import Activity from '../pages/admin/Activity';
import LowStock from '../pages/admin/LowStock';
import OutOfStock from '../pages/admin/OutOfStock';
import RestockHistory from '../pages/admin/RestockHistory';
import MovementLogs from '../pages/admin/MovementLogs';
import Traffic from '../pages/admin/Traffic';
import Settings from '../pages/admin/Settings';
import RolesAndPermissions from '../pages/admin/RolesAndPermissions';
import UserProfile from '../pages/admin/UserProfile';
import BlockedUsers from '../pages/admin/BlockedUsers';
import Brands from '../pages/admin/Brands';
import Variants from '../pages/admin/Variants';
import BulkUpload from '../pages/admin/BulkUpload';
import DraftProducts from '../pages/admin/DraftProducts';
import PlaceholderAdminPage from '../pages/admin/PlaceholderAdminPage';
import { Navigate } from 'react-router-dom';

/**
 * Admin routes configuration
 * All routes are protected and require admin privileges
 */
const AdminRoutes = [
  // Dashboard Sections
  <Route key="admin-dashboard" path="/admin" element={<ProtectedRoute adminOnly={true}><Dashboard /></ProtectedRoute>} />,
  <Route key="admin-revenue" path="/admin/revenue" element={<ProtectedRoute adminOnly={true}><Revenue /></ProtectedRoute>} />,
  <Route key="admin-sales" path="/admin/sales" element={<ProtectedRoute adminOnly={true}><Sales /></ProtectedRoute>} />,
  <Route key="admin-traffic" path="/admin/traffic" element={<ProtectedRoute adminOnly={true}><Traffic /></ProtectedRoute>} />,
  <Route key="admin-activity" path="/admin/activity" element={<ProtectedRoute adminOnly={true}><Activity /></ProtectedRoute>} />,

  // Products Sections
  <Route key="admin-products" path="/admin/products" element={<ProtectedRoute adminOnly={true}><Products /></ProtectedRoute>} />,
  <Route key="admin-products-add" path="/admin/products/add" element={<ProtectedRoute adminOnly={true}><AddProduct /></ProtectedRoute>} />,
  <Route key="admin-products-categories" path="/admin/products/categories" element={<ProtectedRoute adminOnly={true}><Categories /></ProtectedRoute>} />,
  <Route key="admin-products-brands" path="/admin/products/brands" element={<ProtectedRoute adminOnly={true}><Brands /></ProtectedRoute>} />,
  <Route key="admin-products-variants" path="/admin/products/variants" element={<ProtectedRoute adminOnly={true}><Variants /></ProtectedRoute>} />,
  <Route key="admin-products-bulk" path="/admin/products/bulk" element={<ProtectedRoute adminOnly={true}><BulkUpload /></ProtectedRoute>} />,
  <Route key="admin-products-drafts" path="/admin/products/drafts" element={<ProtectedRoute adminOnly={true}><DraftProducts /></ProtectedRoute>} />,
  <Route key="admin-products-edit" path="/admin/products/:id/edit" element={<ProtectedRoute adminOnly={true}><EditProduct /></ProtectedRoute>} />,

  // Orders Sections
  <Route key="admin-orders" path="/admin/orders" element={<ProtectedRoute adminOnly={true}><Orders /></ProtectedRoute>} />,
  <Route key="admin-orders-pending" path="/admin/orders/pending" element={<ProtectedRoute adminOnly={true}><Navigate to="/admin/orders?status=pending" replace /></ProtectedRoute>} />,
  <Route key="admin-orders-processing" path="/admin/orders/processing" element={<ProtectedRoute adminOnly={true}><Navigate to="/admin/orders?status=processing" replace /></ProtectedRoute>} />,
  <Route key="admin-orders-shipped" path="/admin/orders/shipped" element={<ProtectedRoute adminOnly={true}><Navigate to="/admin/orders?status=shipped" replace /></ProtectedRoute>} />,
  <Route key="admin-orders-delivered" path="/admin/orders/delivered" element={<ProtectedRoute adminOnly={true}><Navigate to="/admin/orders?status=completed" replace /></ProtectedRoute>} />,
  <Route key="admin-orders-cancelled" path="/admin/orders/cancelled" element={<ProtectedRoute adminOnly={true}><Navigate to="/admin/orders?status=cancelled" replace /></ProtectedRoute>} />,
  <Route key="admin-orders-returns" path="/admin/orders/returns" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,
  <Route key="admin-orders-payments" path="/admin/orders/payments" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,
  <Route key="admin-order-detail" path="/admin/orders/:id" element={<ProtectedRoute adminOnly={true}><OrderDetail /></ProtectedRoute>} />,

  // Users Sections
  <Route key="admin-users" path="/admin/users" element={<ProtectedRoute adminOnly={true}><Users /></ProtectedRoute>} />,
  <Route key="admin-users-customers" path="/admin/users/customers" element={<ProtectedRoute adminOnly={true}><CustomerList /></ProtectedRoute>} />,
  <Route key="admin-users-admins" path="/admin/users/admins" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />,
  <Route key="admin-users-roles" path="/admin/users/roles" element={<ProtectedRoute adminOnly={true}><RolesAndPermissions /></ProtectedRoute>} />,
  <Route key="admin-users-blocked" path="/admin/users/blocked" element={<ProtectedRoute adminOnly={true}><BlockedUsers /></ProtectedRoute>} />,
  <Route key="admin-user-detail" path="/admin/users/:id" element={<ProtectedRoute adminOnly={true}><UserProfile /></ProtectedRoute>} />,

  // Other Major Sections
  <Route key="admin-reviews" path="/admin/reviews" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,
  <Route key="admin-finance" path="/admin/finance/*" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,
  <Route key="admin-shipping" path="/admin/shipping/*" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,
  <Route key="admin-inventory-master" path="/admin/inventory/master" element={<ProtectedRoute adminOnly={true}><StockManagement /></ProtectedRoute>} />,
  <Route key="admin-inventory-low" path="/admin/inventory/low" element={<ProtectedRoute adminOnly={true}><LowStock /></ProtectedRoute>} />,
  <Route key="admin-inventory-out" path="/admin/inventory/out" element={<ProtectedRoute adminOnly={true}><OutOfStock /></ProtectedRoute>} />,
  <Route key="admin-inventory-history" path="/admin/inventory/history" element={<ProtectedRoute adminOnly={true}><RestockHistory /></ProtectedRoute>} />,
  <Route key="admin-inventory-logs" path="/admin/inventory/logs" element={<ProtectedRoute adminOnly={true}><MovementLogs /></ProtectedRoute>} />,
  <Route key="admin-inventory-alerts" path="/admin/inventory/*" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,
  <Route key="admin-marketing" path="/admin/marketing/*" element={<ProtectedRoute adminOnly={true}><PlaceholderAdminPage /></ProtectedRoute>} />,

  // Settings Sections
  <Route key="admin-settings" path="/admin/settings" element={<ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>} />,
  <Route key="admin-settings-sub" path="/admin/settings/*" element={<ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>} />,
];

export default AdminRoutes;