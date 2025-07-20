const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware.protect, orderController.createOrder);
router.get('/my', authMiddleware.protect, orderController.getUserOrders);
router.get('/:id', authMiddleware.protect, orderController.getOrderById);

module.exports = router; 