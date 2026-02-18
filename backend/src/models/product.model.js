const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
    publicId: String  // For Cloudinary image deletion
  }],
  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  categoryName: [{
    type: String,
    trim: true,
    index: true
  }],
  subcategory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  subcategoryName: [{
    type: String,
    trim: true,
    index: true
  }],
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  sizes: [{
    name: String,
    stock: { type: Number, default: 0 }
  }],
  colors: [{
    name: String,
    hexCode: String,
    stock: { type: Number, default: 0 }
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Ensure virtuals are included in JSON and object output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Generate slug from title and auto-populate category names before saving
productSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // Auto-populate categoryName array from category ObjectIds
  if (this.isModified('category') && Array.isArray(this.category) && this.category.length > 0) {
    try {
      const Category = mongoose.model('Category');
      const cats = await Category.find({ _id: { $in: this.category } }).select('name');
      this.categoryName = cats.map(c => c.name);
    } catch (e) { /* ignore */ }
  } else if (this.isModified('category') && (!this.category || this.category.length === 0)) {
    this.categoryName = [];
  }

  // Auto-populate subcategoryName array from subcategory ObjectIds
  if (this.isModified('subcategory') && Array.isArray(this.subcategory) && this.subcategory.length > 0) {
    try {
      const Category = mongoose.model('Category');
      const subs = await Category.find({ _id: { $in: this.subcategory } }).select('name');
      this.subcategoryName = subs.map(s => s.name);
    } catch (e) { /* ignore */ }
  } else if (this.isModified('subcategory') && (!this.subcategory || this.subcategory.length === 0)) {
    this.subcategoryName = [];
  }

  next();
});

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Virtual for checking if product is low stock
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);