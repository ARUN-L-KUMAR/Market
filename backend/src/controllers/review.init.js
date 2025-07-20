const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

// Initialize reviews for products
exports.initializeReviews = async (req, res) => {
  try {
    // First, check if we already have reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount > 0) {
      return res.status(200).json({ message: `${reviewCount} reviews already exist. Skipping initialization.` });
    }

    // Get some products to add reviews to
    const products = await Product.find().limit(10);
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found to add reviews to' });
    }

    // Get some users who can leave reviews
    const users = await User.find().limit(5);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found to create reviews' });
    }

    // Sample review content
    const sampleReviews = [
      {
        title: 'Great product!',
        comment: 'I love this product. It exceeded my expectations in every way.',
        rating: 5
      },
      {
        title: 'Good value',
        comment: 'Good quality for the price. Would recommend to others looking for this type of item.',
        rating: 4
      },
      {
        title: 'Decent but could be better',
        comment: 'The product works as described but has some minor issues that could be improved.',
        rating: 3
      },
      {
        title: 'Not what I expected',
        comment: 'The product quality doesn\'t match the description. Somewhat disappointed.',
        rating: 2
      },
      {
        title: 'Amazing purchase',
        comment: 'One of the best purchases I\'ve made. The quality is outstanding and it looks even better in person!',
        rating: 5
      }
    ];

    const reviews = [];
    
    // Create reviews by assigning different users to different products
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // For each product, create 1-3 reviews from different users
      const numReviews = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numReviews; j++) {
        // Get a random user and review template
        const user = users[Math.floor(Math.random() * users.length)];
        const reviewTemplate = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        
        // Check if this user already reviewed this product
        const existingReview = await Review.findOne({ 
          user: user._id,
          product: product._id
        });
        
        if (!existingReview) {
          const review = new Review({
            user: user._id,
            product: product._id,
            rating: reviewTemplate.rating,
            title: reviewTemplate.title,
            comment: reviewTemplate.comment,
            isVerifiedPurchase: Math.random() > 0.3 // 70% chance of verified purchase
          });
          
          await review.save();
          reviews.push(review);
          
          // Add review to product's reviews array
          await Product.findByIdAndUpdate(
            product._id,
            { $push: { reviews: review._id } }
          );
        }
      }
      
      // Update product rating
      await updateProductRating(product._id);
    }

    res.status(200).json({ 
      message: `Successfully created ${reviews.length} reviews`,
      reviews: reviews.map(r => ({
        product: r.product,
        user: r.user,
        rating: r.rating,
        title: r.title
      })) 
    });
  } catch (err) {
    console.error('Error initializing reviews:', err);
    res.status(500).json({ message: 'Error initializing reviews', error: err.message });
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
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
}
