const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [wishlistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for total items count
wishlistSchema.virtual('totalItems').get(function() {
  return this.products.length;
});

// Virtual for total value (requires populated products)
wishlistSchema.virtual('totalValue').get(function() {
  if (!this.populated('products.product')) return 0;
  return this.products.reduce((total, item) => {
    return total + (item.product.price || 0);
  }, 0);
});

// Ensure virtual fields are serialized
wishlistSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);