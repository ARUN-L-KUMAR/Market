const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/payu/initiate', paymentController.initiatePayU);
router.post('/payu/success', paymentController.payuSuccess);
router.post('/payu/failure', paymentController.payuFailure);

// Stripe routes
router.post('/stripe/initiate', paymentController.initiateStripe);
router.get('/stripe/success', paymentController.stripeSuccess);

module.exports = router;
