const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const reviewInit = require('../controllers/review.init');
const { protect } = require('../middleware/auth.middleware');

// Get all reviews for a specific product
router.get('/product/:productId', reviewController.getProductReviews);

// Initialize sample reviews (development only)
router.get('/init', reviewInit.initializeReviews);

// Create a new review for a product (requires authentication)
router.post('/product/:productId', protect, reviewController.createReview);

// Update a review (requires authentication)
router.put('/:reviewId', protect, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:reviewId', protect, reviewController.deleteReview);

// Initialize reviews for a product
router.post('/init/product/:productId', reviewInit.initializeReviews);

module.exports = router;
