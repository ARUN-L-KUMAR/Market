const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Legacy routes
router.get('/db-stats', adminController.getDatabaseStats);
router.get('/collection/:collection', adminController.getCollectionData);
router.get('/collection/:collection/:id', adminController.getDocumentById);

// Dashboard statistics
router.get('/stats', adminController.getStats);

// Orders management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Products management
router.get('/products', adminController.getProducts);
// Import product controller for product-specific operations
const productController = require('../controllers/product.controller');
router.post('/products', productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Users management
router.get('/users', adminController.getAllUsers);
router.get('/users/admins', adminController.getAdminUsers);
router.post('/create-admin', adminController.createAdminUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Settings management
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
