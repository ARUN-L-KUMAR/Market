const Order = require('../models/order.model');
const { io } = require('../utils/socket');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, subtotal, tax, shipping, total, shippingAddress, paymentMethod, paymentStatus } = req.body;
    
    // Generate order number
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);
    
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      status: 'processing'
    });
    
    // Populate user information for the admin dashboard
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    
    // Emit socket event to admin room for real-time updates (if socket is available)
    if (io) {
      io.to('adminRoom').emit('newOrder', {
        _id: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        user: populatedOrder.user,
        totalAmount: populatedOrder.total,
        status: populatedOrder.status,
        createdAt: populatedOrder.createdAt
      });
    }
    
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product');
    // Return array directly for frontend compatibility
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Add real-time order updates
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id, 
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('user');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Emit socket event for real-time updates (if socket is available)
    if (io) {
      io.to(`user_${order.user._id}`).emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        updatedAt: order.updatedAt
      });
    }
    
    res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// Get a single order by ID for the logged-in user
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only allow the user who owns the order to view it
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};