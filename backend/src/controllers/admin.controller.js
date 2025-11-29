const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Setting = require('../models/setting.model');

// Data administration endpoints - Only for development purposes
// Do not use these in production without proper authentication!

exports.getCollectionData = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    
    // Validate collection name to prevent security issues
    const validCollections = ['products', 'categories', 'reviews', 'users', 'orders'];
    
    if (!validCollections.includes(collection)) {
      return res.status(400).json({ 
        message: `Invalid collection name. Valid collections are: ${validCollections.join(', ')}` 
      });
    }
    
    // Get model name (singular, capitalized)
    const modelName = collection.charAt(0).toUpperCase() + 
                     collection.slice(1, -1); // Remove 's' at the end
    
    let Model;
    try {
      Model = mongoose.model(modelName);
    } catch (err) {
      return res.status(404).json({ 
        message: `Model "${modelName}" not found. Make sure it is registered.` 
      });
    }
    
    // Count total documents
    const total = await Model.countDocuments();
    
    // Get documents with pagination
    const documents = await Model.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      collection,
      total,
      skip,
      limit,
      documents
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentById = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    
    // Validate collection name
    const validCollections = ['products', 'categories', 'reviews', 'users', 'orders'];
    
    if (!validCollections.includes(collection)) {
      return res.status(400).json({ 
        message: `Invalid collection name. Valid collections are: ${validCollections.join(', ')}` 
      });
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }
    
    // Get model name (singular, capitalized)
    const modelName = collection.charAt(0).toUpperCase() + 
                     collection.slice(1, -1); // Remove 's' at the end
    
    let Model;
    try {
      Model = mongoose.model(modelName);
    } catch (err) {
      return res.status(404).json({ 
        message: `Model "${modelName}" not found. Make sure it is registered.` 
      });
    }
    
    // Find document by ID
    const document = await Model.findById(id);
    
    if (!document) {
      return res.status(404).json({ 
        message: `Document not found with ID: ${id}` 
      });
    }
    
    res.json(document);
  } catch (err) {
    next(err);
  }
};

// Get database stats
exports.getDatabaseStats = async (req, res, next) => {
  try {
    const stats = {};
    const collections = ['Product', 'Category', 'Review', 'User', 'Order'];
    
    for (const modelName of collections) {
      try {
        const Model = mongoose.model(modelName);
        stats[modelName.toLowerCase() + 's'] = await Model.countDocuments();
      } catch (err) {
        stats[modelName.toLowerCase() + 's'] = 'Model not registered';
      }
    }
    
    res.json({
      database: 'MongoDB',
      stats,
      connection: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    });
  } catch (err) {
    next(err);
  }
};

// Dashboard Statistics
exports.getStats = async (req, res, next) => {
  try {
    // Get total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Get sales data for chart (last 7 days)
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const salesData = await Order.aggregate([
      { $match: { 
        createdAt: { $gte: last7Days },
        status: { $in: ['completed', 'delivered', 'processing'] }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(5);

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }},
      { $unwind: '$productInfo' },
      { $project: {
        _id: 1,
        name: '$productInfo.name',
        price: '$productInfo.price',
        image: '$productInfo.images',
        totalSold: 1
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        salesData,
        lowStockProducts,
        topSellingProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

// Orders Management
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};

    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by order ID or customer name/email
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// Products Management
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increased to show all products
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Search by product name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Users Management
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    let query = {};

    // Filter by role if provided
    if (role && role !== 'all') {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// Admin User Management Endpoints
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getAdminUsers = async (req, res, next) => {
  try {
    const adminUsers = await User.find({ role: 'admin' }, '-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json(adminUsers);
  } catch (err) {
    next(err);
  }
};

exports.createAdminUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'admin',
      isAdmin: true
    });

    await adminUser.save();

    // Remove password from response
    const { password: _, ...userResponse } = adminUser.toObject();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: userResponse
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    user.isAdmin = role === 'admin';
    await user.save();

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: userResponse
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Settings Management
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Setting.create({
        storeName: 'My E-Commerce Store',
        storeEmail: 'store@example.com',
        storePhone: '+1 123 456 7890',
        storeAddress: '123 Main St, City, Country',
        currency: 'INR',
        taxRate: 5,
        shippingFee: 10,
        freeShippingThreshold: 100,
        features: {
          reviews: true,
          wishlist: true,
          recommendations: true,
          newsletter: true
        },
        appearance: {
          theme: 'light',
          primaryColor: '#3498db',
          secondaryColor: '#2ecc71',
          logo: '/images/logo.png'
        },
        socialLinks: {
          facebook: 'https://facebook.com/mystore',
          twitter: 'https://twitter.com/mystore',
          instagram: 'https://instagram.com/mystore'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const {
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      currency,
      taxRate,
      shippingFee,
      freeShippingThreshold,
      features,
      appearance,
      socialLinks
    } = req.body;

    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting({});
    }

    // Update fields if provided
    if (storeName) settings.storeName = storeName;
    if (storeEmail) settings.storeEmail = storeEmail;
    if (storePhone) settings.storePhone = storePhone;
    if (storeAddress) settings.storeAddress = storeAddress;
    if (currency) settings.currency = currency;
    if (taxRate !== undefined) settings.taxRate = taxRate;
    if (shippingFee !== undefined) settings.shippingFee = shippingFee;
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
    
    // Update nested objects if provided
    if (features) {
      settings.features = {
        ...settings.features,
        ...features
      };
    }
    
    if (appearance) {
      settings.appearance = {
        ...settings.appearance,
        ...appearance
      };
    }
    
    if (socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...socialLinks
      };
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};
