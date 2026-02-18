const Product = require('../models/product.model');
const Review = require('../models/review.model'); // Ensure Review model is registered
const { io } = require('../utils/socket');
const { uploadImage, deleteImages } = require('../utils/cloudinary');


// Whitelist of fields allowed for product updates
const ALLOWED_UPDATE_FIELDS = [
  'title', 'description', 'shortDescription', 'images', 'category', 'categoryName', 'subcategory', 'subcategoryName',
  'brand', 'sku', 'sizes', 'colors', 'price', 'comparePrice', 'costPrice',
  'stock', 'lowStockThreshold', 'weight', 'dimensions', 'tags',
  'isActive', 'isFeatured', 'seoTitle', 'seoDescription', 'seoKeywords'
];

// Sanitize update body to only include allowed fields
function sanitizeUpdateBody(body) {
  const sanitized = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (body[key] !== undefined) {
      sanitized[key] = body[key];
    }
  }
  return sanitized;
}

// Get products with filters, pagination
exports.getProducts = async (req, res, next) => {
  try {
    const { category, size, color, minPrice, maxPrice, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      try {
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
        console.error('Error finding category:', err.message);
      }
    }

    if (size) filter.sizes = size;
    if (color) filter.colors = color;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (search) {
      // Escape special regex characters to prevent ReDoS
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escapedSearch, $options: 'i' };
    }

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
    const sanitizedBody = sanitizeUpdateBody(req.body);
    const product = new Product(sanitizedBody);
    await product.save();

    // Emit to all clients
    if (io) {
      io.emit('productCreated', { product });
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

// Update product (admin) — uses Mongoose validation
exports.updateProduct = async (req, res, next) => {
  try {
    const sanitizedBody = sanitizeUpdateBody(req.body);

    // If stock is being updated, log the movement
    if (sanitizedBody.stock !== undefined) {
      const Movement = require('../models/movement.model');
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.stock !== sanitizedBody.stock) {
        const diff = sanitizedBody.stock - oldProduct.stock;
        await Movement.create({
          product: oldProduct._id,
          type: diff > 0 ? 'in' : 'out',
          quantity: Math.abs(diff),
          reason: diff > 0 ? 'restock' : 'adjustment',
          previousStock: oldProduct.stock,
          currentStock: sanitizedBody.stock,
          performedBy: req.user?._id,
          notes: 'Manual update from Admin Panel'
        });
      }
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    Object.keys(sanitizedBody).forEach(key => {
      product[key] = sanitizedBody[key];
    });

    await product.save();

    // Emit to all clients
    if (io) {
      io.emit('productUpdated', { product });
      io.to('adminRoom').emit('productActivity', {
        type: 'PRODUCT_UPDATED',
        productId: product._id,
        productName: product.title,
        action: 'updated',
        timestamp: new Date(),
        changes: Object.keys(sanitizedBody)
      });

      // If stock was updated, emit a specific stock update event
      if (sanitizedBody.stock !== undefined) {
        io.to(`product-${product._id}`).emit('stockUpdate', {
          productId: product._id,
          stock: product.stock,
          timestamp: new Date()
        });
      }
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Delete product (admin) — with smart Cloudinary image cleanup
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Clean up Cloudinary images using the smart utility (extracts publicId from URL if needed)
    if (product.images && product.images.length > 0) {
      deleteImages(product.images).catch(err => {
        console.error(`Background cleanup failed for product ${product._id}:`, err.message);
      });
    }
    // Emit to all clients
    if (io) {
      io.emit('productDeleted', { id: req.params.id });
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

// Get all products (admin) — with pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find()
        .populate('category')
        .populate({
          path: 'reviews',
          select: 'rating comment user createdAt',
          options: { limit: 2 }
        })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments()
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// Upload image to Cloudinary (admin)
exports.uploadImage = async (req, res, next) => {
  try {
    // Expecting base64 string or image URL in req.body.image
    const { image, folder = 'products' } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    const result = await uploadImage(image, { folder });

    res.status(200).json({
      success: true,
      image: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height
      }
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
  }
};