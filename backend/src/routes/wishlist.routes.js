const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

// Validation middleware for product ID
const validateProductId = (req, res, next) => {
  const { productId } = req.params;
  if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }
  next();
};

// Validation middleware for comparison request
const validateComparisonRequest = (req, res, next) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: 'Product IDs array is required' });
  }
  if (productIds.length > 3) {
    return res.status(400).json({ message: 'Maximum 3 products can be compared' });
  }
  // Validate each product ID format
  const invalidIds = productIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
  if (invalidIds.length > 0) {
    return res.status(400).json({ message: 'Invalid product ID format', invalidIds });
  }
  next();
};

// Get shared wishlist (public route)
router.get('/shared/:shareToken', wishlistController.getSharedWishlist);

// All other wishlist routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Get wishlist analytics
router.get('/analytics', wishlistController.getWishlistAnalytics);

// Get wishlist recommendations
router.get('/recommendations', wishlistController.getWishlistRecommendations);

// Compare wishlist products
router.post('/compare', validateComparisonRequest, wishlistController.compareWishlistProducts);

// Share wishlist
router.post('/share', wishlistController.shareWishlist);

// Move to cart (multiple items)
router.post('/move-to-cart', wishlistController.moveToCart);

// Add product to wishlist
router.post('/:productId', validateProductId, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', validateProductId, wishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
