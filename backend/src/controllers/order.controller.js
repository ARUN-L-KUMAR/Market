const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { io } = require('../utils/socket');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, subtotal, tax, shipping, total, shippingAddress, paymentMethod, paymentStatus } = req.body;
    // Generate order number
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);

    // Validate required fields
    if (!items || !items.length || !shippingAddress || !paymentMethod || !total) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    // Validate stock availability and deduct stock
    const stockErrors = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        stockErrors.push(`Product not found: ${item.product}`);
        continue;
      }
      if (product.stock < item.quantity) {
        stockErrors.push(`Insufficient stock for "${product.title}": requested ${item.quantity}, available ${product.stock}`);
        continue;
      }
      stockUpdates.push({ productId: product._id, quantity: item.quantity, product });
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ message: 'Stock validation failed', errors: stockErrors });
    }

    // Deduct stock for all items
    const Movement = require('../models/movement.model');
    for (const update of stockUpdates) {
      const prevStock = update.product.stock;
      const currentStock = prevStock - update.quantity;

      await Product.findByIdAndUpdate(
        update.productId,
        { $inc: { stock: -update.quantity } }
      );

      // Log movement
      await Movement.create({
        product: update.productId,
        type: 'out',
        quantity: update.quantity,
        reason: 'sale',
        previousStock: prevStock,
        currentStock: currentStock,
        notes: `Order #${orderNumber}`
      });

      // Emit real-time stock update
      if (io) {
        io.to(`product-${update.productId}`).emit('stockUpdate', {
          productId: update.productId,
          stock: currentStock,
          timestamp: new Date()
        });
      }
    }

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

    // Emit socket event to admin room for real-time updates
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
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for real-time updates
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
    // Only allow the user who owns the order or an admin to view it
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// Cancel order (user-initiated)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow the order owner to cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation of pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order with status "${order.status}". Only pending or processing orders can be cancelled.` });
    }

    // Restore stock for each item
    const Movement = require('../models/movement.model');
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stock;
        const currentStock = prevStock + item.quantity;

        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );

        // Log movement
        await Movement.create({
          product: item.product,
          type: 'in',
          quantity: item.quantity,
          reason: 'cancellation',
          previousStock: prevStock,
          currentStock: currentStock,
          notes: `Order #${order.orderNumber} cancelled`
        });

        // Emit real-time stock update
        if (io) {
          io.to(`product-${item.product}`).emit('stockUpdate', {
            productId: item.product,
            stock: currentStock,
            timestamp: new Date()
          });
        }
      }
    }

    order.status = 'cancelled';
    order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus;
    await order.save();

    // Notify admin via socket
    if (io) {
      io.to('adminRoom').emit('orderStatusUpdate', {
        orderId: order._id,
        status: order.status,
        updatedAt: new Date()
      });
    }

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    next(err);
  }
};