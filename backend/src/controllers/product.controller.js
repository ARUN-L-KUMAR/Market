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
    const {
      category,
      brand,
      size,
      color,
      minPrice,
      maxPrice,
      minRating,
      onSale,
      inStock,
      discount,
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Base active filter
    filter.isActive = true;

    if (category && category !== 'all') {
      try {
        const mongoose = require('mongoose');
        const Category = require('../models/category.model');

        // Split by comma for multi-select support
        const catIds = category.split(',').filter(id => mongoose.Types.ObjectId.isValid(id.trim()));

        if (catIds.length > 0) {
          // Check both category and subcategory fields for these IDs
          filter.$or = [
            { category: { $in: catIds } },
            { subcategory: { $in: catIds } }
          ];
        } else {
          // Fallback to name/slug search for single string
          const categoryObj = await Category.findOne({
            $or: [
              { name: new RegExp('^' + category + '$', 'i') },
              { slug: category.toLowerCase() }
            ]
          });

          if (categoryObj) {
            filter.$or = [
              { category: categoryObj._id },
              { subcategory: categoryObj._id }
            ];
          }
        }
      } catch (err) {
        console.error('Error finding category:', err.message);
      }
    }

    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      filter.brand = { $in: brands.map(b => new RegExp('^' + b + '$', 'i')) };
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    const expressions = [];
    if (discount) {
      expressions.push({
        $gte: [
          {
            $round: [
              {
                $multiply: [
                  { $divide: [{ $subtract: ["$comparePrice", "$price"] }, "$comparePrice"] },
                  100
                ]
              },
              0
            ]
          },
          Number(discount)
        ]
      });
    }

    if (onSale === 'true') {
      expressions.push({ $gt: ["$comparePrice", "$price"] });
    }

    if (expressions.length > 0) {
      if (expressions.length === 1) {
        filter.$expr = expressions[0];
      } else {
        filter.$expr = { $and: expressions };
      }
    }

    if (size) filter.sizes = { $elemMatch: { name: size } };
    if (color) filter.colors = { $elemMatch: { name: color } };

    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    if (minRating) {
      const ratings = minRating.split(',').map(Number);
      if (ratings.length === 1) {
        filter['rating.average'] = { $gte: ratings[0] };
      } else {
        filter['rating.average'] = { $in: ratings };
      }
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: escapedSearch, $options: 'i' };

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex }, // Added shortDescription
        { brand: searchRegex },
        { categoryName: searchRegex },
        { subcategoryName: searchRegex }, // Added subcategoryName
        { tags: searchRegex }, // Simplified tag search
        { sku: searchRegex } // Added SKU to general search
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('category')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        options: { limit: 2 }
      })
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({ products, total });
  } catch (err) {
    next(err);
  }
};

// Get available filter options (brands, categories, price range)
exports.getFilterOptions = async (req, res, next) => {
  try {
    const Category = require('../models/category.model');
    const [brands, categories, priceRange] = await Promise.all([
      Product.distinct('brand', { isActive: true }),
      Category.find({ parent: null }).select('name slug'),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            min: { $min: '$price' },
            max: { $max: '$price' }
          }
        }
      ])
    ]);

    res.json({
      brands: brands.filter(Boolean).sort(),
      categories: categories,
      priceRange: priceRange[0] || { min: 0, max: 0 }
    });
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

// Get trending products — sorted by order count + rating (real data)
exports.getTrendingProducts = async (req, res, next) => {
  try {
    const { limit = 24 } = req.query;
    const Order = require('../models/order.model');

    // Aggregate order counts per product
    const orderCounts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', orderCount: { $sum: '$items.quantity' } } },
      { $sort: { orderCount: -1 } }
    ]);

    // Build a map of productId -> orderCount
    const orderCountMap = {};
    orderCounts.forEach(item => {
      orderCountMap[item._id.toString()] = item.orderCount;
    });

    // Fetch all active products
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .select('title images price comparePrice stock rating isFeatured categoryName brand createdAt discountPercentage')
      .limit(200);

    // Attach order counts and compute trending score
    const scored = products.map(p => {
      const orders = orderCountMap[p._id.toString()] || 0;
      const ratingScore = (p.rating?.average || 0) * (p.rating?.count || 0);
      const featuredBonus = p.isFeatured ? 50 : 0;
      const trendingScore = (orders * 10) + ratingScore + featuredBonus;
      return { ...p.toJSON(), orderCount: orders, trendingScore };
    });

    // Sort by trending score descending
    scored.sort((a, b) => b.trendingScore - a.trendingScore);

    res.json({
      products: scored.slice(0, Number(limit)),
      total: scored.length,
      totalOrders: orderCounts.reduce((sum, i) => sum + i.orderCount, 0)
    });
  } catch (err) {
    next(err);
  }
};

// Get new arrivals — sorted by createdAt descending
exports.getNewArrivals = async (req, res, next) => {
  try {
    const { limit = 16 } = req.query;
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .select('title images price comparePrice stock rating isFeatured categoryName brand createdAt discountPercentage')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ products, total: products.length });
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