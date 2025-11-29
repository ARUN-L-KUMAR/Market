const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const productInitController = require('../controllers/product.init');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/version', (req, res) => res.json({ version: '2.0-direct-update', timestamp: new Date() }));
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), productController.createProduct);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), productController.updateProduct);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), productController.deleteProduct);
router.get('/admin/all', authMiddleware.protect, authMiddleware.restrictTo('admin'), productController.getAllProducts);

// Development/testing routes
router.post('/init', productInitController.initializeProducts);

module.exports = router; 