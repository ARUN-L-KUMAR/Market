const Review = require('../models/review.model');
const Product = require('../models/product.model');
const { io } = require('../utils/socket');

// Get reviews for a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar');
    
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// Create a review
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = new Review({
      ...req.body,
      user: userId,
      product: productId
    });
    
    await review.save();
    
    // Update product rating
    await updateProductRating(productId);
    
    // Add review to product's reviews array
    await Product.findByIdAndUpdate(
      productId, 
      { $push: { reviews: review._id } }
    );
    
    // Send real-time notification
    io.emit('reviewAdded', { productId, review });
    
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// Update a review
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { ...req.body },
      { new: true }
    );
    
    // Update product rating
    await updateProductRating(review.product);
    
    // Send real-time notification
    io.emit('reviewUpdated', { productId: review.product, review: updatedReview });
    
    res.json(updatedReview);
  } catch (err) {
    next(err);
  }
};

// Delete a review
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the review belongs to the user or if admin
    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    const productId = review.product;
    
    await Review.findByIdAndDelete(reviewId);
    
    // Remove review from product's reviews array
    await Product.findByIdAndUpdate(
      productId, 
      { $pull: { reviews: reviewId } }
    );
    
    // Update product rating
    await updateProductRating(productId);
    
    // Send real-time notification
    io.emit('reviewDeleted', { productId, reviewId });
    
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    const totalReviews = reviews.length;
    
    if (totalReviews === 0) {
      await Product.findByIdAndUpdate(productId, {
        'rating.average': 0,
        'rating.count': 0
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;
    
    await Product.findByIdAndUpdate(productId, {
      'rating.average': averageRating,
      'rating.count': totalReviews
    });
    
    // Notify about updated rating
    io.emit('productRatingUpdated', {
      productId,
      rating: {
        average: averageRating,
        count: totalReviews
      }
    });
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
}
