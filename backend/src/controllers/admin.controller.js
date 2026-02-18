const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Setting = require('../models/setting.model');
const Visit = require('../models/visit.model');
const Brand = require('../models/brand.model');
const Variant = require('../models/variant.model');

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
    const period = req.query.period || '30days';
    let days = 30;
    let startDate = null;

    if (period !== 'all') {
      if (period === '7days') days = 7;
      else if (period === '30days') days = 30;
      else if (period === '90days') days = 90;
      else if (period === '365days') days = 365;

      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    }

    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};
    const statusList = ['completed', 'delivered', 'shipped', 'paid', 'success', 'Delivered', 'Success', 'Paid', 'Completed', 'Processing'];

    // Previous period for growth calculation
    let prevStartDate = null;
    let prevEndDate = null;
    if (startDate) {
      prevEndDate = new Date(startDate);
      prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
    }
    const prevDateFilter = prevStartDate ? { createdAt: { $gte: prevStartDate, $lt: prevEndDate } } : null;

    // Get total revenue for the period
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: statusList },
          ...dateFilter
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get previous revenue for growth
    let prevRevenue = 0;
    if (prevDateFilter) {
      const prevRevData = await Order.aggregate([
        { $match: { status: { $in: statusList }, ...prevDateFilter } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      prevRevenue = prevRevData.length > 0 ? prevRevData[0].total : 0;
    }
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Get total orders for the period
    const totalOrders = await Order.countDocuments(dateFilter);
    let prevOrders = 0;
    if (prevDateFilter) prevOrders = await Order.countDocuments(prevDateFilter);
    const ordersGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

    // Get total users (absolute)
    const totalUsers = await User.countDocuments();
    let prevTotalUsers = 0;
    if (prevDateFilter) prevTotalUsers = await User.countDocuments({ createdAt: { $lt: prevEndDate } });
    const usersGrowth = prevTotalUsers > 0 ? ((totalUsers - prevTotalUsers) / prevTotalUsers) * 100 : 0;

    // Conversion Rate calculation
    const visits = await Visit.countDocuments(dateFilter);
    const conversionRate = visits > 0 ? (totalOrders / visits) * 100 : 0;

    // Revenue by Category
    const revenueByCategory = await Order.aggregate([
      { $match: { status: { $in: statusList }, ...dateFilter } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          amount: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Get total products (absolute)
    const totalProducts = await Product.countDocuments();
    let prevTotalProducts = 0;
    if (prevDateFilter) prevTotalProducts = await Product.countDocuments({ createdAt: { $lt: prevEndDate } });
    const productsGrowth = prevTotalProducts > 0 ? ((totalProducts - prevTotalProducts) / prevTotalProducts) * 100 : 0;

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Get sales data for chart
    const dateFormat = period === 'all' ? '%Y-%m' : '%Y-%m-%d';
    const rawSalesData = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: statusList }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          sales: 1,
          orders: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fill missing dates with 0 for a continuous chart
    const salesData = [];
    let current = startDate ? new Date(startDate) : null;

    if (period === 'all') {
      const firstOrder = await Order.findOne().sort({ createdAt: 1 });
      current = firstOrder ? new Date(firstOrder.createdAt) : new Date();
      current.setDate(1); // Start of month
    }

    if (current) {
      const end = new Date();
      const dataMap = rawSalesData.reduce((acc, item) => {
        acc[item.date] = item;
        return acc;
      }, {});

      while (current <= end) {
        const key = current.toISOString().split('T')[0].substring(0, period === 'all' ? 7 : 10);
        if (!salesData.find(d => d.date === key)) {
          salesData.push({
            date: key,
            sales: dataMap[key]?.sales || 0,
            orders: dataMap[key]?.orders || 0
          });
        }

        if (period === 'all') current.setMonth(current.getMonth() + 1);
        else current.setDate(current.getDate() + 1);
      }
    } else {
      // Fallback to raw data if no start date could be determined
      salesData.push(...rawSalesData);
    }

    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 })
      .limit(5);

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $match: dateFilter },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          name: '$productInfo.title',
          price: '$productInfo.price',
          image: { $arrayElemAt: ['$productInfo.images.url', 0] },
          totalSold: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        revenueGrowth,
        totalOrders,
        ordersGrowth,
        totalProducts,
        productsGrowth,
        totalUsers,
        usersGrowth,
        conversionRate,
        revenueByCategory,
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
    const subcategory = req.query.subcategory;
    const categoryName = req.query.categoryName;
    const subcategoryName = req.query.subcategoryName;
    const search = req.query.search;

    let query = {};

    // Filter by category or subcategory (ID or Name)
    if (categoryName || subcategoryName) {
      if (categoryName) query.categoryName = categoryName;
      if (subcategoryName) query.subcategoryName = subcategoryName;
    } else if (category && subcategory) {
      query.category = category;
      query.subcategory = subcategory;
    } else if (subcategory) {
      query.subcategory = subcategory;
    } else if (category) {
      query.$or = [
        { category: category },
        { subcategory: category }
      ];
    }

    // New: Filter by Brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // New: Filter by Stock Status
    if (req.query.stockStatus) {
      const status = req.query.stockStatus;
      if (status === 'In Stock') {
        query.stock = { $gt: 10 };
      } else if (status === 'Low Stock') {
        query.stock = { $gt: 0, $lte: 10 };
      } else if (status === 'Out of Stock') {
        query.stock = { $lte: 0 };
      }
    }

    // Search by product name, description, SKU, or category names
    if (search) {
      const searchCondition = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { categoryName: { $regex: search, $options: 'i' } },
          { subcategoryName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };

      if (Object.keys(query).length > 0) {
        // If query already has filters, use $and to combine
        if (query.$or) {
          query.$and = [{ $or: query.$or }, searchCondition];
          delete query.$or;
        } else {
          // Flatten existing query into $and if needed or just add $and
          const existingFilters = { ...query };
          query = { $and: [existingFilters, searchCondition] };
        }
      } else {
        query = searchCondition;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name')
      .populate('subcategory', 'name');

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
    const isActive = req.query.isActive;

    let query = {};

    // Filter by role if provided
    if (role && role !== 'all') {
      query.role = role;
    }

    // Filter by isActive status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);

    // Convert to aggregate for complex metrics
    const users = await User.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.total' }
        }
      },
      { $project: { password: 0, orders: 0 } }
    ]);

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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    const userData = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.total' },
          recentOrders: {
            $map: {
              input: {
                $slice: [
                  {
                    $sortArray: {
                      input: '$orders',
                      sortBy: { createdAt: -1 }
                    }
                  },
                  5
                ]
              },
              as: 'order',
              in: {
                _id: '$$order._id',
                orderNumber: '$$order.orderNumber',
                totalAmount: '$$order.total',
                status: '$$order.status',
                createdAt: '$$order.createdAt',
                items: '$$order.items'
              }
            }
          }
        }
      },
      { $project: { password: 0, orders: 0 } }
    ]);

    if (!userData || userData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userData[0]
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
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
    // Return all users who are not standard 'user' role
    const adminUsers = await User.find({ role: { $ne: 'user' } }, '-password')
      .sort({ createdAt: -1 });

    res.status(200).json(adminUsers);
  } catch (err) {
    next(err);
  }
};

exports.createAdminUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role = 'admin' } = req.body;

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
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      role,
      isAdmin: true,
      isEmailVerified: true // Admins are verified by default
    });

    await adminUser.save();

    // Remove password from response
    const adminResponse = adminUser.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      data: adminResponse
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
        },
        inventoryAutomation: {
          enabled: false,
          threshold: 10,
          autoRestockAmount: 50,
          supplierEmail: '',
          notifySupplier: false
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
      socialLinks,
      inventoryAutomation
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

    if (inventoryAutomation) {
      settings.inventoryAutomation = {
        ...settings.inventoryAutomation,
        ...inventoryAutomation
      };
    }

    settings.updatedAt = Date.now();

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
};

exports.getRolesStats = async (req, res, next) => {
  try {
    const rolesStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Map to a more friendly format
    const statsArr = rolesStats || [];
    const stats = {
      admin: statsArr.find(r => r._id === 'admin')?.count || 0,
      user: statsArr.find(r => r._id === 'user')?.count || 0,
      manager: statsArr.find(r => r._id === 'manager')?.count || 0,
      inventory: statsArr.find(r => r._id === 'inventory')?.count || 0,
      order_processor: statsArr.find(r => r._id === 'order_processor')?.count || 0,
      support: statsArr.find(r => r._id === 'support')?.count || 0,
      marketing: statsArr.find(r => r._id === 'marketing')?.count || 0,
      finance: statsArr.find(r => r._id === 'finance')?.count || 0,
      engineer: statsArr.find(r => r._id === 'engineer')?.count || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// Get recent activities combined feed
exports.getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [recentOrders, recentUsers, lowStockProducts] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name email createdAt'),
      Product.find({ stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(5)
    ]);

    const activities = [
      ...recentOrders.map(order => ({
        _id: order._id,
        type: 'order',
        title: `New Order #${order.orderNumber}`,
        description: `Order placed by ${order.user?.name || 'Guest'} for ₹${order.total}`,
        createdAt: order.createdAt,
        time: order.createdAt,
        user: order.user,
        status: order.status
      })),
      ...recentUsers.map(user => ({
        _id: user._id,
        type: 'user',
        title: 'New User Registered',
        description: `${user.name} signed up with ${user.email}`,
        createdAt: user.createdAt,
        time: user.createdAt,
        user: { _id: user._id, name: user.name, email: user.email }
      })),
      ...lowStockProducts.map(product => ({
        _id: product._id,
        type: 'low_stock',
        title: 'Low Stock Alert',
        description: `${product.title} has only ${product.stock} units left`,
        createdAt: product.updatedAt,
        time: product.updatedAt,
        data: { _id: product._id }
      }))
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (err) {
    next(err);
  }
};

// Get low stock products alert
exports.getLowStock = async (req, res, next) => {
  try {
    const products = await Product.find({
      $or: [
        { stock: { $lte: 10 } },
        { $expr: { $lte: ["$stock", "$lowStockThreshold"] } }
      ]
    }).sort({ stock: 1 }).populate('category', 'name');

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// Get traffic statistics - Aggregated from real Visit model
exports.getTrafficStats = async (req, res, next) => {
  try {
    const period = req.query.period || '30days';
    let days = 30;
    let startDate = null;

    // For the chart, we still want a manageable amount of days even if 'all' is selected
    let chartDays = 30;

    if (period === '7days') {
      days = 7;
      chartDays = 7;
    } else if (period === '30days') {
      days = 30;
      chartDays = 30;
    } else if (period === '90days') {
      days = 90;
      chartDays = 90;
    } else if (period === 'all') {
      days = 180; // Show last 6 months on chart
      chartDays = 180;
      startDate = null; // No limit for summary
    }

    const summaryStartDate = startDate || (period === 'all' ? new Date(0) : new Date(new Date().setDate(new Date().getDate() - days)));
    const chartStartDate = new Date();
    chartStartDate.setDate(chartStartDate.getDate() - chartDays);
    chartStartDate.setHours(0, 0, 0, 0);

    const dateFilter = period === 'all' ? {} : { createdAt: { $gte: chartStartDate } };

    // Aggregate visits by day for chart
    const trafficData = await Visit.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          visits: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ip" }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          visits: 1,
          uniqueUsers: { $size: "$uniqueUsers" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fill in gaps with zero values for days with no traffic
    const filledData = [];
    for (let i = chartDays; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const existingDay = trafficData.find(item => item.date === dateStr);
      if (existingDay) {
        filledData.push(existingDay);
      } else {
        filledData.push({
          date: dateStr,
          visits: 0,
          uniqueUsers: 0
        });
      }
    }

    // Summary calculations
    const totalVisitsCount = await Visit.countDocuments(period === 'all' ? {} : { createdAt: { $gte: chartStartDate } });
    const totalUniqueUsers = (await Visit.distinct('ip', (period === 'all' ? {} : { createdAt: { $gte: chartStartDate } }))).length;

    // Previous period for growth
    let prevTrafficStartDate = null;
    let prevTrafficEndDate = chartStartDate;
    if (period !== 'all') {
      prevTrafficStartDate = new Date(chartStartDate);
      prevTrafficStartDate.setDate(prevTrafficStartDate.getDate() - chartDays);
    }
    const prevTrafficFilter = prevTrafficStartDate ? { createdAt: { $gte: prevTrafficStartDate, $lt: prevTrafficEndDate } } : null;

    let prevVisits = 0;
    if (prevTrafficFilter) prevVisits = await Visit.countDocuments(prevTrafficFilter);
    const visitsGrowth = prevVisits > 0 ? ((totalVisitsCount - prevVisits) / prevVisits) * 100 : 0;

    // Active Now - Visits in last 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeNow = (await Visit.distinct('ip', { createdAt: { $gte: fiveMinsAgo } })).length;

    // Bounce Rate Estimation - Percentage of users with only 1 visit in the period
    const bounceData = await Visit.aggregate([
      { $match: period === 'all' ? {} : { createdAt: { $gte: chartStartDate } } },
      { $group: { _id: "$ip", count: { $sum: 1 } } },
      { $group: { _id: null, singleVisits: { $sum: { $cond: [{ $eq: ["$count", 1] }, 1, 0] } }, totalUsers: { $sum: 1 } } }
    ]);
    const bounceRate = bounceData.length > 0 ? ((bounceData[0].singleVisits / bounceData[0].totalUsers) * 100).toFixed(1) + "%" : "0%";

    // Additional insights
    const insightsFilter = period === 'all' ? {} : { createdAt: { $gte: chartStartDate } };
    const topSources = await Visit.aggregate([
      { $match: insightsFilter },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const deviceStats = await Visit.aggregate([
      { $match: insightsFilter },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalVisits: totalVisitsCount,
          visitsGrowth,
          totalUniqueUsers,
          avgBounceRate: bounceRate,
          activeNow
        },
        chartData: filledData,
        insights: {
          topSources,
          deviceStats
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// --- Inventory Management Controllers ---

exports.getOutOfStock = async (req, res, next) => {
  try {
    const Product = require('../models/product.model');
    const products = await Product.find({ stock: 0 }).populate('category');
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

exports.getMovements = async (req, res, next) => {
  try {
    const Movement = require('../models/movement.model');
    const { page = 1, limit = 20, type, reason } = req.query;
    const query = {};
    if (type) query.type = type;
    if (reason) query.reason = reason;

    const skip = (page - 1) * limit;

    const movements = await Movement.find(query)
      .populate('product', 'title sku images price')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Movement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        movements,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getRestockHistory = async (req, res, next) => {
  try {
    const Movement = require('../models/movement.model');
    const { page = 1, limit = 20 } = req.query;
    const query = { reason: 'restock' };

    const skip = (page - 1) * limit;

    const history = await Movement.find(query)
      .populate('product', 'title sku images price')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Movement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ========================
// BRANDS CRUD
// ========================

exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({}).sort({ createdAt: -1 });
    // Enrich with product counts
    const Product = require('../models/product.model');
    const enriched = await Promise.all(brands.map(async (brand) => {
      const productCount = await Product.countDocuments({ brand: brand.name });
      const products = await Product.find({ brand: brand.name }).select('price stock');
      const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
      const avgPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0;
      return { ...brand.toObject(), productCount, totalStock, avgPrice };
    }));
    res.json({ success: true, brands: enriched });
  } catch (err) {
    next(err);
  }
};

exports.createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, brand });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Brand with this name already exists' });
    }
    next(err);
  }
};

exports.updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, brand });
  } catch (err) {
    next(err);
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) {
    next(err);
  }
};

// ========================
// VARIANTS CRUD
// ========================

exports.getVariants = async (req, res, next) => {
  try {
    const variants = await Variant.find({}).sort({ createdAt: -1 });
    res.json({ success: true, variants });
  } catch (err) {
    next(err);
  }
};

exports.createVariant = async (req, res, next) => {
  try {
    const variant = await Variant.create(req.body);
    res.status(201).json({ success: true, variant });
  } catch (err) {
    next(err);
  }
};

exports.updateVariant = async (req, res, next) => {
  try {
    const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });
    res.json({ success: true, variant });
  } catch (err) {
    next(err);
  }
};

exports.deleteVariant = async (req, res, next) => {
  try {
    const variant = await Variant.findByIdAndDelete(req.params.id);
    if (!variant) return res.status(404).json({ success: false, message: 'Variant not found' });
    res.json({ success: true, message: 'Variant deleted' });
  } catch (err) {
    next(err);
  }
};
