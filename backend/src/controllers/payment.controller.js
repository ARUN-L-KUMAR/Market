const crypto = require('crypto');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

// PayU credentials from environment variables
const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment';

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

function verifyResponseHash(params) {
  // PayU reverse hash: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = [
    PAYU_SALT,
    params.status || '',
    '', '', '', '', '',
    params.udf5 || '',
    params.udf4 || '',
    params.udf3 || '',
    params.udf2 || '',
    params.udf1 || '',
    params.email || '',
    params.firstname || '',
    params.productinfo || '',
    params.amount || '',
    params.txnid || '',
    params.key || ''
  ].join('|');
  const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  return expectedHash === params.hash;
}

exports.initiatePayU = async (req, res) => {
  try {
    if (!PAYU_KEY || !PAYU_SALT) {
      return res.status(500).json({ error: 'Payment gateway not configured. Please set PAYU_KEY and PAYU_SALT environment variables.' });
    }

    const { user, items, shippingAddress, paymentMethod, subtotal, tax, shipping, total, email, firstname } = req.body;

    // Validate required fields
    if (!items || !shippingAddress || !total || !email || !firstname) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

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
    console.error('PayU initiate error:', err.message);
    res.status(500).json({ error: 'Failed to initiate PayU payment' });
  }
};

// PayU Success Callback
exports.payuSuccess = async (req, res) => {
  const params = req.body;
  const { txnid, status } = params;

  try {
    const order = await Order.findById(txnid);
    if (!order) return res.redirect('/payment-failure?reason=order_not_found');

    // Verify the response hash from PayU to prevent fraud
    if (!verifyResponseHash(params)) {
      console.error('PayU hash verification failed for txnid:', txnid);
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save();
      return res.redirect('/payment-failure?reason=hash_verification_failed');
    }

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
    console.error('PayU success callback error:', err.message);
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
    console.error('PayU failure callback error:', err.message);
    return res.redirect('/payment-failure?reason=server_error');
  }
};
