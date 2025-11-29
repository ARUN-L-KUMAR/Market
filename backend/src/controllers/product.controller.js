const Product = require('../models/product.model');
const Review = require('../models/review.model'); // Import Review model to ensure it's registered
const { io } = require('../utils/socket');

// Get products with filters, pagination
exports.getProducts = async (req, res, next) => {
  try {
    const { category, size, color, minPrice, maxPrice, page = 1, limit = 20, search } = req.query;
    const filter = {};
    
    if (category && category !== 'all') {
      try {
        // Find category by name instead of using the ID directly
        const Category = require('../models/category.model');
        const categoryObj = await Category.findOne({ 
          $or: [
            { name: category }, 
            { slug: category.toLowerCase() }
          ] 
        });
        
        if (categoryObj) {
          filter.category = categoryObj._id;
        }
      } catch (err) {
        console.error('Error finding category:', err);
      }
    }
    
    if (size) filter.sizes = size;
    if (color) filter.colors = color;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (search) filter.title = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('category')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        options: { limit: 2 }
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({ products, total });
  } catch (err) {
    next(err);
  }
};

// Get single product
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Create product (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    // Emit to all clients (if socket is available)
    if (io) {
      io.emit('productCreated', { product });
      
      // Emit to admin room for dashboard updates
      io.to('adminRoom').emit('productActivity', {
        type: 'PRODUCT_CREATED',
        productId: product._id,
        productName: product.title,
        action: 'created',
        timestamp: new Date()
      });
    }
    
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// Update product (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    console.log('📝 Updating product:', req.params.id);
    console.log('📦 Update data:', JSON.stringify(req.body, null, 2));
    
    // Use MongoDB collection directly to completely bypass Mongoose validation
    const mongoose = require('mongoose');
    const result = await mongoose.connection.collection('products').updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ Product not found:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Fetch the updated product using findOne to avoid validation
    const product = await Product.findById(req.params.id).lean();
    console.log('✅ Product updated successfully:', product.title);
    
    // Emit to all clients (if socket is available)
    if (io) {
      io.emit('productUpdated', { product });
      
      // Emit to admin room for dashboard updates
      io.to('adminRoom').emit('productActivity', {
        type: 'PRODUCT_UPDATED',
        productId: product._id,
        productName: product.title,
        action: 'updated',
        timestamp: new Date(),
        changes: req.body
      });
      
      // If stock was updated, emit a specific stock update event
      if (req.body.stock !== undefined) {
        io.to(`product-${product._id}`).emit('stockUpdate', {
          productId: product._id,
          stock: product.stock,
          timestamp: new Date()
        });
      }
    }
    
    res.json(product);
  } catch (err) {
    console.error('❌ Error updating product:', err);
    console.error('❌ Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    next(err);
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Emit to all clients (if socket is available)
    if (io) {
      io.emit('productDeleted', { id: req.params.id });
      
      // Emit to admin room for dashboard updates
      io.to('adminRoom').emit('productActivity', {
        type: 'PRODUCT_DELETED',
        productId: product._id,
        productName: product.title,
        action: 'deleted',
        timestamp: new Date()
      });
    }
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// Get all products (admin)
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        options: { limit: 2 }
      });
    res.json({ products });
  } catch (err) {
    next(err);
  }
};