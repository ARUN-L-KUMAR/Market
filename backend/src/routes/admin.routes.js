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
router.get('/activities', adminController.getActivities);
router.get('/low-stock', adminController.getLowStock);
router.get('/out-of-stock', adminController.getOutOfStock);
router.get('/inventory-movements', adminController.getMovements);
router.get('/restock-history', adminController.getRestockHistory);
router.get('/traffic-stats', adminController.getTrafficStats);

// Orders management
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderById);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/payment-status', adminController.updatePaymentStatus);
router.delete('/orders/:id', adminController.deleteOrder);

// Returns & Refunds
router.get('/returns', adminController.getReturns);
router.post('/returns', adminController.createReturnRequest);
router.put('/returns/:id/status', adminController.updateReturnStatus);

// Payments & Transactions
router.get('/transactions', adminController.getTransactions);
router.get('/transactions/stats', adminController.getTransactionStats);

// Products management
router.get('/products', adminController.getProducts);
// Import product controller for product-specific operations
const productController = require('../controllers/product.controller');
router.post('/products', productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Users management
router.get('/users', adminController.getUsers);
router.get('/users/roles-stats', adminController.getRolesStats);
router.get('/users/admins', adminController.getAdminUsers);
router.post('/create-admin', adminController.createAdminUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Settings management
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Brands management
router.get('/brands', adminController.getBrands);
router.post('/brands', adminController.createBrand);
router.put('/brands/:id', adminController.updateBrand);
router.delete('/brands/:id', adminController.deleteBrand);

// Variants management
router.get('/variants', adminController.getVariants);
router.post('/variants', adminController.createVariant);
router.put('/variants/:id', adminController.updateVariant);
router.delete('/variants/:id', adminController.deleteVariant);

module.exports = router;
