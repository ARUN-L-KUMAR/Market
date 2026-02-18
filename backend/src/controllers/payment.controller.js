const crypto = require('crypto');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');

const PAYU_BASE_URL = process.env.PAYU_BASE_URL || 'https://test.payu.in/_payment';

function generateHash(data) {
  const salt = process.env.PAYU_SALT;
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
    salt
  ].join('|');

  // Debug log (masking salt)
  console.log('--- PayU Hash Debug ---');
  console.log('Hash String (no salt):', hashString.replace(salt, '********'));
  console.log('-----------------------');

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

function verifyResponseHash(params) {
  const salt = process.env.PAYU_SALT;
  // PayU reverse hash: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = [
    salt,
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
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
      console.error('PAYU Credentials missing:', { key: !!key, salt: !!salt });
      return res.status(500).json({ error: 'Payment gateway not configured. Please set PAYU_KEY and PAYU_SALT environment variables.' });
    }

    const { user, items, shippingAddress, total, email, firstname, subtotal, tax, shipping } = req.body;

    // Validate required fields
    if (!items || !shippingAddress || !total || !email || !firstname) {
      return res.status(400).json({ error: 'Missing required payment fields' });
    }

    // PayU expects amount to be a string with exactly 2 decimal places
    const formattedAmount = parseFloat(total).toFixed(2);

    // Store order as pending
    const order = new Order({
      user,
      items,
      shippingAddress,
      paymentMethod: 'payu',
      subtotal: subtotal || total,
      tax: tax || 0,
      shipping: shipping || 0,
      total: parseFloat(formattedAmount),
      status: 'pending',
      paymentStatus: 'pending'
    });
    await order.save();

    // Prepare PayU form data
    // PayU requires a UNIQUE txnid for EVERY SINGLE attempt.
    // If a user clicks back and tries again, the same order ID will fail.
    // So we append a timestamp and random string to the order ID.
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const txnid = `${order._id}-${Date.now()}-${randomSuffix}`;
    const productinfo = 'Order Payment';

    // Use the backend URL for callbacks. PayU needs to POST to these.
    // In dev, we use localhost:3001. In prod, we use the server's URL.
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;

    const payuData = {
      key: key,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      email,
      phone: shippingAddress.phone || '9999999999',
      surl: `${backendUrl}/api/payment/payu/success`,
      furl: `${backendUrl}/api/payment/payu/failure`,
      service_provider: 'payu_paisa',
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    payuData.hash = generateHash(payuData);
    payuData.action = PAYU_BASE_URL;
    payuData.orderId = order._id;

    res.json(payuData);
  } catch (err) {
    console.error('PayU initiate error:', err);
    res.status(500).json({ error: `Failed to initiate PayU payment: ${err.message}` });
  }
};

// PayU Success Callback
exports.payuSuccess = async (req, res) => {
  const params = req.body;
  const { txnid, status } = params;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  console.log('PayU Success Callback received:', { txnid, status, params: Object.keys(params) });

  try {
    // Extract the original order ID (it's before the first dash, not the last)
    // Format: orderId-timestamp-random
    const orderId = txnid.includes('-') ? txnid.split('-')[0] : txnid;
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error('Order not found for txnid:', txnid);
      return res.redirect(`${frontendUrl}/payment-failure?reason=order_not_found`);
    }

    // Verify the response hash from PayU to prevent fraud
    if (!verifyResponseHash(params)) {
      console.error('PayU hash verification failed for txnid:', txnid);
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save();
      return res.redirect(`${frontendUrl}/payment-failure?reason=hash_verification_failed`);
    }

    if (status === 'success') {
      console.log('Payment successful for order:', orderId);
      order.status = 'processing';
      order.paymentStatus = 'paid';
      await order.save();
      // Remove items from cart
      await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
      return res.redirect(`${frontendUrl}/payment-success?orderId=${order._id}`);
    } else {
      console.log('Payment not successful, status:', status);
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save();
      return res.redirect(`${frontendUrl}/payment-failure?reason=payment_declined`);
    }
  } catch (err) {
    console.error('PayU success callback error:', err.message, err.stack);
    return res.redirect(`${frontendUrl}/payment-failure?reason=server_error`);
  }
};

// PayU Failure Callback
exports.payuFailure = async (req, res) => {
  const { txnid } = req.body;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  console.log('PayU Failure Callback received for txnid:', txnid, 'Body:', req.body);

  try {
    const orderId = txnid.includes('-') ? txnid.split('-')[0] : txnid;
    const order = await Order.findById(orderId);
    if (order) {
      console.log('Marking order as failed:', orderId);
      order.status = 'cancelled';
      order.paymentStatus = 'failed';
      await order.save();
    } else {
      console.warn('Order not found in failure callback:', orderId);
    }
    return res.redirect(`${frontendUrl}/payment-failure?reason=payment_cancelled`);
  } catch (err) {
    console.error('PayU failure callback error:', err.message, err.stack);
    return res.redirect(`${frontendUrl}/payment-failure?reason=server_error`);
  }
};
