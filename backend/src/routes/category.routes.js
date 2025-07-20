const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes (protected)
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.createCategory);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.updateCategory);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), categoryController.deleteCategory);

// Development route - initialize sample categories
router.post('/init', categoryController.initializeCategories);

module.exports = router;
