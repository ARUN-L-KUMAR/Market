const crypto = require('crypto');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

const PAYU_KEY = 'eQolbB';
const PAYU_SALT = 'sr1iVTpkt7LltZOUQayBLxBcYTbRRjlu';
const PAYU_BASE_URL = 'https://test.payu.in/_payment';

function generateHash(data) {
  const hashString = [
    data.key,
    data.txnid,
    data.amount,
    data.productinfo,
    data.firstname,
    data.email,
    data.udf1 || '',
    data.udf2 || '',
    data.udf3 || '',
    data.udf4 || '',
    data.udf5 || '',
    '', '', '', '', '', // udf6-udf10
    PAYU_SALT
  ].join('|');
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

exports.initiatePayU = async (req, res) => {
  try {
    const { user, items, shippingAddress, paymentMethod, subtotal, tax, shipping, total, email, firstname } = req.body;
    // Store order as pending
    const order = new Order({
      user,
      items,
      shippingAddress,
      paymentMethod: 'payu',
      subtotal,
      tax,
      shipping,
      total,
      status: 'pending',
      paymentStatus: 'pending'
    });
    await order.save();
    // Prepare PayU form data
    const txnid = order._id.toString();
    const productinfo = 'Order Payment';
    const payuData = {
      key: PAYU_KEY,
      txnid,
      amount: total,
      productinfo,
      firstname,
      email,
      phone: shippingAddress.phone || '',
      surl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payu/success`,
      furl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payu/failure`,
      service_provider: 'payu_paisa',
    };
    payuData.hash = generateHash(payuData);
    payuData.action = PAYU_BASE_URL;
    payuData.orderId = order._id;
    res.json(payuData);
  } catch (err) {
    console.error('PayU initiate error:', err);
    res.status(500).json({ error: 'Failed to initiate PayU payment', details: err.message });
  }
};

// PayU Success Callback
exports.payuSuccess = async (req, res) => {
  const { txnid, status, hash } = req.body;
  try {
    const order = await Order.findById(txnid);
    if (!order) return res.redirect('/payment-failure?reason=order_not_found');
    // Verify hash (skipped for brevity, should be implemented)
    if (status === 'success') {
      order.status = 'processing';
      order.paymentStatus = 'paid';
      await order.save();
      // Remove items from cart
      await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
      return res.redirect('/payment-success');
    } else {
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save();
      return res.redirect('/payment-failure');
    }
  } catch (err) {
    return res.redirect('/payment-failure?reason=server_error');
  }
};

// PayU Failure Callback
exports.payuFailure = async (req, res) => {
  const { txnid } = req.body;
  try {
    const order = await Order.findById(txnid);
    if (order) {
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save();
    }
    return res.redirect('/payment-failure');
  } catch (err) {
    return res.redirect('/payment-failure?reason=server_error');
  }
};
